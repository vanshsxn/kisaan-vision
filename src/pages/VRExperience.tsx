import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getMethodBySlug } from "@/data/farmingMethods";

// A-Frame scene configurations per practice type
const vrScenes: Record<string, { sky: string; entities: string; info: string }> = {
  hydroponics: {
    sky: "#1a0a2e",
    entities: `
      <a-box position="-3 1 -4" width="6" height="0.2" depth="0.5" color="#FFFFFF" opacity="0.9"></a-box>
      <a-box position="-3 2 -4" width="6" height="0.2" depth="0.5" color="#FFFFFF" opacity="0.9"></a-box>
      <a-box position="-3 3 -4" width="6" height="0.2" depth="0.5" color="#FFFFFF" opacity="0.9"></a-box>
      <a-box position="-3 0.5 -4" width="6" height="0.1" depth="0.6" color="#0066FF" opacity="0.6"></a-box>
      <a-box position="-3 1.5 -4" width="6" height="0.1" depth="0.6" color="#0066FF" opacity="0.6"></a-box>
      <a-box position="-3 2.5 -4" width="6" height="0.1" depth="0.6" color="#0066FF" opacity="0.6"></a-box>
      <a-light type="point" position="-3 4 -4" color="#00AAFF" intensity="2"></a-light>
      <a-light type="point" position="0 4 -4" color="#AA00FF" intensity="1"></a-light>
      <a-sphere position="-4 1.3 -4" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="-2 1.3 -4" radius="0.25" color="#16A34A"></a-sphere>
      <a-sphere position="0 1.3 -4" radius="0.35" color="#22C55E"></a-sphere>
      <a-sphere position="-3 2.3 -4" radius="0.3" color="#16A34A"></a-sphere>
      <a-sphere position="-1 2.3 -4" radius="0.28" color="#22C55E"></a-sphere>
    `,
    info: "Hydroponics: PVC channels carry nutrient-rich water to plant roots under LED grow lights."
  },
  aquaponics: {
    sky: "#0a1628",
    entities: `
      <a-cylinder position="-3 1 -5" radius="1.5" height="2" color="#1E3A5F" opacity="0.7" open-ended="true"></a-cylinder>
      <a-circle position="-3 0 -5" radius="1.5" color="#0066AA" opacity="0.5" rotation="-90 0 0"></a-circle>
      <a-sphere position="-3.5 0.5 -5" radius="0.15" color="#FF6600" animation="property: position; to: -2.5 0.8 -5; dur: 2000; dir: alternate; loop: true"></a-sphere>
      <a-sphere position="-2.8 0.3 -5" radius="0.12" color="#FF8800" animation="property: position; to: -3.2 0.6 -5; dur: 1800; dir: alternate; loop: true"></a-sphere>
      <a-sphere position="-3.2 0.7 -5" radius="0.1" color="#FFAA00" animation="property: position; to: -2.9 0.4 -5; dur: 2200; dir: alternate; loop: true"></a-sphere>
      <a-box position="2 1 -5" width="3" height="0.8" depth="1.5" color="#3D2B1F"></a-box>
      <a-sphere position="1.5 1.6 -5" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="2.5 1.7 -5" radius="0.35" color="#16A34A"></a-sphere>
      <a-cylinder position="0 1 -5" radius="0.1" height="2" color="#4488AA" opacity="0.6"></a-cylinder>
      <a-light type="point" position="0 3 -5" color="#00BBFF" intensity="1.5"></a-light>
    `,
    info: "Aquaponics: Fish produce waste that feeds plants; plants filter water for fish — a perfect loop."
  },
  aeroponics: {
    sky: "#0d0020",
    entities: `
      <a-box position="0 0 -4" width="8" height="0.1" depth="6" color="#1a1a2e"></a-box>
      <a-cylinder position="-2 2 -4" radius="0.05" height="4" color="#333"></a-cylinder>
      <a-cylinder position="2 2 -4" radius="0.05" height="4" color="#333"></a-cylinder>
      <a-cylinder position="0 2 -4" radius="0.05" height="4" color="#333"></a-cylinder>
      <a-cone position="-2 1 -4" radius-bottom="0.3" radius-top="0" height="0.6" color="#22C55E" rotation="180 0 0"></a-cone>
      <a-cone position="0 1.2 -4" radius-bottom="0.35" radius-top="0" height="0.7" color="#16A34A" rotation="180 0 0"></a-cone>
      <a-cone position="2 0.8 -4" radius-bottom="0.25" radius-top="0" height="0.5" color="#22C55E" rotation="180 0 0"></a-cone>
      <a-sphere position="-2 0.3 -4" radius="0.05" color="#AADDFF" opacity="0.5" animation="property: position; to: -2 0.5 -4; dur: 1000; dir: alternate; loop: true"></a-sphere>
      <a-sphere position="0 0.5 -4" radius="0.04" color="#AADDFF" opacity="0.5" animation="property: position; to: 0 0.7 -4; dur: 800; dir: alternate; loop: true"></a-sphere>
      <a-light type="point" position="0 4 -4" color="#AA00FF" intensity="2"></a-light>
      <a-light type="point" position="-2 4 -4" color="#8800FF" intensity="1"></a-light>
    `,
    info: "Aeroponics: Roots are suspended in air and misted with nutrients for maximum oxygenation."
  },
  vra: {
    sky: "#87CEEB",
    entities: `
      <a-plane position="0 0 -10" rotation="-90 0 0" width="40" height="40" color="#2D5016"></a-plane>
      <a-plane position="-5 0.01 -8" rotation="-90 0 0" width="8" height="8" color="#FF4444" opacity="0.3"></a-plane>
      <a-plane position="5 0.01 -12" rotation="-90 0 0" width="6" height="6" color="#44FF44" opacity="0.3"></a-plane>
      <a-plane position="0 0.01 -15" rotation="-90 0 0" width="7" height="5" color="#FFAA00" opacity="0.3"></a-plane>
      <a-box position="0 1 -6" width="3" height="1.5" depth="5" color="#CC8800"></a-box>
      <a-cylinder position="-1.8 1.8 -6" radius="0.8" height="0.3" color="#333"></a-cylinder>
      <a-cylinder position="1.8 1.8 -6" radius="0.8" height="0.3" color="#333"></a-cylinder>
      <a-light type="directional" position="5 10 5" color="#FFFFFF" intensity="1"></a-light>
      <a-light type="ambient" color="#FFE4B5" intensity="0.5"></a-light>
    `,
    info: "VRA: GPS-guided tractor applies varying inputs based on the AI-generated field heat map."
  },
  agrivoltaics: {
    sky: "#4A90D9",
    entities: `
      <a-plane position="0 0 -10" rotation="-90 0 0" width="30" height="30" color="#2D5016"></a-plane>
      <a-box position="-4 3 -8" width="4" height="0.1" depth="2" color="#1a1a3e" metalness="0.8" roughness="0.2"></a-box>
      <a-box position="0 3 -8" width="4" height="0.1" depth="2" color="#1a1a3e" metalness="0.8" roughness="0.2"></a-box>
      <a-box position="4 3 -8" width="4" height="0.1" depth="2" color="#1a1a3e" metalness="0.8" roughness="0.2"></a-box>
      <a-cylinder position="-4 1.5 -8" radius="0.1" height="3" color="#888"></a-cylinder>
      <a-cylinder position="0 1.5 -8" radius="0.1" height="3" color="#888"></a-cylinder>
      <a-cylinder position="4 1.5 -8" radius="0.1" height="3" color="#888"></a-cylinder>
      <a-sphere position="-3 0.5 -8" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="-1 0.4 -8" radius="0.25" color="#16A34A"></a-sphere>
      <a-sphere position="1 0.5 -8" radius="0.35" color="#22C55E"></a-sphere>
      <a-sphere position="3 0.4 -8" radius="0.3" color="#16A34A"></a-sphere>
      <a-light type="directional" position="3 8 3" color="#FFD700" intensity="1.5"></a-light>
    `,
    info: "Agrivoltaics: Solar panels elevated 3m high generate power while crops thrive in partial shade below."
  },
  drones: {
    sky: "#87CEEB",
    entities: `
      <a-plane position="0 -2 -10" rotation="-90 0 0" width="50" height="50" color="#2D5016"></a-plane>
      <a-box position="0 5 -15" width="1" height="0.2" depth="1" color="#333" animation="property: position; to: 10 5 -15; dur: 5000; dir: alternate; loop: true"></a-box>
      <a-cylinder position="-0.5 5.2 -15" radius="0.3" height="0.05" color="#555" animation="property: position; to: 9.5 5.2 -15; dur: 5000; dir: alternate; loop: true; easing: linear"></a-cylinder>
      <a-cylinder position="0.5 5.2 -15" radius="0.3" height="0.05" color="#555" animation="property: position; to: 10.5 5.2 -15; dur: 5000; dir: alternate; loop: true; easing: linear"></a-cylinder>
      <a-sphere position="-5 0.3 -12" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="-3 0.4 -14" radius="0.35" color="#16A34A"></a-sphere>
      <a-sphere position="2 0.3 -10" radius="0.3" color="#FF4444" opacity="0.7"></a-sphere>
      <a-light type="directional" position="5 10 5" color="#FFFFFF" intensity="1.2"></a-light>
      <a-light type="ambient" color="#E8F0FF" intensity="0.6"></a-light>
    `,
    info: "Drones: AI-guided drones survey crops and spray only affected areas with pinpoint accuracy."
  },
  greenhouse: {
    sky: "#1a2a1a",
    entities: `
      <a-box position="0 2 -6" width="10" height="4" depth="8" color="#AADDCC" opacity="0.15" side="double"></a-box>
      <a-box position="0 0 -6" width="10" height="0.1" depth="8" color="#3D2B1F"></a-box>
      <a-sphere position="-3 0.5 -5" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="-1 0.6 -5" radius="0.35" color="#16A34A"></a-sphere>
      <a-sphere position="1 0.5 -5" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="3 0.55 -5" radius="0.32" color="#16A34A"></a-sphere>
      <a-sphere position="-3 0.4 -7" radius="0.28" color="#22C55E"></a-sphere>
      <a-sphere position="1 0.45 -7" radius="0.3" color="#16A34A"></a-sphere>
      <a-box position="-4.9 3 -6" width="0.2" height="0.8" depth="0.3" color="#888" animation="property: rotation; to: 0 0 30; dur: 3000; dir: alternate; loop: true"></a-box>
      <a-light type="point" position="-2 3.5 -5" color="#FF66AA" intensity="1.5"></a-light>
      <a-light type="point" position="2 3.5 -7" color="#6666FF" intensity="1.5"></a-light>
      <a-light type="ambient" color="#FFFFFF" intensity="0.3"></a-light>
    `,
    info: "Greenhouse: AI controls vents, lights, and fans to maintain perfect growing conditions year-round."
  },
  "vertical-farming": {
    sky: "#0a0015",
    entities: `
      <a-box position="0 0 -5" width="8" height="0.1" depth="6" color="#1a1a2e"></a-box>
      <a-box position="-3 1 -5" width="6" height="0.15" depth="1" color="#222"></a-box>
      <a-box position="-3 2.5 -5" width="6" height="0.15" depth="1" color="#222"></a-box>
      <a-box position="-3 4 -5" width="6" height="0.15" depth="1" color="#222"></a-box>
      <a-box position="3 1 -5" width="6" height="0.15" depth="1" color="#222"></a-box>
      <a-box position="3 2.5 -5" width="6" height="0.15" depth="1" color="#222"></a-box>
      <a-box position="3 4 -5" width="6" height="0.15" depth="1" color="#222"></a-box>
      <a-light type="point" position="-3 1.5 -5" color="#CC44FF" intensity="2"></a-light>
      <a-light type="point" position="-3 3 -5" color="#AA22FF" intensity="2"></a-light>
      <a-light type="point" position="3 1.5 -5" color="#CC44FF" intensity="2"></a-light>
      <a-light type="point" position="3 3 -5" color="#AA22FF" intensity="2"></a-light>
      <a-sphere position="-4 1.3 -5" radius="0.2" color="#22C55E"></a-sphere>
      <a-sphere position="-2 1.3 -5" radius="0.25" color="#16A34A"></a-sphere>
      <a-sphere position="2 1.3 -5" radius="0.2" color="#22C55E"></a-sphere>
      <a-sphere position="4 1.3 -5" radius="0.22" color="#16A34A"></a-sphere>
    `,
    info: "Vertical Farming: Stacked growing layers under purple LED lights maximize output per square foot."
  },
  "regenerative-no-till": {
    sky: "#87CEEB",
    entities: `
      <a-plane position="0 0 -10" rotation="-90 0 0" width="40" height="40" color="#5C4033"></a-plane>
      <a-plane position="0 0.05 -10" rotation="-90 0 0" width="40" height="40" color="#8B7355" opacity="0.5"></a-plane>
      <a-sphere position="-5 0.3 -8" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="-2 0.4 -9" radius="0.35" color="#16A34A"></a-sphere>
      <a-sphere position="1 0.3 -7" radius="0.3" color="#22C55E"></a-sphere>
      <a-sphere position="4 0.35 -10" radius="0.32" color="#16A34A"></a-sphere>
      <a-box position="5 0.8 -6" width="4" height="1" depth="1.5" color="#8B4513"></a-box>
      <a-cylinder position="3.5 1.3 -6" radius="0.6" height="0.2" color="#444"></a-cylinder>
      <a-cylinder position="6.5 1.3 -6" radius="0.6" height="0.2" color="#444"></a-cylinder>
      <a-light type="directional" position="5 8 3" color="#FFD700" intensity="1.2"></a-light>
      <a-light type="ambient" color="#FFE4B5" intensity="0.5"></a-light>
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
        className="absolute top-4 left-4 z-50 glass rounded-full px-4 py-2 text-sm font-bold text-foreground flex items-center gap-2 hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Exit VR
      </button>

      {/* Info panel overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl px-6 py-4 max-w-lg text-center">
        <h3 className="text-sm font-bold text-foreground mb-1">{method.title} — VR Experience</h3>
        <p className="text-xs text-muted-foreground">{scene.info}</p>
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
                <a-plane position="0 0 0" rotation="-90 0 0" width="50" height="50" color="#111" opacity="0.3"></a-plane>
              </a-scene>
            `,
          }}
        />
      )}

      {!aframeLoaded && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading VR Environment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VRExperience;
