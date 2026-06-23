import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BuildingProps {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  color: string;
  windowColor: string;
}

function Building({ position, height, width, depth, color, windowColor }: BuildingProps) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {Array.from({ length: Math.floor(height / 1.5) }).map((_, row) =>
        Array.from({ length: Math.floor(width / 0.8) }).map((_, col) => {
          const lit = Math.random() > 0.4;
          return lit ? (
            <mesh
              key={`${row}-${col}`}
              position={[
                -width / 2 + 0.5 + col * 0.8,
                -height / 2 + 0.8 + row * 1.5,
                depth / 2 + 0.01,
              ]}
            >
              <planeGeometry args={[0.3, 0.5]} />
              <meshStandardMaterial
                color={windowColor}
                emissive={windowColor}
                emissiveIntensity={1.5}
              />
            </mesh>
          ) : null;
        })
      )}
    </group>
  );
}

const BUILDING_CONFIGS = [
  { x: -9, height: 12, width: 3, depth: 4, color: "#0d0d2b", windowColor: "#00f5ff" },
  { x: -13, height: 18, width: 4, depth: 5, color: "#0a0a20", windowColor: "#ff0099" },
  { x: -17, height: 8, width: 3, depth: 3, color: "#0e0e2e", windowColor: "#39ff14" },
  { x: 9, height: 15, width: 3.5, depth: 4, color: "#0d0d2b", windowColor: "#ff6600" },
  { x: 13, height: 10, width: 3, depth: 4, color: "#0a0a20", windowColor: "#00f5ff" },
  { x: 17, height: 20, width: 4, depth: 5, color: "#0e0e2e", windowColor: "#bf00ff" },
  { x: -22, height: 25, width: 5, depth: 6, color: "#080820", windowColor: "#ff0066" },
  { x: 22, height: 22, width: 4, depth: 5, color: "#080820", windowColor: "#00ccff" },
];

const BUILDING_POSITIONS = Array.from({ length: 30 }).map((_, i) => {
  const cfg = BUILDING_CONFIGS[Math.floor(Math.random() * BUILDING_CONFIGS.length)];
  return { ...cfg, z: -i * 15 - 10, key: i };
});

interface BuildingsProps {
  speed: React.MutableRefObject<number>;
  isRunning: boolean;
}

export default function Buildings({ speed, isRunning }: BuildingsProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const offset = useRef(0);
  const TOTAL_LENGTH = 30 * 15;

  useFrame((_, delta) => {
    if (!isRunning || !groupRef.current) return;
    offset.current += speed.current * delta * 0.3;
    if (offset.current >= TOTAL_LENGTH) offset.current -= TOTAL_LENGTH;
    groupRef.current.position.z = offset.current;
  });

  return (
    <group ref={groupRef}>
      {BUILDING_POSITIONS.map((b) => (
        <Building
          key={b.key}
          position={[b.x, b.height / 2, b.z]}
          height={b.height}
          width={b.width}
          depth={b.depth}
          color={b.color}
          windowColor={b.windowColor}
        />
      ))}
    </group>
  );
}
