"use client";
/* eslint-disable react-hooks/immutability -- three.js objects are mutated every frame by design */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import Laptop from "./Laptop";
import Terminal from "../terminal/Terminal";
import { Room, Desk, Chair, Shelf, Poster, Plant, Mug } from "../desk/Furniture";
import Lamp from "../desk/Lamp";
import { Paper, Pen, StickyNote, PaperPlane } from "../desk/Stationery";
import Notepad from "../desk/Notepad";
import { story, resetStory, clamp, smooth, easeInOut, PAPER } from "./story";
import { contact, profile } from "@/lib/content";

const OPEN_SECONDS = 3.4;
const CLOSE_SECONDS = 2.8;

const v = (x, y, z) => new THREE.Vector3(x, y, z);
// Centre of the laptop screen and the direction it faces when the lid is open.
const SCREEN = v(0, 1.11, -1.425);
const NORMAL = v(0, Math.sin(0.3), Math.cos(0.3));
const SCREEN_W = 2.88;
const SCREEN_H = 1.8;
const PAPER_POS = v(PAPER.x, PAPER.y, PAPER.z);

const DAY = { bg: new THREE.Color("#F4EFE6"), ambient: 0.85, key: 1.7, fill: 0.6, env: 1.1 };
const NIGHT = { bg: new THREE.Color("#0F1324"), ambient: 0.06, key: 0.08, fill: 0.12, env: 0.1 };

/* ---------- lights that fade between day and night ---------- */

function SceneLights() {
  const amb = useRef();
  const key = useRef();
  const fill = useRef();
  useFrame((state) => {
    const n = story.night;
    state.scene.background.lerpColors(DAY.bg, NIGHT.bg, n);
    state.scene.environmentIntensity = THREE.MathUtils.lerp(DAY.env, NIGHT.env, n);
    amb.current.intensity = THREE.MathUtils.lerp(DAY.ambient, NIGHT.ambient, n);
    key.current.intensity = THREE.MathUtils.lerp(DAY.key, NIGHT.key, n);
    fill.current.intensity = THREE.MathUtils.lerp(DAY.fill, NIGHT.fill, n);
  });
  return (
    <>
      <color attach="background" args={["#F4EFE6"]} />
      <ambientLight ref={amb} intensity={DAY.ambient} />
      <directionalLight ref={key} position={[3, 7, 5]} intensity={DAY.key} />
      <directionalLight ref={fill} position={[-5, 2, -3]} intensity={DAY.fill} color="#9FB2FF" />
    </>
  );
}

/* ---------- moves everything: laptop, notepad, lamp, camera ---------- */

function Director({ onOpened, onClosed, onPaperOpened, onPaperClosed }) {
  const fired = useRef({ open: false, closed: true, paperOpen: false, paperClosed: true });
  const mouse = useRef({ x: 0, y: 0 });
  const tmp = useMemo(
    () => ({ wp: v(0, 0, 0), wt: v(0, 0, 0), zp: v(0, 0, 0), pp: v(0, 0, 0), pos: v(0, 0, 0), tgt: v(0, 0, 0) }),
    []
  );

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.1);
    const t = state.clock.elapsedTime;
    const cam = state.camera;
    const aspect = state.size.width / state.size.height;
    const f = fired.current;

    // laptop
    story.k = clamp(story.k + (story.target === 1 ? d / OPEN_SECONDS : -d / CLOSE_SECONDS), 0, 1);
    story.open = smooth(0, 0.4, story.k);
    story.power = smooth(0.3, 0.55, story.k);
    story.zoom = easeInOut(smooth(0.35, 1, story.k));
    if (story.k >= 1 && !f.open) {
      Object.assign(f, { open: true, closed: false });
      onOpened();
    }
    if (story.k <= 0 && story.target === 0 && !f.closed) {
      Object.assign(f, { open: false, closed: true });
      onClosed();
    }

    // notepad
    story.pk = clamp(story.pk + (story.paperTarget === 1 ? d / 1.9 : -d / 1.5), 0, 1);
    const pz = easeInOut(story.pk);
    if (story.pk >= 1 && !f.paperOpen) {
      Object.assign(f, { paperOpen: true, paperClosed: false });
      onPaperOpened();
    }
    if (story.pk <= 0 && story.paperTarget === 0 && !f.paperClosed) {
      Object.assign(f, { paperOpen: false, paperClosed: true });
      onPaperClosed();
    }

    // desk lamp
    story.night = THREE.MathUtils.damp(story.night, story.nightTarget, 2.5, d);

    // wide shot of the desk: a slow drift, pulled back on tall phones
    const back = Math.max(1, Math.pow(1.6 / aspect, 0.8));
    tmp.wt.set(0.6, 0.1, 0);
    tmp.wp.set(Math.sin(t * 0.2) * 1.1, 4.5, 9.4).sub(tmp.wt).multiplyScalar(back).add(tmp.wt);

    // close-up: the laptop screen exactly covers the viewport
    const halfTan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const dist = Math.min(SCREEN_H / (2 * halfTan), SCREEN_W / (2 * halfTan * aspect)) * 0.9;
    tmp.zp.copy(SCREEN).addScaledVector(NORMAL, dist);

    // looking down at the notepad, far enough that the whole sheet fits
    const h = Math.max(PAPER.h / (0.78 * 2 * halfTan), PAPER.w / (0.86 * 2 * halfTan * aspect));
    tmp.pp.copy(PAPER_POS).add(v(0, h * 0.94, h * 0.34));

    mouse.current.x = THREE.MathUtils.damp(mouse.current.x, state.pointer.x, 3, d);
    mouse.current.y = THREE.MathUtils.damp(mouse.current.y, state.pointer.y, 3, d);
    const free = (1 - story.zoom) * (1 - pz);

    tmp.pos.lerpVectors(tmp.wp, tmp.zp, story.zoom).lerp(tmp.pp, pz);
    tmp.pos.x += mouse.current.x * 0.6 * free;
    tmp.pos.y += mouse.current.y * 0.35 * free;
    tmp.tgt.lerpVectors(tmp.wt, SCREEN, story.zoom).lerp(PAPER_POS, pz);

    cam.position.copy(tmp.pos);
    cam.lookAt(tmp.tgt);
  });

  return null;
}

/* ---------- the page ---------- */

export default function Experience() {
  // off | opening | on | closing | toPaper | paper | fromPaper
  const [phase, setPhase] = useState("off");
  const [termMounted, setTermMounted] = useState(false);
  const [termVisible, setTermVisible] = useState(false);
  const [noteMounted, setNoteMounted] = useState(false);
  const [noteVisible, setNoteVisible] = useState(false);
  const [frameloop, setFrameloop] = useState("always");
  const [visited, setVisited] = useState(false);
  const [night, setNight] = useState(false);
  const [hint, setHint] = useState(null);
  const [toast, setToast] = useState(null);
  const [dpr, setDpr] = useState(1.5);
  const phaseRef = useRef(phase);
  const timers = useRef([]);
  const tip = useRef(null);

  useLayoutEffect(() => resetStory(), []);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const go = (p) => {
    phaseRef.current = p;
    setPhase(p);
  };

  // tooltip follows the pointer
  useEffect(() => {
    const move = (e) => {
      if (tip.current) tip.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  const onHover = useCallback((label) => setHint(label), []);

  /* laptop */
  const turnOn = useCallback(() => {
    if (phaseRef.current !== "off") return;
    go("opening");
    setHint(null);
    story.target = 1;
    document.body.style.cursor = "";
  }, []);

  const onOpened = useCallback(() => {
    go("on");
    setTermMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setTermVisible(true)));
    // The terminal covers everything: pause the 3D renderer to save battery.
    later(() => phaseRef.current === "on" && setFrameloop("never"), 1000);
  }, []);

  const turnOff = useCallback((reason) => {
    go(reason === "paper" ? "toPaper" : "closing");
    setFrameloop("always");
    setTermVisible(false);
    later(() => {
      setTermMounted(false);
      story.target = 0;
      if (reason === "paper") story.paperTarget = 1; // glide straight from the screen to the paper
    }, 600);
  }, []);

  const onClosed = useCallback(() => {
    setVisited(true);
    if (phaseRef.current === "closing") go("off");
  }, []);

  /* notepad */
  const openPaper = useCallback(() => {
    if (phaseRef.current !== "off") return;
    go("toPaper");
    setHint(null);
    document.body.style.cursor = "";
    story.paperTarget = 1;
  }, []);

  const onPaperOpened = useCallback(() => {
    go("paper");
    setNoteMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setNoteVisible(true)));
  }, []);

  const closePaper = useCallback(() => {
    go("fromPaper");
    setNoteVisible(false);
    later(() => {
      setNoteMounted(false);
      story.paperTarget = 0;
    }, 350);
  }, []);

  const onSent = useCallback((mode) => {
    go("fromPaper");
    setNoteVisible(false);
    setNoteMounted(false);
    story.paperTarget = 0;
    story.plane = 0; // launch the paper plane
    setToast(
      mode === "sent"
        ? "Note sent ✈ — I'll reply by email soon."
        : "Your mail app opened with the note — just press send ✈"
    );
    later(() => setToast(null), 6500);
  }, []);

  const onPaperClosed = useCallback(() => go("off"), []);

  /* lamp */
  const toggleLights = useCallback(() => {
    story.nightTarget = story.nightTarget ? 0 : 1;
    setNight(!!story.nightTarget);
  }, []);

  const onTerminalAction = useCallback((name) => name === "lights" && toggleLights(), [toggleLights]);

  // Enter / Space turns the laptop on from the keyboard.
  useEffect(() => {
    const onKey = (e) => {
      if (phaseRef.current === "off" && (e.key === "Enter" || e.key === " ") && e.target === document.body) {
        e.preventDefault();
        turnOn();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turnOn]);

  const off = phase === "off";

  return (
    <>
      <div className="fixed inset-0 h-[100svh] w-full">
        <Canvas
          frameloop={frameloop}
          dpr={[1, dpr]}
          camera={{ position: [0, 4.5, 9.4], fov: 35 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onPointerMissed={() => setHint(null)}
        >
          <PerformanceMonitor onDecline={() => setDpr(1)} />
          <Director onOpened={onOpened} onClosed={onClosed} onPaperOpened={onPaperOpened} onPaperClosed={onPaperClosed} />
          <SceneLights />
          <Environment resolution={256} frames={1}>
            <Lightformer intensity={2} position={[0, 5, -2]} scale={[10, 2, 1]} />
            <Lightformer intensity={1.2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
            <Lightformer intensity={1.2} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
          </Environment>

          <Room />
          <Desk />
          <Chair />
          <Shelf />
          <Poster />
          <Plant />
          <Mug />
          <Lamp interactive={off} onHover={onHover} onToggle={toggleLights} />

          <Laptop onPress={turnOn} interactive={off} onHover={onHover} />
          <Paper interactive={off} onHover={onHover} onWrite={openPaper} />
          <Pen interactive={off} onHover={onHover} onWrite={openPaper} />
          <StickyNote />
          <PaperPlane />

          <ContactShadows position={[0, -0.059, 0]} scale={12} far={1.4} blur={2.2} opacity={0.38} resolution={512} frames={1} color="#2A1A10" />
          <ContactShadows position={[0, -4.29, 0]} scale={20} far={4.5} blur={3} opacity={0.3} resolution={256} frames={1} color="#0E1A3A" />
        </Canvas>
      </div>

      {/* hover label next to the pointer */}
      <div ref={tip} className="hover-tip" style={{ opacity: hint && off ? 1 : 0 }} aria-hidden="true">
        {hint}
      </div>

      {/* small lamp switch, top right */}
      <button
        onClick={toggleLights}
        className={`lamp-btn ${night ? "is-night" : ""}`}
        style={{ opacity: off ? 1 : 0, pointerEvents: off ? "auto" : "none" }}
        aria-label={night ? "Turn the lights on" : "Turn the lights off"}
        title={night ? "Daylight" : "Night mode"}
      >
        {night ? "☀" : "☾"}
      </button>

      {/* desk UI */}
      <div
        className={`desk-ui ${night ? "is-night" : ""}`}
        style={{ opacity: off ? 1 : 0, transform: `translateY(${off ? 0 : 16}px)` }}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={turnOn} className="desk-btn desk-btn-primary" style={{ pointerEvents: off ? "auto" : "none" }}>
            <span className="desk-btn-icon">⏻</span>
            {visited ? "Turn it on again" : "Turn it on"}
          </button>
          <button onClick={openPaper} className="desk-btn" style={{ pointerEvents: off ? "auto" : "none" }}>
            <span className="desk-btn-icon">✎</span>
            Write me a note
          </button>
        </div>
        <p className="desk-caption">
          {profile.name} — {profile.role}
        </p>
        {visited && (
          <a href={`mailto:${contact.email}`} className="desk-email" style={{ pointerEvents: off ? "auto" : "none" }}>
            {contact.email}
          </a>
        )}
      </div>

      {/* sent confirmation */}
      <div className="desk-toast" style={{ opacity: toast ? 1 : 0, transform: `translate(-50%, ${toast ? 0 : -12}px)` }} role="status">
        {toast}
      </div>

      {/* the notepad, close up */}
      {noteMounted && <Notepad visible={noteVisible} onCancel={closePaper} onSent={onSent} />}

      {/* the terminal, once the screen fills the view */}
      {termMounted && (
        <div
          className="fixed inset-0 z-20 transition-[opacity,transform,filter] duration-500 ease-out"
          style={{
            opacity: termVisible ? 1 : 0,
            transform: termVisible ? "none" : "scale(1.015)",
            filter: termVisible ? "none" : "blur(4px)",
          }}
        >
          <Terminal active={termVisible} onClose={turnOff} onAction={onTerminalAction} night={night} />
        </div>
      )}
    </>
  );
}