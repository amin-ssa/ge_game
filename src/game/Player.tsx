import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { SKINS } from "../lib/skins";

interface PlayerProps {
  skinId: string;
  onLaneChange: (lane: number) => void;
  currentLane: React.MutableRefObject<number>;
  isAlive: React.MutableRefObject<boolean>;
}

enum Controls {
  left = "left",
  right = "right",
  jump = "jump",
}

const LANE_X = [-2, 0, 2];
const JUMP_FORCE = 8;
const GRAVITY = -20;

export default function Player({ skinId, onLaneChange, currentLane, isAlive }: PlayerProps) {
  const bodyRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.PointLight>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);
  const targetX = useRef(0);
  const velocityY = useRef(0);
  const posY = useRef(0);
  const isJumping = useRef(false);
  const laneChangeCooldown = useRef(0);
  const leftWasPressed = useRef(false);
  const rightWasPressed = useRef(false);
  const jumpWasPressed = useRef(false);
  const [, getKeys] = useKeyboardControls<Controls>();

  const skin = SKINS.find((s) => s.id === skinId) || SKINS[0];

  useFrame((_, delta) => {
    if (!bodyRef.current || !isAlive.current) return;

    const { left, right, jump } = getKeys();

    laneChangeCooldown.current = Math.max(0, laneChangeCooldown.current - delta);

    if (left && !leftWasPressed.current && laneChangeCooldown.current <= 0) {
      const newLane = Math.max(0, currentLane.current - 1);
      if (newLane !== currentLane.current) {
        currentLane.current = newLane;
        targetX.current = LANE_X[newLane];
        laneChangeCooldown.current = 0.15;
        onLaneChange(newLane);
      }
    }
    if (right && !rightWasPressed.current && laneChangeCooldown.current <= 0) {
      const newLane = Math.min(2, currentLane.current + 1);
      if (newLane !== currentLane.current) {
        currentLane.current = newLane;
        targetX.current = LANE_X[newLane];
        laneChangeCooldown.current = 0.15;
        onLaneChange(newLane);
      }
    }
    if (jump && !jumpWasPressed.current && !isJumping.current) {
      velocityY.current = JUMP_FORCE;
      isJumping.current = true;
    }

    leftWasPressed.current = left;
    rightWasPressed.current = right;
    jumpWasPressed.current = jump;

    velocityY.current += GRAVITY * delta;
    posY.current += velocityY.current * delta;
    if (posY.current <= 0) {
      posY.current = 0;
      velocityY.current = 0;
      isJumping.current = false;
    }

    const mesh = bodyRef.current;
    mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, targetX.current, Math.min(1, delta * 12));
    mesh.position.y = posY.current + 0.5;
    mesh.rotation.z = THREE.MathUtils.lerp(
      mesh.rotation.z,
      (targetX.current - mesh.position.x) * -0.3,
      Math.min(1, delta * 8)
    );

    if (wireRef.current) {
      wireRef.current.position.copy(mesh.position);
      wireRef.current.rotation.copy(mesh.rotation);
    }

    if (glowRef.current) {
      glowRef.current.position.copy(mesh.position);
      glowRef.current.intensity = 2 + Math.sin(Date.now() * 0.005) * 0.5;
    }
  });

  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      if (!isAlive.current) return;
      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return;
      const x = touch.clientX;
      const y = touch.clientY;
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (y < h * 0.3) {
        if (!isJumping.current) {
          velocityY.current = JUMP_FORCE;
          isJumping.current = true;
        }
      } else if (x < w * 0.4) {
        if (laneChangeCooldown.current <= 0) {
          const newLane = Math.max(0, currentLane.current - 1);
          if (newLane !== currentLane.current) {
            currentLane.current = newLane;
            targetX.current = LANE_X[newLane];
            laneChangeCooldown.current = 0.15;
            onLaneChange(newLane);
          }
        }
      } else if (x > w * 0.6) {
        if (laneChangeCooldown.current <= 0) {
          const newLane = Math.min(2, currentLane.current + 1);
          if (newLane !== currentLane.current) {
            currentLane.current = newLane;
            targetX.current = LANE_X[newLane];
            laneChangeCooldown.current = 0.15;
            onLaneChange(newLane);
          }
        }
      }
    };

    window.addEventListener("touchstart", handleTouch);
    return () => window.removeEventListener("touchstart", handleTouch);
  }, [currentLane, isAlive, onLaneChange]);

  return (
    <group>
      <pointLight
        ref={glowRef}
        color={skin.color}
        intensity={3}
        distance={6}
        decay={2}
        position={[0, 0.5, 0]}
      />
      <mesh ref={bodyRef} position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 0.9, 0.4]} />
        <meshStandardMaterial
          color={skin.color}
          emissive={skin.emissive}
          emissiveIntensity={1.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={wireRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.75, 1.05, 0.55]} />
        <meshStandardMaterial
          color={skin.color}
          transparent
          opacity={0.12}
          emissive={skin.color}
          emissiveIntensity={2}
          wireframe
        />
      </mesh>
    </group>
  );
}
