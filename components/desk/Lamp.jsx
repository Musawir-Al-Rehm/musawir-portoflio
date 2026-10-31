"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "../experience/story";
import { useHover } from "./useHover";

const METAL = "#1B2240";
const BASE = new THREE.Vector3(-3.6, -0.06, -1.25);
// Points relative to the base: top of base, elbow, head, and where the light lands.
const B = new THREE.Vector3(0, 0.07, 0);
const J = new THREE.Vector3(0.3, 1.6, 0.05);
const H = new THREE.Vector3(1.3, 1.35, 0.4);
const T = new THREE.Vector3(1.9, 0.05, 1.1);
const UP = new THREE.Vector3(0, 1, 0);

// A cylinder stretched between two points.
function Segment({ from, to, r = 0.045 }) {
  const { pos, quat, len } = useMemo(() => {
    const dir = to.clone().sub(from);
    return {
      pos: from.clone().add(to).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      len: dir.length(),
    };
  }, [from, to]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, 12]} />
      <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.35} />
    </mesh>
  );
}

// Click it to switch the room between day and night.
export default function Lamp({ interactive, onHover, onToggle }) {
  const bulb = useRef();
  const spot = useRef();
  const [hovered, handlers] = useHover("Lights", interactive, onHover);

  const head = useMemo(() => {
    const aim = H.clone().sub(T).normalize(); // shade opens towards the desk
    return {
      quat: new THREE.Quaternion().setFromUnitVectors(UP, aim),
      bulbPos: H.clone().addScaledVector(aim, -0.14),
    };
  }, []);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.copy(T); // local to the lamp group
    return o;
  }, []);

  useFrame(() => {
    const n = story.night;
    const hover = hovered.current && interactive ? 1 : 0;
    // The light only exists while the lamp is on, so daytime rendering stays cheap.
    if (spot.current) {
      spot.current.visible = n > 0.01;
      spot.current.intensity = n * 60;
    }
    if (bulb.current) bulb.current.emissiveIntensity = 0.15 + n * 3 + hover * 0.6;
  });

  return (
    <group
      position={BASE}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation();
        if (interactive) onToggle?.();
      }}
    >
      <mesh position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.34, 0.38, 0.07, 32]} />
        <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.35} />
      </mesh>
      <Segment from={B} to={J} />
      <Segment from={J} to={H} />
      <mesh position={J}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#C9A86A" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={H} quaternion={head.quat}>
        <coneGeometry args={[0.3, 0.42, 32, 1, true]} />
        <meshStandardMaterial color={METAL} metalness={0.5} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={head.bulbPos}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial ref={bulb} color="#FFF3D6" emissive="#FFD58A" emissiveIntensity={0.15} toneMapped={false} />
      </mesh>

      <primitive object={target} />
      <spotLight
        ref={spot}
        position={head.bulbPos}
        target={target}
        color="#FFD9A0"
        angle={0.75}
        penumbra={0.7}
        distance={4.2}
        decay={1.2}
        intensity={0}
        visible={false}
      />
    </group>
  );
}
