import { useEffect, useRef, useState, lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Sparkles, Activity, Zap, BarChart3, Users, Globe } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const LeafScene = lazy(() => import("./LeafScene"));

const ScrollLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          const section = Math.min(4, Math.floor(self.progress * 5));
          setActiveSection(section);
        },
      });

      // Animate each section
      gsap.utils.toArray<HTMLElement>(".scroll-section").forEach((section, i) => {
        gsap.fromTo(
          section.querySelectorAll(".animate-in"),
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "top 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scanActive = activeSection === 1;
  const diseaseActive = activeSection >= 2;
  const showResult = activeSection >= 3;

  return (
    <div ref={containerRef} className="relative">
      {/* Sticky 3D Scene */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Suspense fallback={null}>
          <LeafScene
            scrollProgress={scrollProgress}
            diseaseActive={diseaseActive}
            scanActive={scanActive}
          />
        </Suspense>
      </div>

      {/* Section 1: Hero */}
      <section className="scroll-section relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center px-6 max-w-4xl mx-auto">
          <div className="animate-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6 backdrop-blur-sm">
            <Activity className="h-3 w-3" /> POWERED BY NEURAL INTELLIGENCE
          </div>
          <h1 className="animate-in text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] mb-6">
            AI That <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600">
              Understands
            </span>
            <br /> Your Crops
          </h1>
          <p className="animate-in text-gray-400 text-lg md:text-xl max-w-lg mx-auto font-medium">
            Revolutionary plant diagnostics powered by deep learning. Upload a leaf, get instant results.
          </p>
          <div className="animate-in mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                document.getElementById("ai-lab")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full bg-primary px-10 py-4 text-sm font-black uppercase text-primary-foreground shadow-xl shadow-primary/20 transition-all"
            >
              Start Scanning
            </motion.button>
          </div>
        </div>
      </section>

      {/* Section 2: Upload / Scan */}
      <section className="scroll-section relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center px-6 max-w-3xl mx-auto">
          <div className={`animate-in relative mx-auto w-64 h-64 md:w-80 md:h-80 rounded-3xl border-2 border-dashed transition-all duration-1000 ${
            scanActive ? "border-primary/80 shadow-[0_0_60px_rgba(34,197,94,0.3)]" : "border-white/10"
          }`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/40 text-sm font-bold tracking-widest uppercase">
                {scanActive ? "SCANNING..." : "UPLOAD AREA"}
              </p>
            </div>
            {scanActive && (
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute left-0 w-full h-0.5 bg-primary shadow-[0_0_20px_rgba(34,197,94,1)] z-20"
              />
            )}
          </div>
          <h2 className="animate-in text-3xl md:text-5xl font-black text-white mt-10 tracking-tight">
            Neural <span className="text-primary">Scan</span> Engine
          </h2>
          <p className="animate-in text-gray-500 mt-4 text-lg">
            Our AI processes every pixel — analyzing cellular structures, chlorophyll patterns, and pathogen signatures.
          </p>
        </div>
      </section>

      {/* Section 3: Detection */}
      <section className="scroll-section relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center px-6 max-w-3xl mx-auto">
          <div className="animate-in">
            <div className="inline-flex p-6 rounded-full bg-rose-500/20 mb-6">
              <ShieldAlert className="h-16 w-16 text-rose-400" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="animate-in text-3xl md:text-5xl font-black text-white tracking-tight">
            Disease <span className="text-rose-400">Detected</span>
          </h2>
          <p className="animate-in text-gray-500 mt-4 text-lg">
            Pathogenic anomalies identified in leaf tissue. Confidence index generated.
          </p>

          <div className="animate-in mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {["Cell Damage", "Fungal Pattern", "Nutrient Loss"].map((label) => (
              <div key={label} className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 backdrop-blur-sm">
                <div className="text-rose-400 text-xs font-bold uppercase tracking-wider">{label}</div>
                <div className="text-white text-2xl font-black mt-1">
                  {Math.floor(Math.random() * 40 + 60)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Result Card */}
      <section className="scroll-section relative z-10 min-h-screen flex items-center justify-center">
        <div className="px-6 w-full max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl"
          >
            <div className="bg-gradient-to-r from-rose-500 to-orange-500 py-3 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white">
              Diagnostic Report Complete
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-rose-500/20">
                  <ShieldAlert className="h-8 w-8 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Tomato Early Blight</h3>
                  <p className="text-gray-500 text-sm font-medium">Alternaria solani</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-bold">Confidence</span>
                  <span className="text-rose-400 font-black">94.7%</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "94.7%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Recommended Treatment</p>
                <p className="text-white text-sm leading-relaxed">
                  Apply chlorothalonil-based fungicide immediately. Remove affected leaves. Ensure proper air circulation between plants.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 5: Trust & Tech */}
      <section className="scroll-section relative z-10 min-h-screen flex items-center justify-center">
        <div className="px-6 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="animate-in text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Trusted by <span className="text-primary">Farmers</span> Worldwide
            </h2>
            <p className="animate-in text-gray-500 text-lg">
              Precision agriculture at scale.
            </p>
          </div>

          <div className="animate-in grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, label: "Scans/Day", value: "50K+", color: "text-yellow-400" },
              { icon: BarChart3, label: "Accuracy", value: "97.3%", color: "text-emerald-400" },
              { icon: Users, label: "Farmers", value: "12K+", color: "text-blue-400" },
              { icon: Globe, label: "Countries", value: "28", color: "text-purple-400" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 text-center hover:bg-white/10 transition-colors">
                <stat.icon className={`h-6 w-6 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollLanding;
