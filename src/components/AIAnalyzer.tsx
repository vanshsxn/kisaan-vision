import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Cpu, ScanLine, Sparkles, Leaf, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
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

  const readFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrag = useCallback((e: React.DragEvent, entering: boolean) => {
    e.preventDefault();
    setIsDragging(entering);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!requireAuth()) return;
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, [requireAuth]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!requireAuth()) return;
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }, [requireAuth]);

  const handleAnalyze = async () => {
    if (!requireAuth()) return;
    if (!imageDataUrl) {
      // No image selected — go to chatbot
      navigate("/chatbot");
      return;
    }
    setIsAnalyzing(true);
    setResult(null);
    try {
      const img = await imageFromDataUrl(imageDataUrl);
      const res = await classifyImage(img);
      setResult(res);
    } catch (err) {
      console.error("Classification error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const healthy = result ? isHealthy(result.label) : false;
  const confidencePct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <section id="ai-lab" className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold text-primary mb-6"
          >
            <Cpu className="h-3.5 w-3.5" />
            AI-Powered
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4"
          >
            AI Crop <span className="text-gradient-green">Analyzer</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-md mx-auto"
          >
            Upload a photo of your crop leaf and let our AI detect diseases, deficiencies, and health status.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-xl mx-auto"
        >
          {/* Upload Zone */}
          <label
            onClick={(e) => { if (!requireAuth()) e.preventDefault(); }}
            onDragOver={(e) => handleDrag(e, true)}
            onDragLeave={(e) => handleDrag(e, false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-2xl p-12 cursor-pointer transition-all duration-500 ${
              isDragging ? "upload-zone-glow scale-[1.02]" : "upload-zone-glow"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="sr-only"
            />

            {imageDataUrl ? (
              <div className="text-center">
                <img
                  src={imageDataUrl}
                  alt="Preview"
                  className="h-40 w-40 object-cover rounded-xl mx-auto mb-4 border-2 border-primary/20"
                />
                <p className="text-sm font-semibold text-foreground">{fileName}</p>
                <p className="text-xs text-primary mt-1">Ready for analysis</p>
              </div>
            ) : (
              <>
                <motion.div
                  animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                  className="relative mb-6"
                >
                  <div className="rounded-full glass p-5 glow-green-subtle">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-12px] rounded-full border border-primary/10"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-24px] rounded-full border border-primary/5"
                  />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Drop your crop image here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse • PNG, JPG up to 10MB
                  </p>
                </div>
              </>
            )}
          </label>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground flex items-center justify-center gap-2 hover:glow-green transition-all disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Leaf className="h-4 w-4" />
                  Scan Leaf
                </>
              )}
            </motion.button>
          </div>

          {/* Result Card */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", duration: 0.5 }}
                className={`mt-8 rounded-2xl border p-6 ${
                  healthy
                    ? "border-primary/30 bg-primary/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-full p-3 ${
                      healthy ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {healthy ? (
                      <ShieldCheck className="h-6 w-6" />
                    ) : (
                      <ShieldAlert className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Diagnosis
                    </p>
                    <h3 className="text-xl font-black text-foreground mb-1">
                      {result.label}
                    </h3>
                    <p className={`text-sm font-semibold mb-4 ${healthy ? "text-primary" : "text-destructive"}`}>
                      {healthy ? "Your crop looks healthy! ✅" : "Disease detected — take action ⚠️"}
                    </p>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="text-foreground">{confidencePct}%</span>
                      </div>
                      <Progress
                        value={confidencePct}
                        className={`h-2 ${healthy ? "" : "[&>div]:bg-destructive"}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["Disease Detection", "Growth Stage", "Nutrient Analysis", "Pest Identification"].map(
              (feature, i) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                >
                  <Sparkles className="h-3 w-3 text-primary animate-pulse-glow" />
                  {feature}
                </motion.span>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIAnalyzer;
