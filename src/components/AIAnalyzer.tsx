import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, ShieldCheck, ShieldAlert,
  Loader2, RotateCcw, ScanLine,
  AlertTriangle, Sprout, Bug, Info, CheckCircle2, Camera
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export interface PlantAnalysis {
  plantName: string;
  scientificName: string;
  disease: string;
  diseaseScientific: string;
  confidence: number;
  severity: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  isHealthy: boolean;
}

const EXAMPLE_PLANTS = [
  { name: "Rice plant", emoji: "🌾" },
  { name: "Tomato blight", emoji: "🍅" },
  { name: "Mosaic virus", emoji: "🌿" },
  { name: "Cotton plant", emoji: "☁️" },
];

const TIPS = [
  "Take clear close-up photos",
  "Make sure leaves, stems, or fruits are visible",
  "Multiple angles help AI accuracy",
  "Good lighting improves results",
];

const AIAnalyzer = () => {
  const navigate = useNavigate();
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PlantAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const requireAuth = useCallback(() => {
    if (!user) { navigate("/login"); return false; }
    return true;
  }, [user, navigate]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          setImageDataUrl(e.target.result);
          setResult(null);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!requireAuth() || !imageDataUrl) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const base64 = imageDataUrl.split(",")[1];
      const { data, error: fnError } = await supabase.functions.invoke("analyze-plant", {
        body: { imageBase64: base64 },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      setResult(data as PlantAnalysis);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const severityColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case "severe": return "text-red-400";
      case "moderate": return "text-orange-400";
      case "mild": return "text-yellow-400";
      default: return "text-emerald-400";
    }
  };

  return (
    <section id="ai-lab" className="relative py-24 overflow-hidden bg-[#030711]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">
            Identify Plants and <span className="text-emerald-400">Diagnose Diseases</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Upload photos of your plants or crops, and our AI will identify them and diagnose any problems.
          </p>
        </div>

        {/* Main content: Upload + Examples side by side */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
            {/* Upload area - 3 cols */}
            <div className="lg:col-span-3">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

              {!imageDataUrl ? (
                <div
                  onClick={() => { if (!user) { navigate("/login"); } else { fileInputRef.current?.click(); } }}
                  className="rounded-2xl border-2 border-dashed border-white/10 hover:border-emerald-500/30 bg-white/5 backdrop-blur-sm p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group min-h-[280px]"
                >
                  <div className="p-5 rounded-full bg-emerald-500/10 mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-emerald-400 h-10 w-10" />
                  </div>
                  <p className="text-white font-bold text-lg mb-1">Upload photos for diagnosis</p>
                  <p className="text-gray-500 text-sm mb-6">Drag and drop, or select images to identify and diagnose plants</p>
                  <button className="bg-emerald-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-emerald-400 transition-colors">
                    Upload Photos
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm">
                  <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                    <img src={imageDataUrl} alt="Preview" className="h-full w-full object-cover" />
                    {isAnalyzing && (
                      <motion.div
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] z-20"
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
                          <span className="text-emerald-400 font-black tracking-widest animate-pulse">ANALYZING...</span>
                        </div>
                      ) : !result && !error && (
                        <button onClick={handleAnalyze}
                          className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all">
                          <ScanLine /> ANALYZE NOW
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Examples + Tips - 2 cols */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Example plants */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {EXAMPLE_PLANTS.map((plant) => (
                    <div key={plant.name} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-colors cursor-pointer">
                      <span className="text-3xl">{plant.emoji}</span>
                      <span className="text-xs text-gray-400 font-medium text-center">{plant.name}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full text-center text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-emerald-400 transition-colors py-2 border border-white/5 rounded-xl">
                  TRY EXAMPLES
                </button>
              </div>

              {/* AI Tips */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm font-bold text-white">AI Diagnosis Tips:</p>
                </div>
                <ul className="space-y-2.5">
                  {TIPS.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`mt-8 rounded-[2rem] overflow-hidden border-2 shadow-2xl ${
                  result.isHealthy ? "border-emerald-500/40 bg-emerald-950/20" : "border-rose-500/40 bg-rose-950/20"
                }`}>
                <div className={`py-3 text-center text-[10px] font-black uppercase tracking-[0.3em] ${
                  result.isHealthy ? "bg-emerald-500 text-black" : "bg-rose-500 text-white"
                }`}>
                  AI Vision Diagnostic Complete
                </div>

                <div className="p-8 md:p-10">
                  {/* Plant Info */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`p-4 rounded-2xl ${result.isHealthy ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                      {result.isHealthy ? <ShieldCheck size={40} className="text-emerald-400" /> : <ShieldAlert size={40} className="text-rose-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sprout className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Plant Identified</span>
                      </div>
                      <h3 className="text-3xl font-black text-white">{result.plantName}</h3>
                      <p className="text-gray-500 text-sm italic">{result.scientificName}</p>
                    </div>
                  </div>

                  {/* Disease Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Bug className="h-3 w-3 text-gray-500" />
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Disease</p>
                      </div>
                      <p className={`text-lg font-black ${result.isHealthy ? "text-emerald-400" : "text-rose-400"}`}>
                        {result.disease}
                      </p>
                      {result.diseaseScientific !== "N/A" && (
                        <p className="text-xs text-gray-600 italic mt-1">{result.diseaseScientific}</p>
                      )}
                    </div>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Severity & Confidence</p>
                      <p className={`text-lg font-black ${severityColor(result.severity)}`}>{result.severity}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full ${result.isHealthy ? "bg-emerald-500" : "bg-rose-500"}`} />
                        </div>
                        <span className="text-xs font-black text-gray-400">{result.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {result.symptoms.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" /> Symptoms Detected
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.symptoms.map((s, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Treatment */}
                  {result.treatment.length > 0 && (
                    <div className="mb-6 p-5 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">💊 Recommended Treatment</p>
                      <ul className="space-y-2">
                        {result.treatment.map((t, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prevention */}
                  {result.prevention.length > 0 && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">🛡️ Prevention</p>
                      <ul className="space-y-2">
                        {result.prevention.map((p, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button onClick={() => { setImageDataUrl(null); setResult(null); setError(null); }}
                    className="mt-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mx-auto">
                    <RotateCcw size={16} /> Run New Analysis
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default AIAnalyzer;
