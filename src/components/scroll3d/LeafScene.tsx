import { Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import Leaf3D from "./Leaf3D";

interface LeafSceneProps {
  scrollProgress: number;
  diseaseActive: boolean;
  scanActive: boolean;
}

const LeafScene = ({ scrollProgress, diseaseActive, scanActive }: LeafSceneProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-3, 2, 4]} intensity={0.6} color="#22c55e" />

      {scanActive && (
        <pointLight position={[0, 0, 3]} intensity={2} color="#22c55e" distance={8} />
      )}

      <Suspense fallback={null}>
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          <Leaf3D scrollProgress={scrollProgress} diseaseActive={diseaseActive} />
        </Float>
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
};

export default LeafScene;
