"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { FIGURINES } from "../experience/Models";
import { canvasTexture, FONTS, seeded } from "../experience/textures";

const WOOD = "#8A5A3B";
const METAL = "#1B2240";
const NAVY = "#1C2E6E";
const FLOOR_Y = -4.3;

/* ---------- floor and back wall ---------- */

export function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshLambertMaterial color="#EDE6D9" />
      </mesh>
      <mesh position={[0, 4, -3.7]}>
        <planeGeometry args={[80, 24]} />
        <meshLambertMaterial color="#F3EDE3" />
      </mesh>
    </group>
  );
}

/* ---------- walnut desk ---------- */

function useWoodTexture() {
  return useMemo(
    () =>
      canvasTexture(1024, 512, (ctx, w, h) => {
        const rand = seeded(5);
        ctx.fillStyle = WOOD;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 140; i++) {
          const y = rand() * h;
          ctx.strokeStyle = `rgba(${rand() > 0.5 ? "60,35,20" : "170,120,80"},${0.08 + rand() * 0.12})`;
          ctx.lineWidth = 1 + rand() * 3;
          ctx.beginPath();
          ctx.moveTo(0, y);
          for (let x = 0; x <= w; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * (2 + rand() * 6));
          ctx.stroke();
        }
      }),
    []
  );
}

export function Desk() {
  const wood = useWoodTexture();
  const legs = [
    [-3.9, -1.9],
    [4.9, -1.9],
    [-3.9, 1.9],
    [4.9, 1.9],
  ];
  return (
    <group>
      <RoundedBox args={[9.4, 0.16, 4.4]} radius={0.05} smoothness={3} position={[0.5, -0.14, 0]}>
        <meshStandardMaterial map={wood} color="#ffffff" roughness={0.5} />
      </RoundedBox>
      {legs.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, (FLOOR_Y - 0.22) / 2, z]}>
          <boxGeometry args={[0.14, -FLOOR_Y - 0.22, 0.14]} />
          <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.5, -0.55, -1.9]}>
        <boxGeometry args={[8.8, 0.08, 0.06]} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

/* ---------- office chair, tucked in ---------- */

export function Chair() {
  return (
    <group position={[-1.9, FLOOR_Y, 1.75]} rotation={[0, 0.22, 0]}>
      {/* star base + casters */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.45, 0.2, 0]}>
              <boxGeometry args={[0.9, 0.08, 0.12]} />
              <meshStandardMaterial color="#0B1020" roughness={0.4} metalness={0.5} />
            </mesh>
            <mesh position={[0.86, 0.08, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#0B1020" />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 2, 12]} />
        <meshStandardMaterial color="#9AA3BF" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* seat and back */}
      <RoundedBox args={[1.7, 0.24, 1.55]} radius={0.1} smoothness={3} position={[0, 2.3, 0]}>
        <meshStandardMaterial color={NAVY} roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, 2.8, 0.78]}>
        <boxGeometry args={[0.12, 1, 0.08]} />
        <meshStandardMaterial color="#0B1020" />
      </mesh>
      <RoundedBox args={[1.6, 1.25, 0.18]} radius={0.09} smoothness={3} position={[0, 3.55, 0.82]} rotation={[-0.12, 0, 0]}>
        <meshStandardMaterial color={NAVY} roughness={0.9} />
      </RoundedBox>
    </group>
  );
}

/* ---------- wall shelf with the five field figurines ---------- */

export function Shelf() {
  const figs = useRef([]);
  useFrame((state, dt) => {
    const d = Math.min(dt, 0.1);
    figs.current.forEach((f, i) => f && (f.rotation.y += d * (0.25 + i * 0.04)));
  });
  return (
    <group position={[-0.9, 1.75, -3.4]}>
      <RoundedBox args={[4.9, 0.09, 0.55]} radius={0.02} smoothness={2}>
        <meshStandardMaterial color={WOOD} roughness={0.6} />
      </RoundedBox>
      {[-2, 2].map((x) => (
        <mesh key={x} position={[x, -0.2, -0.1]}>
          <boxGeometry args={[0.06, 0.35, 0.3]} />
          <meshStandardMaterial color={METAL} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {FIGURINES.map((Fig, i) => (
        <group key={i} ref={(el) => (figs.current[i] = el)} position={[-1.9 + i * 0.95, 0.25, 0.02]} scale={0.27}>
          <Fig />
        </group>
      ))}
    </group>
  );
}

/* ---------- framed print on the wall ---------- */

export function Poster() {
  const tex = useMemo(
    () =>
      canvasTexture(640, 840, (ctx, w, h) => {
        ctx.fillStyle = "#FBF8F2";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(14,26,58,0.15)";
        ctx.lineWidth = 2;
        ctx.strokeRect(36, 36, w - 72, h - 72);
        ctx.fillStyle = "#0E1A3A";
        ctx.font = `italic 118px ${FONTS.serif()}`;
        ctx.fillText("build", 70, 300);
        ctx.fillText("every", 70, 410);
        ctx.fillStyle = "#2F4BD3";
        ctx.fillText("layer.", 70, 520);
        ctx.fillStyle = "rgba(14,26,58,0.55)";
        ctx.font = `20px ${FONTS.mono()}`;
        ctx.fillText("M.R — FULL-STACK — 2026", 72, h - 80);
      }),
    []
  );
  return (
    <group position={[3.5, 1.9, -3.62]}>
      <mesh>
        <boxGeometry args={[1.75, 2.25, 0.06]} />
        <meshStandardMaterial color={METAL} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[1.55, 2.05]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ---------- plant ---------- */

export function Plant() {
  const leaves = useRef();
  useFrame((s) => {
    if (leaves.current) leaves.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.8) * 0.03;
  });
  const leafData = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        a: (i / 8) * Math.PI * 2,
        tilt: 0.35 + (i % 3) * 0.12,
        len: 0.55 + (i % 4) * 0.08,
        color: i % 2 ? "#2F6B4F" : "#3E8A62",
      })),
    []
  );
  return (
    <group position={[4.5, -0.06, -1.45]}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.36, 0.28, 0.6, 24]} />
        <meshStandardMaterial color={NAVY} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.59, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.33, 24]} />
        <meshStandardMaterial color="#3B2A1E" roughness={1} />
      </mesh>
      <group ref={leaves} position={[0, 0.6, 0]}>
        {leafData.map((l, i) => (
          <group key={i} rotation={[0, l.a, 0]}>
            <mesh rotation={[l.tilt, 0, 0]} position={[0, l.len * 0.9, l.len * 0.35]} scale={[0.16, l.len, 0.05]}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshStandardMaterial color={l.color} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ---------- coffee mug with steam ---------- */

export function Mug() {
  const puffs = useRef([]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    puffs.current.forEach((p, i) => {
      if (!p) return;
      const f = (t * 0.32 + i / 3) % 1;
      p.position.set(Math.sin(t * 1.3 + i * 2) * 0.06, 0.55 + f * 0.85, 0);
      p.scale.setScalar(0.05 + f * 0.09);
      p.material.opacity = Math.sin(Math.PI * f) * 0.16;
    });
  });
  return (
    <group position={[-2.55, -0.06, 0.95]}>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.26, 0.23, 0.48, 32]} />
        <meshStandardMaterial color="#F4EFE6" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.262, 0.255, 0.08, 32, 1, true]} />
        <meshStandardMaterial color={NAVY} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.235, 32]} />
        <meshStandardMaterial color="#3A2416" roughness={0.3} />
      </mesh>
      {/* handle: a half ring whose open side sits against the mug */}
      <mesh position={[0.235, 0.25, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.13, 0.038, 12, 28, Math.PI]} />
        <meshStandardMaterial color="#F4EFE6" roughness={0.35} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (puffs.current[i] = el)}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}