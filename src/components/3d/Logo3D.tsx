'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Logo3DProps {
  size?: number;
  className?: string;
  autoRotate?: boolean;
  interactive?: boolean;
}

function LogoMesh({ autoRotate = true, interactive = true }: { autoRotate?: boolean; interactive?: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;

    if (autoRotate) {
      meshRef.current.rotation.y += 0.005;
    }

    if (interactive) {
      // Subtle mouse follow
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(t * 0.8) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        {/* V shape using boxes */}
        <group position={[-0.6, 0, 0]}>
          {/* Left arm of V */}
          <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.25, 1.2, 0.3]} />
            <meshStandardMaterial
              color="#8B5CF6"
              emissive="#8B5CF6"
              emissiveIntensity={hovered ? 0.5 : 0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Right arm of V */}
          <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.25, 1.2, 0.3]} />
            <meshStandardMaterial
              color="#8B5CF6"
              emissive="#8B5CF6"
              emissiveIntensity={hovered ? 0.5 : 0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* 3 using spheres/boxes */}
        <group position={[0.7, 0, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.5, 0.2, 0.3]} />
            <meshStandardMaterial
              color="#14B8A6"
              emissive="#14B8A6"
              emissiveIntensity={hovered ? 0.5 : 0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.2, 0.3]} />
            <meshStandardMaterial
              color="#14B8A6"
              emissive="#14B8A6"
              emissiveIntensity={hovered ? 0.5 : 0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[0.5, 0.2, 0.3]} />
            <meshStandardMaterial
              color="#14B8A6"
              emissive="#14B8A6"
              emissiveIntensity={hovered ? 0.5 : 0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Right side connectors */}
          <mesh position={[0.2, 0.2, 0]}>
            <boxGeometry args={[0.2, 0.4, 0.3]} />
            <meshStandardMaterial
              color="#14B8A6"
              emissive="#14B8A6"
              emissiveIntensity={hovered ? 0.5 : 0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0.2, -0.2, 0]}>
            <boxGeometry args={[0.2, 0.4, 0.3]} />
            <meshStandardMaterial
              color="#14B8A6"
              emissive="#14B8A6"
              emissiveIntensity={hovered ? 0.5 : 0.2}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Glow ring */}
        <mesh position={[0, 0, -0.5]} rotation={[0, 0, 0]}>
          <torusGeometry args={[1.8, 0.05, 16, 100]} />
          <meshStandardMaterial
            color="#14B8A6"
            emissive="#14B8A6"
            emissiveIntensity={hovered ? 2 : 0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * 3D rotating VIB3 logo with glass material
 */
export function Logo3D({
  size = 200,
  className = '',
  autoRotate = true,
  interactive = true,
}: Logo3DProps) {
  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
        <pointLight position={[10, -10, 10]} intensity={0.5} color="#14B8A6" />

        <LogoMesh autoRotate={autoRotate} interactive={interactive} />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

/**
 * Simplified logo for performance-sensitive contexts
 */
export function LogoSimple3D({ size = 100 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={1} />
        <mesh rotation={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 0.3]} />
          <meshStandardMaterial
            color="#8B5CF6"
            emissive="#8B5CF6"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Canvas>
    </div>
  );
}

export default Logo3D;
