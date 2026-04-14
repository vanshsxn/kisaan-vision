import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Leaf3D = ({ scrollProgress = 0, diseaseActive = false }: { scrollProgress: number; diseaseActive: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const spotsRef = useRef<THREE.Group>(null);

  const leafShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -2);
    shape.bezierCurveTo(1.2, -1.2, 1.5, 0.5, 0.8, 1.8);
    shape.bezierCurveTo(0.4, 2.5, 0, 2.8, 0, 2.8);
    shape.bezierCurveTo(0, 2.8, -0.4, 2.5, -0.8, 1.8);
    shape.bezierCurveTo(-1.5, 0.5, -1.2, -1.2, 0, -2);
    return shape;
  }, []);

  const spotPositions = useMemo(() => [
    [0.3, 0.8, 0.06],
    [-0.4, 0.3, 0.06],
    [0.1, 1.5, 0.06],
    [-0.2, -0.3, 0.06],
    [0.5, -0.5, 0.06],
  ], []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.3;
    meshRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
  });

  const healthyColor = new THREE.Color(0x22c55e);
  const diseaseColor = new THREE.Color(0x8b6914);
  const leafColor = healthyColor.clone().lerp(diseaseColor, diseaseActive ? 0.6 : 0);

  return (
    <group>
      <mesh ref={meshRef} scale={0.6 + scrollProgress * 0.4}>
        <extrudeGeometry args={[leafShape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 }]} />
        <meshStandardMaterial color={leafColor} roughness={0.3} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {diseaseActive && (
        <group ref={spotsRef}>
          {spotPositions.map((pos, i) => (
            <mesh key={i} position={[pos[0], pos[1], pos[2]]} scale={0.6 + scrollProgress * 0.4}>
              <circleGeometry args={[0.12 + Math.sin(i) * 0.04, 16]} />
              <meshStandardMaterial color="#6b3a00" roughness={0.8} transparent opacity={0.85} />
            </mesh>
          ))}
        </group>
      )}

      {/* Vein lines */}
      <mesh scale={0.6 + scrollProgress * 0.4}>
        <planeGeometry args={[0.03, 4]} />
        <meshStandardMaterial color="#1a8a3e" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export default Leaf3D;
