import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

interface FloatingPanelProps {
  position: [number, number, number];
  title: string;
  description: string;
  stats?: { label: string; value: string }[];
}

const FloatingPanel = ({ position, title, description, stats }: FloatingPanelProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
      groupRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Glass panel background */}
      <RoundedBox args={[3.2, 2.2, 0.04]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial
          color="#0a1a10"
          transparent
          opacity={0.55}
          roughness={0.1}
          metalness={0.1}
          transmission={0.3}
          thickness={0.5}
        />
      </RoundedBox>

      {/* Green glow border */}
      <RoundedBox args={[3.24, 2.24, 0.02]} radius={0.11} smoothness={4} position={[0, 0, -0.02]}>
        <meshBasicMaterial color="#2dd46b" transparent opacity={0.15} />
      </RoundedBox>

      {/* Title */}
      <Text
        position={[0, 0.7, 0.03]}
        fontSize={0.18}
        color="#2dd46b"
        font="/fonts/Inter-Bold.woff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.8}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        position={[0, 0.15, 0.03]}
        fontSize={0.1}
        color="#b8d4c0"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.6}
        lineHeight={1.5}
      >
        {description}
      </Text>

      {/* Stats row */}
      {stats?.map((stat, i) => {
        const xOffset = (i - (stats.length - 1) / 2) * 0.9;
        return (
          <group key={stat.label} position={[xOffset, -0.55, 0.03]}>
            <Text fontSize={0.16} color="#2dd46b" anchorX="center" anchorY="middle">
              {stat.value}
            </Text>
            <Text
              position={[0, -0.18, 0]}
              fontSize={0.07}
              color="#7aaa8a"
              anchorX="center"
              anchorY="middle"
            >
              {stat.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export default FloatingPanel;
