import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TrackProps {
  speed: React.MutableRefObject<number>;
  isRunning: boolean;
}

const TILE_LENGTH = 20;
const TILE_COUNT = 6;
const TRACK_WIDTH = 8;

function TrackTile({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TRACK_WIDTH, TILE_LENGTH]} />
        <meshStandardMaterial color="#0a0a1a" roughness={0.8} metalness={0.3} />
      </mesh>
      {[-2, 0, 2].map((x, i) => (
        <mesh key={i} receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 0]}>
          <planeGeometry args={[0.05, TILE_LENGTH]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      {[-3.9, 3.9].map((x, i) => (
        <mesh key={i} receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 0]}>
          <planeGeometry args={[0.08, TILE_LENGTH]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Track({ speed, isRunning }: TrackProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const offset = useRef(0);

  useFrame((_, delta) => {
    if (!isRunning) return;
    offset.current += speed.current * delta;
    if (offset.current >= TILE_LENGTH) {
      offset.current -= TILE_LENGTH;
    }
    if (groupRef.current) {
      groupRef.current.position.z = offset.current;
    }
  });

  const tiles = useMemo(
    () =>
      Array.from({ length: TILE_COUNT }).map((_, i) => ({
        z: i * TILE_LENGTH - (TILE_COUNT - 1) * TILE_LENGTH * 0.5 - TILE_LENGTH * 0.5,
      })),
    []
  );

  return (
    <group ref={groupRef}>
      {tiles.map((tile, i) => (
        <TrackTile
          key={i}
          position={[0, 0, tile.z]}
          color="#00f5ff"
        />
      ))}
    </group>
  );
}
