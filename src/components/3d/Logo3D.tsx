'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center, Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
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
        <Center>
          <Text3D
            font="/fonts/inter-bold.json"
            size={1}
            height={0.3}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            V3
            <MeshTransmissionMaterial
              backside
              samples={16}
              resolution={512}
              transmission={0.9}
              roughness={0.1}
              thickness={0.5}
              ior={1.5}
              chromaticAberration={0.06}
              anisotropy={0.1}
              distortion={0.2}
              distortionScale={0.3}
              temporalDistortion={0.5}
              color="#8B5CF6"
            />
          </Text3D>
        </Center>

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
