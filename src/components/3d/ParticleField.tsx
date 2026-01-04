'use client';

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesProps {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
}

function Particles({ count = 500, color = '#8B5CF6', size = 0.02, speed = 0.2 }: ParticlesProps) {
  const points = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      velocities[i3] = (Math.random() - 0.5) * speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * speed;
    }

    return { positions, velocities };
  }, [count, speed]);

  useFrame(() => {
    if (!points.current) return;

    const positions = points.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3] += particlesPosition.velocities[i3] * 0.01;
      positions[i3 + 1] += particlesPosition.velocities[i3 + 1] * 0.01;
      positions[i3 + 2] += particlesPosition.velocities[i3 + 2] * 0.01;

      // Wrap around
      if (Math.abs(positions[i3]) > 5) positions[i3] *= -0.9;
      if (Math.abs(positions[i3 + 1]) > 5) positions[i3 + 1] *= -0.9;
      if (Math.abs(positions[i3 + 2]) > 5) positions[i3 + 2] *= -0.9;
    }

    points.current.geometry.attributes.position.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particlesPosition.positions, 3));
    return geo;
  }, [particlesPosition.positions]);

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Ambient particle field background
 * Handles WebGL context loss gracefully
 */
export function ParticleField({
  count = 500,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  const [contextLost, setContextLost] = useState(false);
  const [key, setKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleContextLost = useCallback((event: Event) => {
    // Prevent default to tell browser we're handling recovery
    event.preventDefault();
    // Silent handling - no console warning needed
    setContextLost(true);
  }, []);

  const handleContextRestored = useCallback(() => {
    setContextLost(false);
    setKey(k => k + 1); // Force re-mount of Canvas
  }, []);

  // Recovery effect when context is lost
  useEffect(() => {
    if (!contextLost) return;

    const timer = setTimeout(() => {
      setContextLost(false);
      setKey(k => k + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [contextLost]);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('webglcontextlost', handleContextLost as EventListener);
        canvasRef.current.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, [handleContextLost, handleContextRestored]);

  // Don't render Canvas if context is lost
  if (contextLost) {
    return <div className={`fixed inset-0 -z-10 ${className}`} />;
  }

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        key={key}
        camera={{ position: [0, 0, 5], fov: 60 }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvasRef.current = canvas;
          canvas.addEventListener('webglcontextlost', handleContextLost as EventListener);
          canvas.addEventListener('webglcontextrestored', handleContextRestored);
        }}
        gl={{
          powerPreference: 'low-power',
          antialias: false,
          alpha: true,
          failIfMajorPerformanceCaveat: false,
        }}
      >
        <Particles count={count} color="#8B5CF6" size={0.015} />
        <Particles count={count / 2} color="#14B8A6" size={0.01} speed={0.3} />
      </Canvas>
    </div>
  );
}

/**
 * Celebration particles burst
 */
export function CelebrationParticles({
  trigger,
  onComplete,
}: {
  trigger: boolean;
  onComplete?: () => void;
}) {
  return trigger ? (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <CelebrationBurst onComplete={onComplete} />
      </Canvas>
    </div>
  ) : null;
}

function CelebrationBurst({ onComplete }: { onComplete?: () => void }) {
  const points = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now());

  const { positions, velocities, colors } = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorPalette = [
      new THREE.Color('#8B5CF6'),
      new THREE.Color('#14B8A6'),
      new THREE.Color('#F97316'),
      new THREE.Color('#EC4899'),
      new THREE.Color('#FBBF24'),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const force = 2 + Math.random() * 3;
      velocities[i3] = Math.cos(angle) * force;
      velocities[i3 + 1] = Math.sin(angle) * force + 2;
      velocities[i3 + 2] = (Math.random() - 0.5) * force;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    return { positions, velocities, colors };
  }, []);

  useFrame(() => {
    if (!points.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 2) {
      onComplete?.();
      return;
    }

    const pos = points.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < 200; i++) {
      const i3 = i * 3;
      pos[i3] += velocities[i3] * 0.02;
      pos[i3 + 1] += velocities[i3 + 1] * 0.02;
      pos[i3 + 2] += velocities[i3 + 2] * 0.02;

      // Gravity
      velocities[i3 + 1] -= 0.05;
    }

    points.current.geometry.attributes.position.needsUpdate = true;

    // Fade out
    const material = points.current.material as THREE.PointsMaterial;
    material.opacity = Math.max(0, 1 - elapsed / 2);
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default ParticleField;
