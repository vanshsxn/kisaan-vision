import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload, Loader2, Info, CheckCircle2, AlertTriangle,
  Sprout, ShieldCheck, Activity, Leaf, FlaskConical, X, Download, RotateCcw, ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";

const EXAMPLE_PLANTS = [
  { name: "Rice plant", image: "https://images.unsplash.com/photo-1568347877321-f8935c7dc5a8?w=400&q=80" },
  { name: "Tomato blight", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Tomato_late_blight.jpg/640px-Tomato_late_blight.jpg" },
  { name: "Apple scab", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Apple_scab.JPG/640px-Apple_scab.JPG" },
  { name: "Cotton plant", image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400&q=80" },
];

interface Diagnosis {
  plantName: string;
  scientificName: string;
  disease: string;
  diseaseScientific: string;
  confidence: number;
  severity: string;
  isHealthy: boolean;
  healthScore: number;
  affectedArea: number;
  spreadRisk: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
}

// ---- Utilities ----
const resizeImage = (file: File, maxSize = 1024, quality = 0.85): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

const urlToFile = async (url: string, name: string): Promise<File> => {
  const r = await fetch(url, { mode: "cors" });
  if (!r.ok) throw new Error(`Image fetch failed: ${r.status}`);
  const blob = await r.blob();
  return new File([blob], name, { type: blob.type || "image/jpeg" });
};

// Direct invocation — uses CORRECT project URL from env, bypassing potentially stale client.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://hpdqrrhdoqvcdbmpxqqz.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZHFycmhkb3F2Y2RibXB4cXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTcxNTYsImV4cCI6MjA4NjUzMzE1Nn0.KdQtvKEY5qhrJoqK5a_s8KBFv6QcHudBIOkhhXXaoME";

const callAnalyze = async (imageBase64: string): Promise<Diagnosis> => {
  const url = `${SUPABASE_URL}/functions/v1/analyze-plant`;
  console.log("[AIAnalyzer] POST", url, "payload size:", imageBase64.length);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({ imageBase64 }),
    });
  } catch (netErr: any) {
    console.error("[AIAnalyzer] network error:", netErr);
    throw new Error(`Network error reaching AI service. ${netErr?.message || ""}`);
  }

  console.log("[AIAnalyzer] response status:", res.status);
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  console.log("[AIAnalyzer] response body:", data);

  if (!res.ok) {
    const msg = data?.error || data?.message || `Server error ${res.status}`;
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data as Diagnosis;
};

// ---- Component ----
const AIAnalyzer = () => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<string>("");
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastBase64Ref = useRef<string | null>(null);

  // Smooth fake progress while waiting
  useEffect(() => {
    if (!isAnalyzing) { setProgress(0); return; }
    setProgress(5);
    const id = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(1, (90 - p) * 0.06) : p));
    }, 250);
    return () => clearInterval(id);
  }, [isAnalyzing]);

  const runAnalysis = useCallback(async (base64: string, attempt = 0) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setRetryAttempt(attempt);
    setStage(attempt === 0 ? "Sending to AI..." : `Retrying (attempt ${attempt + 1})...`);
    try {
      const data = await callAnalyze(base64);
      setProgress(100);
      setResult(data);
      toast.success(`Diagnosis complete: ${data.plantName}`);
    } catch (e: any) {
      const msg = e?.message || "Unknown error";
      console.error("[AIAnalyzer] analysis failed:", msg);
      // Auto-retry once on transient errors
      if (attempt === 0 && /network|fetch|timeout|502|503|504/i.test(msg)) {
        console.log("[AIAnalyzer] auto-retrying...");
        toast.info("Retrying analysis...");
        await new Promise((r) => setTimeout(r, 800));
        return runAnalysis(base64, 1);
      }
      setError(msg);
      toast.error(`Analysis failed: ${msg}`);
    } finally {
      setIsAnalyzing(false);
      setStage("");
    }
  }, []);

  const handleFile = useCallback(async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG/PNG)");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image too large (max 15MB)");
      return;
    }
    try {
      setStage("Processing image...");
      setIsAnalyzing(true);
      setError(null);
      setResult(null);
      const dataUrl = await resizeImage(file);
      setImageDataUrl(dataUrl);
      setImageFileName(file.name);
      const base64 = dataUrl.split(",")[1];
      lastBase64Ref.current = base64;
      await runAnalysis(base64, 0);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to process image");
      toast.error(e?.message || "Failed to process image");
      setIsAnalyzing(false);
    }
  }, [runAnalysis]);

  const handleExample = useCallback(async (url: string, name: string) => {
    try {
      toast.info(`Loading ${name}...`);
      setStage("Fetching example...");
      setIsAnalyzing(true);
      const file = await urlToFile(url, `${name}.jpg`);
      await handleFile(file);
    } catch (e: any) {
      console.error(e);
      toast.error(`Could not load example: ${e?.message || ""}`);
      setIsAnalyzing(false);
    }
  }, [handleFile]);

  const retry = () => {
    if (lastBase64Ref.current) runAnalysis(lastBase64Ref.current, retryAttempt + 1);
  };

  const reset = () => {
    setImageDataUrl(null);
    setImageFileName("");
    setResult(null);
    setError(null);
    lastBase64Ref.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadPDF = () => {
    if (!result) return;
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 40;
      let y = margin;

      // Header
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageW, 80, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Kisaan Vision — Plant Diagnosis Report", margin, 50);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 68);
      y = 110;

      // Image thumbnail
      if (imageDataUrl) {
        try {
          doc.addImage(imageDataUrl, "JPEG", margin, y, 140, 140);
        } catch (e) { console.warn("Image embed failed", e); }
      }

      // Plant identity (right of image)
      const tx = margin + 160;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(result.plantName, tx, y + 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);
      doc.text(result.scientificName || "—", tx, y + 38);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(result.isHealthy ? 16 : 220, result.isHealthy ? 185 : 38, result.isHealthy ? 129 : 38);
      doc.text(result.isHealthy ? "✓ Healthy Plant" : `⚠ ${result.disease}`, tx, y + 64);

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Severity: ${result.severity}`, tx, y + 86);
      doc.text(`Confidence: ${Math.round(result.confidence)}%`, tx, y + 102);
      doc.text(`Health Score: ${Math.round(result.healthScore)}%`, tx, y + 118);
      doc.text(`Affected Area: ${Math.round(result.affectedArea)}%`, tx, y + 134);

      y += 170;

      const section = (title: string, items: string[]) => {
        if (y > 720) { doc.addPage(); y = margin; }
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, pageW - margin * 2, 22, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text(title, margin + 10, y + 15);
        y += 32;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        const list = items.length ? items : ["None reported"];
        list.forEach((item) => {
          const lines = doc.splitTextToSize(`• ${item}`, pageW - margin * 2 - 10);
          if (y + lines.length * 14 > 800) { doc.addPage(); y = margin; }
          doc.text(lines, margin + 10, y);
          y += lines.length * 14 + 2;
        });
        y += 8;
      };

      section("Symptoms Observed", result.symptoms);
      section("Recommended Treatment", result.treatment);
      section("Prevention Measures", result.prevention);

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Kisaan Vision AI Report  •  Page ${i} of ${pageCount}  •  Not a substitute for professional advice`,
          pageW / 2, 820, { align: "center" }
        );
      }

      const safeName = result.plantName.replace(/[^a-z0-9]/gi, "_");
      doc.save(`KisaanVision_${safeName}_${Date.now()}.pdf`);
      toast.success("PDF report downloaded");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <section id="ai-lab" className="py-20 bg-[#f8fafc]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#334155] mb-4">
            Identify Plants and <span className="text-[#10b981]">Diagnose Diseases</span>
          </h2>
          <p className="text-[#64748b] max-w-2xl mx-auto text-lg">
            Upload a photo or pick an example. Our AI identifies the plant and diagnoses any disease.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Upload / Preview */}
          <div className="lg:col-span-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {!imageDataUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={`bg-white rounded-3xl border-2 border-dashed p-12 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[380px] shadow-sm ${
                  dragOver ? "border-[#10b981] bg-emerald-50 scale-[1.01]" : "border-[#e2e8f0] hover:border-[#10b981]/60"
                }`}
              >
                <motion.div
                  animate={dragOver ? { y: [-4, 4, -4] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6"
                >
                  <CloudUpload className="text-[#10b981] w-10 h-10" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#1e293b] mb-2">
                  {dragOver ? "Drop image to scan" : "Upload photo for diagnosis"}
                </h3>
                <p className="text-[#94a3b8] text-center mb-6">
                  Drag & drop, or click to browse · JPG / PNG · up to 15MB
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl font-bold transition-colors"
                >
                  Select Image
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-[#f1f5f9] p-5 min-h-[380px] relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-[#64748b] truncate">
                    <ImageIcon className="w-4 h-4 text-[#10b981] shrink-0" />
                    <span className="truncate font-medium">{imageFileName || "Uploaded image"}</span>
                  </div>
                  <button
                    onClick={reset}
                    className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4 text-[#64748b]" />
                  </button>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-[#f1f5f9]">
                  <img src={imageDataUrl} alt="Uploaded plant" className="w-full max-h-[380px] object-contain" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                      <Loader2 className="w-12 h-12 text-[#10b981] animate-spin mb-4" />
                      <p className="text-white font-bold mb-1">{stage || "Analyzing..."}</p>
                      <p className="text-white/70 text-sm mb-4">AI is examining the leaf</p>
                      <div className="w-full max-w-xs h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#10b981]"
                          animate={{ width: `${progress}%` }}
                          transition={{ ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-white/60 text-xs mt-2">{Math.round(progress)}%</p>
                    </div>
                  )}
                </div>
                {error && !isAnalyzing && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-red-700">Analysis failed</p>
                      <p className="text-xs text-red-600 break-words">{error}</p>
                      <button
                        onClick={retry}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg"
                      >
                        <RotateCcw className="w-3 h-3" /> Try again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Examples + Tips */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#f1f5f9]">
              <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-4">Try Examples</p>
              <div className="grid grid-cols-2 gap-3">
                {EXAMPLE_PLANTS.map((plant) => (
                  <button
                    key={plant.name}
                    onClick={() => handleExample(plant.image, plant.name)}
                    disabled={isAnalyzing}
                    className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-emerald-50 hover:ring-2 hover:ring-[#10b981]/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img
                      src={plant.image}
                      className="w-full h-16 rounded-xl object-cover border border-[#f1f5f9]"
                      alt={plant.name}
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                    />
                    <span className="text-[10px] font-medium text-[#64748b] text-center">{plant.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#f1f5f9]">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-[#10b981]" />
                <h4 className="font-bold text-[#1e293b]">AI Diagnosis Tips</h4>
              </div>
              <ul className="space-y-3">
                {["Take clear close-up photos", "Make sure leaves are well-lit", "Multiple angles improve accuracy"].map((tip, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#64748b]">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <DiagnosisReport result={result} image={imageDataUrl} onDownload={downloadPDF} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const DiagnosisReport = ({ result, image, onDownload }: { result: Diagnosis; image: string | null; onDownload: () => void }) => {
  const healthColor = result.healthScore >= 70 ? "#10b981" : result.healthScore >= 40 ? "#f59e0b" : "#ef4444";
  const severityColor = ({ None: "bg-emerald-100 text-emerald-700", Mild: "bg-yellow-100 text-yellow-700", Moderate: "bg-orange-100 text-orange-700", Severe: "bg-red-100 text-red-700" } as any)[result.severity] || "bg-slate-100 text-slate-700";
  const riskColor = ({ Low: "bg-emerald-100 text-emerald-700", Medium: "bg-yellow-100 text-yellow-700", High: "bg-red-100 text-red-700" } as any)[result.spreadRisk] || "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-[#f1f5f9] p-8">
      <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-[#f1f5f9]">
        {image && <img src={image} alt={result.plantName} className="w-full md:w-48 h-48 object-cover rounded-2xl" />}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-[#10b981]" />
            <span className="text-xs font-bold text-[#10b981] bg-emerald-50 px-2 py-1 rounded">PLANT IDENTIFIED</span>
          </div>
          <h3 className="text-3xl font-extrabold text-[#1e293b]">{result.plantName}</h3>
          <p className="text-sm italic text-[#64748b] mb-4">{result.scientificName}</p>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {result.isHealthy ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                <ShieldCheck className="w-4 h-4" /> Healthy Plant
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold">
                <AlertTriangle className="w-4 h-4" /> {result.disease}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${severityColor}`}>Severity: {result.severity}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskColor}`}>Spread Risk: {result.spreadRisk}</span>
          </div>
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 bg-[#1e293b] hover:bg-black text-white font-bold px-5 py-2.5 rounded-xl text-sm transition"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CircularMetric label="Health Score" value={result.healthScore} color={healthColor} icon={<Activity className="w-5 h-5" />} />
        <CircularMetric label="AI Confidence" value={result.confidence} color="#6366f1" icon={<Sprout className="w-5 h-5" />} />
        <CircularMetric label="Affected Area" value={result.affectedArea} color={result.affectedArea > 50 ? "#ef4444" : result.affectedArea > 20 ? "#f59e0b" : "#10b981"} icon={<FlaskConical className="w-5 h-5" />} inverse />
      </div>

      <div className="bg-[#f8fafc] rounded-2xl p-6 mb-8">
        <h4 className="font-bold text-[#1e293b] mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#10b981]" /> Diagnostic Breakdown
        </h4>
        <div className="space-y-3">
          <Bar label="Plant Identification" value={result.confidence} color="#6366f1" />
          <Bar label="Health Status" value={result.healthScore} color={healthColor} />
          <Bar label="Disease Severity" value={severityToValue(result.severity)} color="#ef4444" />
          <Bar label="Tissue Damage" value={result.affectedArea} color="#f59e0b" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard title="Symptoms" icon={<AlertTriangle className="w-4 h-4" />} color="text-orange-600 bg-orange-50" items={result.symptoms} />
        <InfoCard title="Treatment" icon={<FlaskConical className="w-4 h-4" />} color="text-blue-600 bg-blue-50" items={result.treatment} />
        <InfoCard title="Prevention" icon={<ShieldCheck className="w-4 h-4" />} color="text-emerald-600 bg-emerald-50" items={result.prevention} />
      </div>
    </div>
  );
};

const severityToValue = (s: string) => ({ None: 0, Mild: 30, Moderate: 65, Severe: 95 } as any)[s] ?? 0;

const CircularMetric = ({ label, value, color, icon, inverse = false }: { label: string; value: number; color: string; icon: React.ReactNode; inverse?: boolean }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="bg-[#f8fafc] rounded-2xl p-6 flex items-center gap-4">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90">
          <circle cx="56" cy="56" r={radius} stroke="#e2e8f0" strokeWidth="10" fill="transparent" />
          <motion.circle
            cx="56" cy="56" r={radius} stroke={color} strokeWidth="10" fill="transparent" strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold" style={{ color }}>{Math.round(value)}%</span>
        </div>
      </div>
      <div>
        <div style={{ color }} className="mb-1">{icon}</div>
        <p className="text-sm font-bold text-[#1e293b]">{label}</p>
        <p className="text-xs text-[#64748b]">{inverse ? "Lower is better" : "Higher is better"}</p>
      </div>
    </div>
  );
};

const Bar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs font-medium mb-1.5">
      <span className="text-[#64748b]">{label}</span>
      <span style={{ color }} className="font-bold">{Math.round(value)}%</span>
    </div>
    <div className="h-2.5 bg-white rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: color }} />
    </div>
  </div>
);

const InfoCard = ({ title, icon, color, items }: { title: string; icon: React.ReactNode; color: string; items: string[] }) => (
  <div className="bg-white border border-[#f1f5f9] rounded-2xl p-5">
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold mb-3 ${color}`}>{icon} {title}</div>
    <ul className="space-y-2">
      {items.length === 0 ? <li className="text-xs text-[#94a3b8] italic">None reported</li> : items.map((item, i) => (
        <li key={i} className="text-sm text-[#475569] flex items-start gap-2"><span className="text-[#10b981] mt-1">•</span> {item}</li>
      ))}
    </ul>
  </div>
);

export default AIAnalyzer;
