'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Text, useCursor } from '@react-three/drei';
import * as THREE from 'three';

interface Card3DSceneProps {
  items: {
    id: string;
    title: string;
    subtitle?: string;
    color?: string;
  }[];
  className?: string;
}

function Card({
  position,
  title,
  subtitle,
  color = '#8B5CF6',
  index,
  totalCards,
}: {
  position: [number, number, number];
  title: string;
  subtitle?: string;
  color?: string;
  index: number;
  totalCards: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const { pointer } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;

    // Carousel rotation
    const angle = (index / totalCards) * Math.PI * 2 + state.clock.elapsedTime * 0.2;
    const radius = 3;
    meshRef.current.position.x = Math.sin(angle) * radius;
    meshRef.current.position.z = Math.cos(angle) * radius - 2;

    // Face center
    meshRef.current.rotation.y = -angle + Math.PI;

    // Light follow effect
    if (hovered) {
      meshRef.current.rotation.x = pointer.y * 0.1;
      meshRef.current.rotation.y += pointer.x * 0.1;
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Card body with thickness */}
      <RoundedBox args={[2, 2.8, 0.15]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.3}
          thickness={0.5}
        />
      </RoundedBox>

      {/* Card edge glow */}
      <RoundedBox args={[2.05, 2.85, 0.16]} radius={0.1} smoothness={4}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.3 : 0.1}
        />
      </RoundedBox>

      {/* Title */}
      <Text
        position={[0, 0.5, 0.1]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text
          position={[0, 0.1, 0.1]}
          fontSize={0.12}
          color="rgba(255,255,255,0.6)"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.8}
        >
          {subtitle}
        </Text>
      )}

      {/* Reflection plane */}
      <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 1]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}

/**
 * 3D card carousel with glass effects
 */
export function Card3DScene({ items, className = '' }: Card3DSceneProps) {
  const colors = ['#8B5CF6', '#14B8A6', '#F97316', '#EC4899', '#FBBF24'];

  return (
    <div className={`h-[400px] ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />

        {items.map((item, index) => (
          <Card
            key={item.id}
            position={[0, 0, 0]}
            title={item.title}
            subtitle={item.subtitle}
            color={item.color || colors[index % colors.length]}
            index={index}
            totalCards={items.length}
          />
        ))}
      </Canvas>
    </div>
  );
}

export default Card3DScene;
