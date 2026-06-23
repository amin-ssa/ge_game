import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
}

interface ParticlesProps {
  playerX: React.MutableRefObject<number>;
  speed: React.MutableRefObject<number>;
  isRunning: boolean;
  color: string;
}

const MAX_PARTICLES = 80;

export default function Particles({ playerX, speed, isRunning, color }: ParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const particles = useRef<Particle[]>(
    Array.from({ length: MAX_PARTICLES }, () => ({
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 0,
      active: false,
    }))
  );
  const spawnTimer = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  const spawnParticle = useCallback(() => {
    const p = particles.current.find((p) => !p.active);
    if (!p) return;
    p.position.set(
      (playerX.current || 0) + (Math.random() - 0.5) * 0.4,
      0.1,
      Math.random() * 0.5 - 0.2
    );
    p.velocity.set(
      (Math.random() - 0.5) * 2,
      Math.random() * 3 + 1,
      Math.random() * 2
    );
    p.maxLife = 0.4 + Math.random() * 0.4;
    p.life = p.maxLife;
    p.active = true;
  }, [playerX]);

  useFrame((_, delta) => {
    if (!isRunning || !meshRef.current) return;

    spawnTimer.current += delta;
    if (spawnTimer.current > 0.03) {
      spawnTimer.current = 0;
      spawnParticle();
      spawnParticle();
    }

    let visibleCount = 0;
    for (const p of particles.current) {
      if (!p.active) continue;
      p.life -= delta;
      if (p.life <= 0) { p.active = false; continue; }

      p.position.x += p.velocity.x * delta;
      p.position.y += p.velocity.y * delta;
      p.position.z += (p.velocity.z + speed.current) * delta;
      p.velocity.y -= 8 * delta;

      const t = p.life / p.maxLife;
      const scale = t * 0.15;
      dummy.position.copy(p.position);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(visibleCount, dummy.matrix);
      meshRef.current.setColorAt(visibleCount, colorObj.clone().multiplyScalar(t));
      visibleCount++;
    }
    meshRef.current.count = visibleCount;
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}
