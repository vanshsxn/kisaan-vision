import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getMethodBySlug } from "@/data/farmingMethods";

// A-Frame scene configurations per practice type
const vrScenes: Record<string, { sky: string; entities: string; info: string }> = {
  hydroponics: {
    sky: "#87CEEB",
    entities: `
      <a-plane position="0 0 -4" rotation="-90 0 0" width="30" height="30" color="#7BC8A4"></a-plane>
      <a-light type="directional" position="-1 2 1" intensity="0.8" castShadow="true"></a-light>
      <a-light type="ambient" color="#FFF" intensity="0.5"></a-light>

      <a-box position="-3 1 -4" width="6" height="0.2" depth="0.5" color="#E2E8F0"></a-box>
      <a-box position="-3 2 -4" width="6" height="0.2" depth="0.5" color="#E2E8F0"></a-box>
      <a-box position="-3 3 -4" width="6" height="0.2" depth="0.5" color="#E2E8F0"></a-box>
      
      <a-box position="-3 0.5 -4" width="6" height="0.1" depth="0.6" color="#3B82F6" opacity="0.8"></a-box>
      <a-box position="-3 1.5 -4" width="6" height="0.1" depth="0.6" color="#3B82F6" opacity="0.8"></a-box>
      <a-box position="-3 2.5 -4" width="6" height="0.1" depth="0.6" color="#3B82F6" opacity="0.8"></a-box>
      
      <a-sphere position="-4 1.3 -4" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="-2 1.3 -4" radius="0.25" color="#16A34A"></a-sphere>
      <a-sphere position="0 1.3 -4" radius="0.35" color="#22C55E"></a-sphere>
      <a-sphere position="-3 2.3 -4" radius="0.3" color="#16A34A"></a-sphere>
      <a-sphere position="-1 2.3 -4" radius="0.28" color="#22C55E"></a-sphere>
    `,
    info: "Hydroponics: PVC channels carry nutrient-rich water to plant roots."
  },
  aquaponics: {
    sky: "#87CEEB",
    entities: `
      <a-plane position="0 0 -5" rotation="-90 0 0" width="30" height="30" color="#A7F3D0"></a-plane>
      <a-light type="directional" position="1 3 2" intensity="0.9"></a-light>
      <a-light type="ambient" color="#FFF" intensity="0.5"></a-light>

      <a-cylinder position="-3 1 -5" radius="1.5" height="2" color="#1E3A5F" opacity="0.8" open-ended="true"></a-cylinder>
      <a-circle position="-3 0 -5" radius="1.5" color="#0EA5E9" opacity="0.6" rotation="-90 0 0"></a-circle>
      
      <a-sphere position="-3.5 0.5 -5" radius="0.15" color="#F97316" animation="property: position; to: -2.5 0.8 -5; dur: 2000; dir: alternate; loop: true"></a-sphere>
      <a-sphere position="-2.8 0.3 -5" radius="0.12" color="#F97316" animation="property: position; to: -3.2 0.6 -5; dur: 1800; dir: alternate; loop: true"></a-sphere>
      
      <a-box position="2 1 -5" width="3" height="0.8" depth="1.5" color="#78350F"></a-box>
      <a-sphere position="1.5 1.6 -5" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="2.5 1.7 -5" radius="0.35" color="#16A34A"></a-sphere>
      
      <a-cylinder position="-0.5 1 -5" radius="0.1" height="3" color="#94A3B8" rotation="0 0 90"></a-cylinder>
    `,
    info: "Aquaponics: Fish waste feeds plants; plants filter water for fish in a perfect loop."
  },
  aeroponics: {
    sky: "#1E293B",
    entities: `
      <a-plane position="0 0 -4" rotation="-90 0 0" width="20" height="20" color="#64748B"></a-plane>
      <a-light type="point" position="0 4 -4" color="#A855F7" intensity="1.5"></a-light>
      <a-light type="ambient" color="#FFF" intensity="0.3"></a-light>

      <a-box position="0 0.5 -4" width="6" height="1" depth="2" color="#0F172A"></a-box>
      
      <a-sphere position="-2 2 -4" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="0 2.2 -4" radius="0.35" color="#16A34A"></a-sphere>
      <a-sphere position="2 1.9 -4" radius="0.25" color="#22C55E"></a-sphere>

      <a-cone position="-2 1.3 -4" radius-bottom="0" radius-top="0.1" height="1" color="#FDE047"></a-cone>
      <a-cone position="0 1.5 -4" radius-bottom="0" radius-top="0.15" height="1.2" color="#FDE047"></a-cone>
      <a-cone position="2 1.2 -4" radius-bottom="0" radius-top="0.08" height="0.9" color="#FDE047"></a-cone>

      <a-sphere position="-2 0.8 -4" radius="0.5" color="#BAE6FD" opacity="0.3" animation="property: scale; to: 1.5 1.5 1.5; dur: 1000; dir: alternate; loop: true"></a-sphere>
      <a-sphere position="0 1 -4" radius="0.6" color="#BAE6FD" opacity="0.3" animation="property: scale; to: 1.5 1.5 1.5; dur: 1200; dir: alternate; loop: true"></a-sphere>
      <a-sphere position="2 0.7 -4" radius="0.4" color="#BAE6FD" opacity="0.3" animation="property: scale; to: 1.5 1.5 1.5; dur: 900; dir: alternate; loop: true"></a-sphere>
    `,
    info: "Aeroponics: Roots are suspended in air and misted with nutrients for maximum oxygenation."
  },
  vra: {
    sky: "#87CEEB",
    entities: `
      <a-plane position="0 0 -10" rotation="-90 0 0" width="40" height="40" color="#2D5016"></a-plane>
      
      <a-plane position="-5 0.01 -8" rotation="-90 0 0" width="8" height="8" color="#FF4444" opacity="0.5"></a-plane>
      <a-plane position="5 0.01 -12" rotation="-90 0 0" width="6" height="6" color="#44FF44" opacity="0.5"></a-plane>
      <a-plane position="0 0.01 -15" rotation="-90 0 0" width="7" height="5" color="#FFAA00" opacity="0.5"></a-plane>
      
      <a-box position="0 1 -6" width="3" height="1.5" depth="5" color="#EAB308"></a-box>
      <a-cylinder position="-1.8 1.8 -6" radius="0.8" height="0.3" color="#1E293B" rotation="0 0 90"></a-cylinder>
      <a-cylinder position="1.8 1.8 -6" radius="0.8" height="0.3" color="#1E293B" rotation="0 0 90"></a-cylinder>
      
      <a-light type="directional" position="5 10 5" color="#FFFFFF" intensity="1"></a-light>
      <a-light type="ambient" color="#FFF" intensity="0.5"></a-light>
    `,
    info: "VRA: GPS-guided tractor applies varying inputs based on the AI-generated field heat map."
  },
  agrivoltaics: {
    sky: "#60A5FA",
    entities: `
      <a-plane position="0 0 -10" rotation="-90 0 0" width="40" height="40" color="#4ADE80"></a-plane>
      <a-light type="directional" position="3 8 3" color="#FEF08A" intensity="1.2" castShadow="true"></a-light>
      <a-light type="ambient" color="#FFF" intensity="0.4"></a-light>

      <a-box position="-4 3 -8" width="4" height="0.1" depth="3" color="#1E3A8A" rotation="20 0 0"></a-box>
      <a-box position="0 3 -8" width="4" height="0.1" depth="3" color="#1E3A8A" rotation="20 0 0"></a-box>
      <a-box position="4 3 -8" width="4" height="0.1" depth="3" color="#1E3A8A" rotation="20 0 0"></a-box>
      
      <a-cylinder position="-4 1.5 -8" radius="0.1" height="3" color="#94A3B8"></a-cylinder>
      <a-cylinder position="0 1.5 -8" radius="0.1" height="3" color="#94A3B8"></a-cylinder>
      <a-cylinder position="4 1.5 -8" radius="0.1" height="3" color="#94A3B8"></a-cylinder>
      
      <a-sphere position="-3 0.5 -8" radius="0.4" color="#15803D"></a-sphere>
      <a-sphere position="0 0.4 -8" radius="0.35" color="#16A34A"></a-sphere>
      <a-sphere position="3 0.5 -8" radius="0.4" color="#15803D"></a-sphere>
    `,
    info: "Agrivoltaics: Solar panels elevated 3m high generate power while crops thrive in partial shade below."
  },
  drones: {
    sky: "#BAE6FD",
    entities: `
      <a-plane position="0 0 -10" rotation="-90 0 0" width="50" height="50" color="#84CC16"></a-plane>
      <a-light type="directional" position="5 10 5" color="#FFFFFF" intensity="1"></a-light>
      <a-light type="ambient" color="#FFF" intensity="0.6"></a-light>

      <a-entity animation="property: position; to: 5 4 -10; dur: 4000; dir: alternate; loop: true">
        <a-box position="0 5 -15" width="1.5" height="0.2" depth="1.5" color="#334155"></a-box>
        <a-cylinder position="-0.8 5.2 -14.2" radius="0.4" height="0.05" color="#94A3B8" animation="property: rotation; to: 0 360 0; dur: 200; loop: true"></a-cylinder>
        <a-cylinder position="0.8 5.2 -14.2" radius="0.4" height="0.05" color="#94A3B8" animation="property: rotation; to: 0 360 0; dur: 200; loop: true"></a-cylinder>
        <a-cylinder position="0 2.5 -15" radius="0.05" height="5" color="#EF4444" opacity="0.3"></a-cylinder>
      </a-entity>

      <a-sphere position="-2 0.5 -12" radius="0.5" color="#22C55E"></a-sphere>
      <a-sphere position="2 0.5 -10" radius="0.5" color="#EF4444"></a-sphere> `,
    info: "Drones: AI-guided drones survey crops and spray only affected areas with pinpoint accuracy."
  },
  greenhouse: {
    sky: "#38BDF8",
    entities: `
      <a-plane position="0 0 -6" rotation="-90 0 0" width="30" height="30" color="#7BC8A4"></a-plane>
      <a-light type="ambient" color="#FFF" intensity="0.5"></a-light>

      <a-box position="0 2.5 -6" width="12" height="5" depth="10" color="#E0F2FE" opacity="0.2" side="double"></a-box>
      <a-box position="0 0 -6" width="12" height="0.2" depth="10" color="#475569"></a-box>

      <a-sphere position="-3 0.8 -5" radius="0.4" color="#22C55E"></a-sphere>
      <a-sphere position="3 0.8 -7" radius="0.45" color="#16A34A"></a-sphere>

      <a-box position="-5.9 4 -6" width="0.2" height="1" depth="2" color="#94A3B8" animation="property: rotation; to: 0 0 45; dur: 3000; dir: alternate; loop: true"></a-box>
      <a-light type="point" position="-2 4 -5" color="#F472B6" intensity="1.5"></a-light>
      <a-light type="point" position="2 4 -7" color="#60A5FA" intensity="1.5"></a-light>
    `,
    info: "Greenhouse: AI controls vents, lights, and fans to maintain perfect growing conditions year-round."
  },
  "vertical-farming": {
    sky: "#020617",
    entities: `
      <a-plane position="0 0 -5" rotation="-90 0 0" width="20" height="20" color="#334155"></a-plane>
      <a-light type="ambient" color="#FFF" intensity="0.2"></a-light>

      <a-box position="-3 1 -5" width="4" height="0.2" depth="2" color="#1E293B"></a-box>
      <a-box position="-3 2.5 -5" width="4" height="0.2" depth="2" color="#1E293B"></a-box>
      <a-box position="-3 4 -5" width="4" height="0.2" depth="2" color="#1E293B"></a-box>
      
      <a-box position="3 1 -5" width="4" height="0.2" depth="2" color="#1E293B"></a-box>
      <a-box position="3 2.5 -5" width="4" height="0.2" depth="2" color="#1E293B"></a-box>
      <a-box position="3 4 -5" width="4" height="0.2" depth="2" color="#1E293B"></a-box>

      <a-light type="point" position="-3 1.5 -5" color="#C084FC" intensity="2"></a-light>
      <a-light type="point" position="3 3 -5" color="#C084FC" intensity="2"></a-light>

      <a-sphere position="-3 1.3 -5" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="-3 2.8 -5" radius="0.3" color="#16A34A"></a-sphere>
      <a-sphere position="3 1.3 -5" radius="0.3" color="#22C55E"></a-sphere>
    `,
    info: "Vertical Farming: Stacked growing layers under purple LED lights maximize output per square foot."
  },
  "regenerative-no-till": {
    sky: "#7DD3FC",
    entities: `
      <a-plane position="0 0 -10" rotation="-90 0 0" width="40" height="40" color="#713F12"></a-plane>
      <a-light type="directional" position="5 8 3" color="#FEF08A" intensity="1.2"></a-light>
      <a-light type="ambient" color="#FFF" intensity="0.5"></a-light>

      <a-sphere position="-3 0.4 -8" radius="0.4" color="#15803D"></a-sphere>
      <a-sphere position="-1 0.4 -9" radius="0.45" color="#16A34A"></a-sphere>
      <a-sphere position="2 0.4 -7" radius="0.4" color="#15803D"></a-sphere>

      <a-box position="5 1 -6" width="3" height="1.5" depth="2" color="#B45309"></a-box>
      <a-cylinder position="4 1.5 -6" radius="0.6" height="0.2" color="#1E293B" rotation="90 0 0"></a-cylinder>
      <a-cylinder position="6 1.5 -6" radius="0.6" height="0.2" color="#1E293B" rotation="90 0 0"></a-cylinder>
    `,
    info: "No-Till: Seeds are planted without disturbing soil, preserving its natural ecosystem."
  },
};

const VRExperience = () => {
  const { practiceType } = useParams<{ practiceType: string }>();
  const navigate = useNavigate();
  const sceneRef = useRef<HTMLDivElement>(null);
  const [aframeLoaded, setAframeLoaded] = useState(false);

  const method = getMethodBySlug(practiceType || "");
  const scene = vrScenes[practiceType || ""];

  // FIX: Force scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [practiceType]);

  useEffect(() => {
    // Load A-Frame from CDN
    if (document.querySelector('script[src*="aframe"]')) {
      setAframeLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://aframe.io/releases/1.6.0/aframe.min.js";
    script.onload = () => setAframeLoaded(true);
    document.head.appendChild(script);
  }, []);

  if (!method || !scene) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-foreground mb-4">VR Experience Not Found</h1>
          <button onClick={() => navigate("/")} className="text-primary hover:underline">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      {/* Back button overlay */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 glass rounded-full px-4 py-2 text-sm font-bold text-white bg-black/50 flex items-center gap-2 hover:bg-black/70 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Exit VR
      </button>

      {/* Info panel overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl px-6 py-4 max-w-lg text-center bg-black/70 text-white">
        <h3 className="text-sm font-bold mb-1">{method.title} — VR Experience</h3>
        <p className="text-xs text-gray-300">{scene.info}</p>
      </div>

      {/* A-Frame Scene */}
      {aframeLoaded && (
        <div
          ref={sceneRef}
          className="w-full h-full"
          dangerouslySetInnerHTML={{
            __html: `
              <a-scene embedded style="width:100%;height:100%;" vr-mode-ui="enabled: false">
                <a-sky color="${scene.sky}"></a-sky>
                <a-camera position="0 1.6 0" look-controls wasd-controls>
                  <a-cursor color="#22C55E" fuse="false"></a-cursor>
                </a-camera>
                ${scene.entities}
              </a-scene>
            `,
          }}
        />
      )}

      {!aframeLoaded && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="h-8 w-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading VR Environment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VRExperience;