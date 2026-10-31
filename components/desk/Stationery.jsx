"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story, PAPER, smooth } from "../experience/story";
import { canvasTexture, FONTS } from "../experience/textures";
import { useHover } from "./useHover";

const damp = THREE.MathUtils.damp;

/* ---------- the notepad ---------- */

function useSheetTexture() {
  return useMemo(
    () =>
      canvasTexture(600, 840, (ctx, w, h) => {
        ctx.fillStyle = "#FBF8F2";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(47,75,211,0.16)";
        ctx.lineWidth = 2;
        for (let y = 170; y < h - 40; y += 42) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(220,70,80,0.35)";
        ctx.beginPath();
        ctx.moveTo(78, 0);
        ctx.lineTo(78, h);
        ctx.stroke();
        ctx.fillStyle = "#1C2E6E";
        ctx.font = `62px ${FONTS.hand()}`;
        ctx.fillText("Dear Musawir,", 100, 150);
        ctx.fillStyle = "rgba(28,46,110,0.35)";
        ctx.font = `44px ${FONTS.hand()}`;
        ctx.fillText("write me a note…", 100, 254);
      }),
    []
  );
}

export function Paper({ interactive, onHover, onWrite }) {
  const sheet = useRef();
  const group = useRef();
  const tex = useSheetTexture();
  const [hovered, handlers] = useHover("Write me a note", interactive, onHover);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    const lift = hovered.current && interactive ? 0.05 : 0;
    sheet.current.position.y = damp(sheet.current.position.y, 0.012 + lift, 10, d);

    // while the paper plane flies, a fresh sheet slides in from the right
    if (story.plane >= 0) {
      const t = story.plane;
      sheet.current.visible = t > 0.45;
      sheet.current.position.x = (1 - smooth(0.45, 1, t)) * 2.2;
    } else {
      sheet.current.visible = true;
      sheet.current.position.x = 0;
    }
  });

  return (
    <group
      ref={group}
      position={[PAPER.x, PAPER.y, PAPER.z]}
      rotation={[0, PAPER.rot, 0]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation();
        if (interactive) onWrite?.();
      }}
    >
      {/* sheets underneath */}
      {[0, 1].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, (i ? -1 : 1) * 0.03]} position={[i * 0.03, 0.002 + i * 0.003, i * 0.02]}>
          <planeGeometry args={[PAPER.w, PAPER.h]} />
          <meshStandardMaterial color="#F1ECE2" roughness={0.95} />
        </mesh>
      ))}
      <mesh ref={sheet} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[PAPER.w, PAPER.h]} />
        <meshStandardMaterial map={tex} roughness={0.95} />
      </mesh>
    </group>
  );
}

/* ---------- fountain pen ---------- */

export function Pen({ interactive, onHover, onWrite }) {
  const pen = useRef();
  const [hovered, handlers] = useHover("Write me a note", interactive, onHover);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.1);
    const h = hovered.current && interactive ? 1 : 0;
    pen.current.position.y = damp(pen.current.position.y, 0.05 + h * 0.35, 8, d);
    pen.current.rotation.z = damp(pen.current.rotation.z, Math.PI / 2 - h * 0.5, 8, d);
    pen.current.rotation.x = h ? Math.sin(state.clock.elapsedTime * 3) * 0.06 : damp(pen.current.rotation.x, 0, 8, d);
  });

  return (
    <group
      position={[4.05, -0.06, 0.25]}
      rotation={[0, 0.5, 0]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation();
        if (interactive) onWrite?.();
      }}
    >
      {/* invisible, larger hit area so the thin pen is easy to click */}
      <mesh visible={false}>
        <boxGeometry args={[1.5, 0.4, 0.4]} />
      </mesh>
      <group ref={pen} position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.045, 1.05, 20]} />
          <meshStandardMaterial color="#1C2E6E" metalness={0.5} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.053, 0.05, 0.16, 20]} />
          <meshStandardMaterial color="#C9A86A" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.045, 0.18, 20]} />
          <meshStandardMaterial color="#C9A86A" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.06, 0.32, 0]}>
          <boxGeometry args={[0.015, 0.42, 0.03]} />
          <meshStandardMaterial color="#C9A86A" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- sticky note with a hint ---------- */

export function StickyNote() {
  const tex = useMemo(
    () =>
      canvasTexture(400, 400, (ctx, w, h) => {
        ctx.fillStyle = "#F6DE74";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(0, 0, w, 46);
        ctx.fillStyle = "#1C2E6E";
        ctx.font = `52px ${FONTS.hand()}`;
        ctx.fillText("psst…", 34, 120);
        ctx.font = `44px ${FONTS.hand()}`;
        ctx.fillText("click the pen &", 34, 200);
        ctx.fillText("write me a note ✎", 34, 268);
        ctx.fillText("or turn on the laptop", 34, 336);
      }),
    []
  );
  return (
    <mesh position={[1.75, -0.046, 1.75]} rotation={[-Math.PI / 2, 0, 0.18]}>
      <planeGeometry args={[0.8, 0.8]} />
      <meshStandardMaterial map={tex} roughness={0.9} />
    </mesh>
  );
}

/* ---------- paper plane that carries a sent note away ---------- */

function usePlaneGeometry() {
  return useMemo(() => {
    // nose points along +z (Object3D.lookAt faces +z towards the target)
    const N = [0, 0, 0.7];
    const L = [-0.48, 0.1, -0.45];
    const R = [0.48, 0.1, -0.45];
    const C = [0, 0, -0.45];
    const K = [0, -0.2, -0.45];
    const v = [...N, ...L, ...C, ...N, ...C, ...R, ...N, ...C, ...K, ...N, ...K, ...C];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  }, []);
}

const P0 = new THREE.Vector3(PAPER.x, 0.3, PAPER.z);
const P1 = new THREE.Vector3(PAPER.x + 0.6, 2.6, PAPER.z + 2.2);
const P2 = new THREE.Vector3(11, 6.5, 2);

export function PaperPlane() {
  const plane = useRef();
  const geo = usePlaneGeometry();
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), n: new THREE.Vector3(), curve: new THREE.QuadraticBezierCurve3(P0, P1, P2) }), []);

  useFrame((_, dt) => {
    const m = plane.current;
    if (story.plane < 0) {
      m.visible = false;
      return;
    }
    story.plane = Math.min(1, story.plane + Math.min(dt, 0.1) / 2.8);
    const t = story.plane;
    const u = t * t * (3 - 2 * t);
    m.visible = t < 0.98;
    tmp.curve.getPoint(u, tmp.p);
    tmp.curve.getPoint(Math.min(1, u + 0.02), tmp.n);
    m.position.copy(tmp.p);
    m.lookAt(tmp.n);
    m.rotateZ(Math.sin(t * Math.PI * 2) * 0.35); // a little banking
    m.scale.setScalar(0.55 + smooth(0, 0.15, t) * 0.45);
    if (t >= 1) story.plane = -1;
  });

  return (
    <mesh ref={plane} geometry={geo} visible={false}>
      <meshStandardMaterial color="#FBF8F2" roughness={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}
