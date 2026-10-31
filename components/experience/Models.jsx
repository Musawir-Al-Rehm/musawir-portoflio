"use client";

// Five small models, one per field of work, built from basic shapes.

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";

const NAVY = "#1C2E6E";
const ROYAL = "#2F4BD3";
const PAPER = "#FBF8F2";

/* Five small models, one per field, built from basic shapes. */

function BrowserModel() {
  return (
    <group>
      <RoundedBox args={[1.4, 0.95, 0.06]} radius={0.04} smoothness={2}>
        <meshStandardMaterial color={PAPER} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.4, 0.032]}>
        <planeGeometry args={[1.4, 0.14]} />
        <meshStandardMaterial color={NAVY} />
      </mesh>
      {["#FF6B6B", "#F2C879", "#7BD88F"].map((c, i) => (
        <mesh key={c} position={[-0.6 + i * 0.07, 0.4, 0.035]}>
          <circleGeometry args={[0.022, 12]} />
          <meshBasicMaterial color={c} />
        </mesh>
      ))}
      <mesh position={[-0.25, 0.1, 0.035]}>
        <planeGeometry args={[0.7, 0.32]} />
        <meshStandardMaterial color={ROYAL} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.4, 0.2 - i * 0.12, 0.035]}>
          <planeGeometry args={[0.4, 0.05]} />
          <meshStandardMaterial color="#C9CEDF" />
        </mesh>
      ))}
    </group>
  );
}

function ApiModel() {
  const packet = useRef();
  useFrame((s) => {
    if (packet.current) packet.current.position.x = Math.sin(s.clock.elapsedTime * 2.2) * 0.55;
  });
  return (
    <group>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color={x < 0 ? NAVY : ROYAL} roughness={0.3} metalness={0.3} />
        </mesh>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
        <meshStandardMaterial color="#9AA6CF" />
      </mesh>
      <mesh ref={packet}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#F2C879" emissive="#F2C879" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function DataModel() {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, -0.32 + i * 0.32, 0]}>
          <mesh>
            <cylinderGeometry args={[0.45, 0.45, 0.26, 32]} />
            <meshStandardMaterial color={i === 2 ? ROYAL : NAVY} roughness={0.35} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.131, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.33, 32]} />
            <meshBasicMaterial color="#9AA6CF" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function InfraModel() {
  return (
    <group>
      <RoundedBox args={[0.8, 1.15, 0.6]} radius={0.04} smoothness={2}>
        <meshStandardMaterial color="#141B3A" roughness={0.4} metalness={0.5} />
      </RoundedBox>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0, 0.4 - i * 0.26, 0.302]}>
          <mesh>
            <planeGeometry args={[0.68, 0.2]} />
            <meshStandardMaterial color={NAVY} />
          </mesh>
          <mesh position={[0.24, 0, 0.002]}>
            <circleGeometry args={[0.025, 12]} />
            <meshBasicMaterial color={i === 1 ? "#F2C879" : "#7BD88F"} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function AiModel() {
  const shell = useRef();
  useFrame((_, dt) => {
    if (shell.current) shell.current.rotation.y += Math.min(dt, 0.1) * 0.6;
  });
  return (
    <group>
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshBasicMaterial color={NAVY} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial color={ROYAL} emissive={ROYAL} emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

// The five fields, shown as small figurines on the wall shelf.
export const FIGURINES = [BrowserModel, ApiModel, DataModel, InfraModel, AiModel];