"use client";
/* eslint-disable react-hooks/immutability -- three.js objects are mutated every frame by design */

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { story, LID_OPEN, LID_CLOSED } from "./story";
import { createScreen, drawSplash, fonts } from "./screen";

const SHELL = "#2A3354";
const damp = THREE.MathUtils.damp;
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// Keyboard: one instanced mesh = one draw call for every key.
function Keyboard() {
  const ref = useRef();
  const keys = useMemo(() => {
    const out = [];
    const pitch = 0.212;
    for (let r = 0; r < 5; r++) {
      if (r < 4) {
        for (let c = 0; c < 13; c++) out.push({ x: (c - 6) * pitch, z: -0.82 + r * 0.205, w: 1 });
      } else {
        [-6, -5, -4].forEach((c) => out.push({ x: c * pitch, z: -0.82 + r * 0.205, w: 1 }));
        out.push({ x: 0, z: -0.82 + r * 0.205, w: 5.85 });
        [4, 5, 6].forEach((c) => out.push({ x: c * pitch, z: -0.82 + r * 0.205, w: 1 }));
      }
    }
    return out;
  }, []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    keys.forEach((k, i) => {
      m.compose(new THREE.Vector3(k.x, 0.075, k.z), q, new THREE.Vector3(k.w, 1, 1));
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [keys]);

  return (
    <instancedMesh ref={ref} args={[null, null, keys.length]}>
      <boxGeometry args={[0.185, 0.035, 0.18]} />
      <meshStandardMaterial color="#0E1430" roughness={0.6} metalness={0.2} />
    </instancedMesh>
  );
}

// "MR" engraved on the back of the lid — the first thing you see.
function useLogoTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const draw = () => {
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, 512, 512);
      ctx.strokeStyle = "rgba(244,239,230,0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(256, 256, 200, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(244,239,230,0.85)";
      ctx.textAlign = "center";
      ctx.font = `italic 190px ${fonts().serif}`;
      ctx.fillText("MR", 256, 318);
      tex.needsUpdate = true;
    };
    draw();
    document.fonts?.ready.then(draw);
    return tex;
  }, []);
}

export default function Laptop({ onPress, interactive, onHover }) {
  const lid = useRef();
  const screenMat = useRef();
  const glow = useRef();
  const screen = useMemo(() => (typeof document === "undefined" ? null : createScreen()), []);
  const logo = useLogoTexture();
  const drawn = useRef("");

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.1);

    // lid
    const targetAngle = THREE.MathUtils.lerp(LID_CLOSED, LID_OPEN, story.open);
    lid.current.rotation.x = damp(lid.current.rotation.x, targetAngle, 8, d);

    // screen brightness and the light it throws on the keyboard
    if (screenMat.current) screenMat.current.color.setScalar(0.03 + 0.97 * story.power);
    if (glow.current) glow.current.intensity = story.power * 2.2;

    // boot splash (only redrawn when something visible changes)
    if (!screen) return;
    const progress = Math.round(clamp01((story.k - 0.45) / 0.55) * 60) / 60;
    const label = story.target === 1 ? "establishing secure connection…" : "connection closed";
    const key = `${progress}|${label}`;
    if (key !== drawn.current) {
      drawn.current = key;
      drawSplash(screen.ctx, progress, label);
      screen.texture.needsUpdate = true;
    }
  });

  const press = (e) => {
    e.stopPropagation();
    if (interactive) onPress?.();
  };

  return (
    <group
      onClick={press}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!interactive) return;
        document.body.style.cursor = "pointer";
        onHover?.("Turn it on");
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
        onHover?.(null);
      }}
    >
      {/* base */}
      <RoundedBox args={[3.2, 0.12, 2.2]} radius={0.05} smoothness={3}>
        <meshStandardMaterial color={SHELL} roughness={0.32} metalness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.0605, -0.32]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.95, 1.12]} />
        <meshStandardMaterial color="#141B3A" roughness={0.8} />
      </mesh>
      <Keyboard />
      {/* trackpad */}
      <RoundedBox args={[1.05, 0.01, 0.62]} radius={0.004} smoothness={2} position={[0, 0.06, 0.62]}>
        <meshStandardMaterial color="#34406A" roughness={0.35} metalness={0.4} />
      </RoundedBox>
      {/* hinge */}
      <mesh position={[0, 0.06, -1.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 2.6, 16]} />
        <meshStandardMaterial color="#1B2240" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* lid: pivots on the back edge */}
      <group ref={lid} position={[0, 0.06, -1.1]} rotation={[LID_CLOSED, 0, 0]}>
        <RoundedBox args={[3.2, 2.16, 0.07]} radius={0.04} smoothness={3} position={[0, 1.08, -0.036]}>
          <meshStandardMaterial color={SHELL} roughness={0.3} metalness={0.55} />
        </RoundedBox>
        {/* bezel */}
        <mesh position={[0, 1.08, 0.001]}>
          <planeGeometry args={[3.08, 2.04]} />
          <meshStandardMaterial color="#05070F" roughness={0.25} metalness={0.2} />
        </mesh>
        {/* screen */}
        <mesh position={[0, 1.1, 0.003]}>
          <planeGeometry args={[2.88, 1.8]} />
          <meshBasicMaterial ref={screenMat} map={screen?.texture} toneMapped={false} />
        </mesh>
        {/* camera dot */}
        <mesh position={[0, 2.06, 0.003]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color="#1E2547" />
        </mesh>
        {/* logo on the back */}
        {logo && (
          <mesh position={[0, 1.08, -0.073]} rotation={[0, Math.PI, 0]} scale={[-1, -1, 1]}>
            <planeGeometry args={[0.75, 0.75]} />
            <meshBasicMaterial map={logo} transparent toneMapped={false} />
          </mesh>
        )}
        {/* screen light spilling onto the keyboard */}
        <pointLight ref={glow} position={[0, 0.9, 0.7]} color="#7C90FF" distance={3.2} intensity={0} />
      </group>
    </group>
  );
}