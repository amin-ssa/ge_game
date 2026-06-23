import { useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface ObstacleData {
  id: number;
  lane: number;
  z: number;
  type: "barrier" | "wall" | "spike";
  active: boolean;
}

export interface ObstaclesHandle {
  obstacles: React.MutableRefObject<ObstacleData[]>;
  reset: () => void;
}

interface ObstacleProps {
  data: ObstacleData;
}

const LANE_X = [-2, 0, 2];
const OBSTACLE_COLORS = {
  barrier: "#ff0066",
  wall: "#ff6600",
  spike: "#ffcc00",
};

function ObstacleMesh({ data }: ObstacleProps) {
  return (
    <group position={[LANE_X[data.lane], 0, data.z]}>
      {data.type === "barrier" && (
        <>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.8, 0.6, 0.4]} />
            <meshStandardMaterial
              color={OBSTACLE_COLORS.barrier}
              emissive={OBSTACLE_COLORS.barrier}
              emissiveIntensity={1.5}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          <pointLight color={OBSTACLE_COLORS.barrier} intensity={1.5} distance={3} decay={2} position={[0, 0.5, 0]} />
        </>
      )}
      {data.type === "wall" && (
        <>
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[1.2, 1.5, 0.3]} />
            <meshStandardMaterial
              color={OBSTACLE_COLORS.wall}
              emissive={OBSTACLE_COLORS.wall}
              emissiveIntensity={1.2}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          <pointLight color={OBSTACLE_COLORS.wall} intensity={1.5} distance={3} decay={2} position={[0, 0.8, 0]} />
        </>
      )}
      {data.type === "spike" && (
        <>
          <mesh position={[0, 0.5, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.4, 1.0, 4]} />
            <meshStandardMaterial
              color={OBSTACLE_COLORS.spike}
              emissive={OBSTACLE_COLORS.spike}
              emissiveIntensity={2}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          <pointLight color={OBSTACLE_COLORS.spike} intensity={1.5} distance={3} decay={2} position={[0, 0.5, 0]} />
        </>
      )}
    </group>
  );
}

interface ObstaclesManagerProps {
  speed: React.MutableRefObject<number>;
  isRunning: boolean;
  onCollision: (lane: number, y: number) => void;
  playerLane: React.MutableRefObject<number>;
  playerY: React.MutableRefObject<number>;
}

const Obstacles = forwardRef<ObstaclesHandle, ObstaclesManagerProps>(
  ({ speed, isRunning, onCollision, playerLane, playerY }, ref) => {
    const obstacles = useRef<ObstacleData[]>([]);
    const nextId = useRef(0);
    const spawnTimer = useRef(0);
    const MIN_SPAWN = 1.2;
    const MAX_SPAWN = 2.5;
    const nextSpawn = useRef(1.5);

    const LANE_X = [-2, 0, 2];
    const TYPES: ObstacleData["type"][] = ["barrier", "wall", "spike"];

    const reset = useCallback(() => {
      obstacles.current = [];
      spawnTimer.current = 0;
      nextSpawn.current = 1.5;
    }, []);

    useImperativeHandle(ref, () => ({ obstacles, reset }));

    useFrame((_, delta) => {
      if (!isRunning) return;

      spawnTimer.current += delta;
      if (spawnTimer.current >= nextSpawn.current) {
        spawnTimer.current = 0;
        const spawnRange = Math.max(MIN_SPAWN, MAX_SPAWN - speed.current * 0.05);
        nextSpawn.current = MIN_SPAWN + Math.random() * (spawnRange - MIN_SPAWN);

        const usedLanes = new Set<number>();
        const numObstacles = Math.random() < 0.3 ? 2 : 1;
        for (let i = 0; i < numObstacles; i++) {
          let lane: number;
          do { lane = Math.floor(Math.random() * 3); } while (usedLanes.has(lane));
          usedLanes.add(lane);
          obstacles.current.push({
            id: nextId.current++,
            lane,
            z: -40,
            type: TYPES[Math.floor(Math.random() * TYPES.length)],
            active: true,
          });
        }
      }

      for (const obs of obstacles.current) {
        if (!obs.active) continue;
        obs.z += speed.current * delta;

        if (obs.z > 5) {
          obs.active = false;
          continue;
        }

        const playerLaneX = LANE_X[playerLane.current];
        const obsLaneX = LANE_X[obs.lane];
        const dx = Math.abs(playerLaneX - obsLaneX);
        const dz = Math.abs(obs.z - 0);

        if (dx < 0.9 && dz < 1.5) {
          if (obs.type === "barrier" && playerY.current > 0.8) continue;
          if (obs.type === "spike" && playerY.current > 0.5) continue;
          if (obs.type === "wall" && playerY.current > 1.3) continue;
          obs.active = false;
          onCollision(obs.lane, playerY.current);
        }
      }

      obstacles.current = obstacles.current.filter(
        (o) => o.active || o.z < 5
      );
    });

    return (
      <>
        {obstacles.current.filter((o) => o.active).map((obs) => (
          <ObstacleMesh key={obs.id} data={obs} />
        ))}
      </>
    );
  }
);

Obstacles.displayName = "Obstacles";
export default Obstacles;
