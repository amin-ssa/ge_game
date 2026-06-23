import { useRef, useCallback, useEffect, forwardRef, useImperativeHandle, Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import Player from "./Player";
import Track from "./Track";
import Obstacles, { ObstaclesHandle } from "./Obstacles";
import Buildings from "./Buildings";
import Particles from "./Particles";
import { SKINS } from "../lib/skins";

enum Controls {
  left = "left",
  right = "right",
  jump = "jump",
}

const KEY_MAP = [
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
  { name: Controls.jump, keys: ["Space", "ArrowUp", "KeyW"] },
];

interface GameSceneProps {
  isRunning: boolean;
  skinId: string;
  onScoreUpdate: (score: number) => void;
  onDie: () => void;
  onMultiplierUpdate: (mult: number) => void;
}

export interface GameSceneHandle {
  reset: () => void;
}

interface SceneProps extends GameSceneProps {
  obstaclesRef: React.RefObject<ObstaclesHandle | null>;
  speedRef: React.MutableRefObject<number>;
  currentLane: React.MutableRefObject<number>;
  isAlive: React.MutableRefObject<boolean>;
  playerX: React.MutableRefObject<number>;
  playerY: React.MutableRefObject<number>;
}

function SceneInner({
  isRunning,
  skinId,
  onScoreUpdate,
  onDie,
  onMultiplierUpdate,
  obstaclesRef,
  speedRef,
  currentLane,
  isAlive,
  playerX,
}: SceneProps) {
  const scoreRef = useRef(0);
  const multiplierRef = useRef(1);
  const invincible = useRef(false);
  const scoreTimer = useRef(0);
  const speedTimer = useRef(0);
  const skin = SKINS.find((s) => s.id === skinId) || SKINS[0];
  const LANE_X = [-2, 0, 2];

  useEffect(() => {
    if (isRunning) {
      speedRef.current = 8;
      scoreRef.current = 0;
      multiplierRef.current = 1;
      currentLane.current = 1;
      isAlive.current = true;
      invincible.current = false;
      scoreTimer.current = 0;
      speedTimer.current = 0;
      obstaclesRef.current?.reset();
    }
  }, [isRunning, speedRef, currentLane, isAlive, obstaclesRef]);

  const handleCollision = useCallback(() => {
    if (!isAlive.current || invincible.current) return;
    isAlive.current = false;
    invincible.current = true;
    onDie();
  }, [onDie, isAlive]);

  useFrame((_, delta) => {
    if (!isRunning) return;

    scoreTimer.current += delta;
    if (scoreTimer.current >= 0.1) {
      scoreTimer.current = 0;
      scoreRef.current += Math.floor(speedRef.current * multiplierRef.current * 0.2);
      onScoreUpdate(scoreRef.current);
    }

    speedTimer.current += delta;
    if (speedTimer.current >= 5) {
      speedTimer.current = 0;
      speedRef.current = Math.min(30, speedRef.current + 0.5);
      multiplierRef.current = Math.min(8, 1 + Math.floor((speedRef.current - 8) / 3));
      onMultiplierUpdate(multiplierRef.current);
    }

    playerX.current = LANE_X[currentLane.current];
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 8]} fov={70} />
      <color attach="background" args={["#020209"]} />
      <fog attach="fog" color="#020209" near={20} far={60} />
      <ambientLight intensity={0.3} color="#1a1a3e" />
      <directionalLight position={[5, 10, 5]} intensity={0.5} color="#ffffff" castShadow />
      <pointLight position={[0, 10, -20]} intensity={2} color="#00f5ff" distance={40} decay={1.5} />
      <pointLight position={[-15, 8, 0]} intensity={1.5} color="#ff0066" distance={30} decay={2} />
      <pointLight position={[15, 8, 0]} intensity={1.5} color="#bf00ff" distance={30} decay={2} />

      <Track speed={speedRef} isRunning={isRunning} />
      <Buildings speed={speedRef} isRunning={isRunning} />
      <Obstacles
        ref={obstaclesRef}
        speed={speedRef}
        isRunning={isRunning}
        onCollision={handleCollision}
        playerLane={currentLane}
        playerY={{ current: 0 }}
      />
      <Particles
        playerX={playerX}
        speed={speedRef}
        isRunning={isRunning}
        color={skin.color}
      />
      <KeyboardControls map={KEY_MAP}>
        <Player
          skinId={skinId}
          onLaneChange={(lane) => { currentLane.current = lane; }}
          currentLane={currentLane}
          isAlive={isAlive}
        />
      </KeyboardControls>
    </>
  );
}

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_err: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.failed) {
      return (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 100%, #0d0030 0%, #020209 60%)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          paddingBottom: "40px",
        }}>
          <div style={{
            color: "rgba(0,245,255,0.15)", fontFamily: "monospace",
            fontSize: "12px", letterSpacing: "2px",
          }}>
            CYBERNET // GRID OFFLINE
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const GameScene = forwardRef<GameSceneHandle, GameSceneProps>((props, ref) => {
  const obstaclesRef = useRef<ObstaclesHandle | null>(null);
  const speedRef = useRef(8);
  const currentLane = useRef(1);
  const isAlive = useRef(true);
  const playerX = useRef(0);
  const playerY = useRef(0);

  useImperativeHandle(ref, () => ({
    reset: () => {
      speedRef.current = 8;
      currentLane.current = 1;
      isAlive.current = true;
      obstaclesRef.current?.reset();
    },
  }));

  return (
    <WebGLErrorBoundary>
      <Canvas
        shadows
        style={{ position: "absolute", inset: 0 }}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <SceneInner
          {...props}
          obstaclesRef={obstaclesRef}
          speedRef={speedRef}
          currentLane={currentLane}
          isAlive={isAlive}
          playerX={playerX}
          playerY={playerY}
        />
      </Canvas>
    </WebGLErrorBoundary>
  );
});

GameScene.displayName = "GameScene";
export default GameScene;
