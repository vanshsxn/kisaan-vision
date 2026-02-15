import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Cpu, ScanLine, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AIAnalyzer = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

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

  const handleDrag = useCallback((e: React.DragEvent, entering: boolean) => {
    e.preventDefault();
    setIsDragging(entering);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!requireAuth()) return;
    const file = e.dataTransfer.files[0];
    if (file) setFileName(file.name);
  }, [requireAuth]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!requireAuth()) return;
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }, [requireAuth]);

  const handleAnalyze = () => {
    if (!requireAuth()) return;
    navigate("/chatbot");
  };

  return (
    <section id="ai-lab" className="relative py-32 overflow-hidden">
      {/* Background glow */}
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
            Experimental
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
            Upload a photo of your crop and let our AI detect diseases, deficiencies, and growth stage.
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
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="sr-only"
            />

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

            {fileName ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">{fileName}</p>
                <p className="text-xs text-primary mt-1">Ready for analysis</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  Drop your crop image here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse • PNG, JPG up to 10MB
                </p>
              </div>
            )}
          </label>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAnalyze}
            className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground flex items-center justify-center gap-2 hover:glow-green transition-all"
          >
            <ScanLine className="h-4 w-4" />
            Analyze with AI
          </motion.button>

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
