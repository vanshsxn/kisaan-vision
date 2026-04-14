import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Leaf, ShieldCheck, ShieldAlert,
  Loader2, Activity, RotateCcw, ScanLine,
  FileDown, AlertTriangle, Sprout, Bug
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
      // Extract base64 from data URL
      const base64 = imageDataUrl.split(",")[1];

      const { data, error: fnError } = await supabase.functions.invoke("analyze-plant", {
        body: { imageBase64: base64 },
      });

      if (fnError) throw new Error(fnError.message);
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
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
            <Activity className="h-3 w-3" /> AI VISION ENGINE
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">
            CROP <span className="text-emerald-500">DIAGNOSTICS</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Upload any plant or crop image — our AI identifies the species, detects diseases, and recommends treatments.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className={`relative group rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden ${
            imageDataUrl ? "border-primary/50" : "border-white/10 hover:border-primary/30"
          }`}>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

            {!imageDataUrl ? (
              <label
                onClick={(e) => { if (!user) { e.preventDefault(); navigate("/login"); } else { fileInputRef.current?.click(); } }}
                className="flex flex-col items-center justify-center p-20 cursor-pointer"
              >
                <div className="p-5 rounded-full bg-white/5 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-primary h-10 w-10" />
                </div>
                <p className="text-white font-bold">Upload Plant / Crop Photo</p>
                <p className="text-gray-500 text-sm">Supports any plant leaf, fruit, or stem image</p>
              </label>
            ) : (
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                <img src={imageDataUrl} alt="Preview" className="h-full w-full object-cover opacity-60" />
                {isAnalyzing && (
                  <motion.div initial={{ top: "0%" }} animate={{ top: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(16,185,129,1)] z-20" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      <span className="text-primary font-black tracking-widest animate-pulse">ANALYZING WITH AI VISION...</span>
                    </div>
                  ) : !result && !error && (
                    <button onClick={handleAnalyze}
                      className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all">
                      <ScanLine /> ANALYZE NOW
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </motion.div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`mt-8 rounded-[2.5rem] overflow-hidden border-2 shadow-2xl ${
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
                        <Sprout className="h-4 w-4 text-primary" />
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Plant Identified</span>
                      </div>
                      <h3 className="text-3xl font-black text-white">{result.plantName}</h3>
                      <p className="text-gray-500 text-sm italic">{result.scientificName}</p>
                    </div>
                  </div>

                  {/* Disease Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
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
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
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
                    <div className="mb-6 p-5 rounded-3xl bg-white/5 border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">💊 Recommended Treatment</p>
                      <ul className="space-y-2">
                        {result.treatment.map((t, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-primary mt-1">•</span> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prevention */}
                  {result.prevention.length > 0 && (
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
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
