import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Sky, Environment, OrbitControls, Stars } from "@react-three/drei";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GrassField from "@/components/vr/GrassField";
import FloatingPanel from "@/components/vr/FloatingPanel";

const Ground = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
    <planeGeometry args={[60, 60]} />
    <meshStandardMaterial color="#1a3a1a" roughness={0.9} />
  </mesh>
);

const SceneContent = () => (
  <>
    <ambientLight intensity={0.4} />
    <directionalLight
      position={[10, 15, 8]}
      intensity={1.2}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
    />

    <Sky
      distance={450000}
      sunPosition={[100, 20, 100]}
      inclination={0.52}
      azimuth={0.25}
      rayleigh={2}
      turbidity={8}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
    />

    <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

    <Environment preset="forest" background={false} />

    <Ground />
    <GrassField />

    <FloatingPanel
      position={[-3, 2.5, -4]}
      title="Kisaan Vision AI"
      description="Revolutionizing agriculture with real-time pathogen detection powered by edge AI and custom CNN models."
      stats={[
        { label: "Accuracy", value: "96.7%" },
        { label: "Crop Classes", value: "38" },
        { label: "Inference", value: "<1s" },
      ]}
    />

    <FloatingPanel
      position={[3.5, 2, -5]}
      title="Smart Irrigation"
      description="Precision drip systems powered by soil moisture sensors and weather data analytics for optimal water usage."
      stats={[
        { label: "Water Saved", value: "60%" },
        { label: "Coverage", value: "100%" },
        { label: "ROI", value: "3x" },
      ]}
    />

    <OrbitControls
      enablePan={false}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={3}
      maxDistance={20}
      autoRotate
      autoRotateSpeed={0.3}
      target={[0, 1, 0]}
    />
  </>
);

const VRField = () => {
  return (
    <div className="relative h-screen w-screen bg-background overflow-hidden">
      {/* Back button overlay */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-10 glass glow-green-subtle rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-primary hover:glow-green transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Title overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center">
        <h1 className="text-xl font-black tracking-wider text-foreground">
          KISAAN <span className="text-primary">VISION</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Immersive Field Experience</p>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 glass rounded-full px-5 py-2 text-xs text-muted-foreground">
        Drag to orbit • Scroll to zoom • Pinch on mobile
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 3, 8], fov: 55 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default VRField;
