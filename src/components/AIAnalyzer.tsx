import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, Cpu, Leaf, ShieldCheck, ShieldAlert, 
  Loader2, Sparkles, Activity, ArrowRight, RotateCcw,
  ScanLine // Added missing icon import
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { classifyImage, imageFromDataUrl, isHealthy, type ClassificationResult } from "@/lib/plantClassifier";
import { Progress } from "@/components/ui/progress";

const AIAnalyzer = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
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
    if (!user) {
      navigate("/login");
      return false;
    }
    return true;
  }, [user, navigate]);

  // --- FIXED: Added handleFileSelect ---
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setImageDataUrl(e.target.result);
          setResult(null); // Clear previous result when new image is picked
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!requireAuth() || !imageDataUrl) return;
    
    setIsAnalyzing(true);
    setResult(null);

    try {
      const img = await imageFromDataUrl(imageDataUrl);
      const res = await classifyImage(img);
      
      // Artificial delay to make the "Scanning" animation feel real
      setTimeout(() => {
        setResult(res);
        setIsAnalyzing(false);
      }, 1500);
    } catch (err) {
      console.error("Classification error:", err);
      setIsAnalyzing(false);
    }
  };

  const healthy = result ? isHealthy(result.label) : false;
  const confidencePct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <section id="ai-lab" className="relative py-24 overflow-hidden bg-[#030711]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4"
          >
            <Activity className="h-3 w-3" /> NEURAL ENGINE ACTIVE
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">
            CROP <span className="text-emerald-500">DIAGNOSTICS</span>
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className={`relative group rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden ${
            imageDataUrl ? "border-primary/50" : "border-white/10 hover:border-primary/30"
          }`}>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileSelect} 
            />
            
            {!imageDataUrl ? (
              <label 
                onClick={() => !user && navigate("/login")}
                className="flex flex-col items-center justify-center p-20 cursor-pointer"
              >
                <div className="p-5 rounded-full bg-white/5 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-primary h-10 w-10" />
                </div>
                <p className="text-white font-bold">Upload Leaf Photo</p>
                <p className="text-gray-500 text-sm">Drag and drop or click to browse</p>
              </label>
            ) : (
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                <img src={imageDataUrl} alt="Preview" className="h-full w-full object-cover opacity-60" />
                
                {isAnalyzing && (
                  <motion.div 
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(16,185,129,1)] z-20"
                  />
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                   {isAnalyzing ? (
                     <div className="flex flex-col items-center gap-3">
                       <Loader2 className="h-10 w-10 text-primary animate-spin" />
                       <span className="text-primary font-black tracking-widest animate-pulse">ANALYZING DNA PATHOGENS...</span>
                     </div>
                   ) : !result && (
                     <button 
                       onClick={handleAnalyze}
                       className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all"
                     >
                       <ScanLine /> START SCAN NOW
                     </button>
                   )}
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`mt-8 rounded-[2.5rem] overflow-hidden border-2 shadow-2xl transition-colors ${
                  healthy ? "border-emerald-500/40 bg-emerald-950/20" : "border-rose-500/40 bg-rose-950/20"
                }`}
              >
                <div className={`py-3 text-center text-[10px] font-black uppercase tracking-[0.3em] ${
                  healthy ? "bg-emerald-500 text-black" : "bg-rose-500 text-white"
                }`}>
                  Neural Diagnostic Complete
                </div>

                <div className="p-10 flex flex-col items-center text-center">
                  <div className={`mb-6 p-5 rounded-full ${healthy ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                    {healthy ? <ShieldCheck size={56} strokeWidth={1.5} /> : <ShieldAlert size={56} strokeWidth={1.5} />}
                  </div>

                  <h3 className="text-4xl font-black text-white mb-2">{result.label}</h3>
                  <div className="flex items-center gap-2 mb-8">
                    <span className="text-gray-400 text-sm uppercase font-bold tracking-widest">Confidence Index:</span>
                    <span className={`text-sm font-black ${healthy ? 'text-emerald-400' : 'text-rose-400'}`}>{confidencePct}%</span>
                  </div>

                  <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden mb-10 border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${confidencePct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full shadow-[0_0_20px_rgba(255,255,255,0.2)] ${healthy ? "bg-emerald-500" : "bg-rose-500"}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-left">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Biological Status</p>
                      <p className={`text-lg font-black ${healthy ? "text-emerald-400" : "text-rose-400"}`}>
                        {healthy ? "OPTIMAL HEALTH" : "CRITICAL ALERT"}
                      </p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-left">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Immediate Action</p>
                      <p className="text-white text-sm font-medium leading-tight">
                        {healthy ? "No treatment required. Maintain hydration." : "Isolate crop and apply targeted fungicide."}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setImageDataUrl(null); setResult(null); }}
                    className="mt-10 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                  >
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