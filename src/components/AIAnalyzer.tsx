import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload, Loader2, Info, CheckCircle2, AlertTriangle,
  Sprout, ShieldCheck, Activity, Leaf, FlaskConical, X, Download, RotateCcw, ImageIcon,
  History, Trash2, Eye, FileText, Files
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

import sampleRice from "@/assets/samples/rice-leaf.jpg";
import sampleTomato from "@/assets/samples/tomato-blight.jpg";
import sampleApple from "@/assets/samples/apple-scab.jpg";
import sampleCotton from "@/assets/samples/cotton-leaf.jpg";

const EXAMPLE_PLANTS = [
  { name: "Rice plant", image: sampleRice },
  { name: "Tomato blight", image: sampleTomato },
  { name: "Apple scab", image: sampleApple },
  { name: "Cotton plant", image: sampleCotton },
];

interface VisualCue {
  cue: string;
  description: string;
  location: string;
  confidence: number;
  supports: "plant" | "disease" | "both";
}

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
  visualCues?: VisualCue[];
}

interface HistoryEntry {
  id: string;
  timestamp: number;
  plantName: string;
  disease: string;
  isHealthy: boolean;
  thumbnail: string;
  diagnosis: Diagnosis;
  imageDataUrl: string;
}

const HISTORY_KEY = "kv_diagnosis_history_v1";
const HISTORY_LIMIT = 10;

const loadHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveHistoryEntry = (entry: HistoryEntry) => {
  try {
    const list = [entry, ...loadHistory()].slice(0, HISTORY_LIMIT);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (e) { console.warn("history save failed", e); }
};

// ---- Utilities ----
const resizeImage = (src: File | string, maxSize = 1024, quality = 0.85): Promise<string> =>
  new Promise((resolve, reject) => {
    const processImageSrc = (imageSrc: string) => {
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
      img.src = imageSrc;
    };

    if (typeof src === "string") {
      processImageSrc(src);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => processImageSrc(e.target?.result as string);
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(src);
    }
  });

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

// ---- PDF Generation ----
type PdfLayout = "single" | "multi";

const generatePDF = (result: Diagnosis, imageDataUrl: string | null, layout: PdfLayout) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 36;
  let y = margin;

  const ensureSpace = (need: number) => {
    if (layout === "multi" && y + need > pageH - 50) {
      doc.addPage();
      y = margin;
    }
  };

  // Header
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(layout === "single" ? 16 : 20);
  doc.setFont("helvetica", "bold");
  doc.text("Kisaan Vision — Plant Diagnosis Report", margin, 40);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}  •  Layout: ${layout === "single" ? "Compact (1-page)" : "Detailed (multi-page)"}`, margin, 58);
  y = 90;

  // Image + identity
  const imgSize = layout === "single" ? 100 : 140;
  if (imageDataUrl) {
    try { doc.addImage(imageDataUrl, "JPEG", margin, y, imgSize, imgSize); } catch (e) { console.warn(e); }
  }
  const tx = margin + imgSize + 15;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(layout === "single" ? 14 : 18);
  doc.setFont("helvetica", "bold");
  doc.text(result.plantName, tx, y + 18);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(result.scientificName || "—", tx, y + 32);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(layout === "single" ? 11 : 13);
  const [r, g, b] = result.isHealthy ? [16, 185, 129] : [220, 38, 38];
  doc.setTextColor(r, g, b);
  doc.text(result.isHealthy ? "Healthy Plant" : `Disease: ${result.disease}`, tx, y + 52);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const meta = [
    `Severity: ${result.severity}`,
    `Confidence: ${Math.round(result.confidence)}%`,
    `Health: ${Math.round(result.healthScore)}%`,
    `Affected Area: ${Math.round(result.affectedArea)}%`,
    `Spread Risk: ${result.spreadRisk}`,
  ];
  meta.forEach((m, i) => doc.text(m, tx, y + 68 + i * 12));
  y += imgSize + 20;

  // Visual Cues — confidence breakdown that drove the diagnosis
  if (layout === "multi") ensureSpace(80);
  doc.setFillColor(236, 253, 245);
  doc.rect(margin, y, pageW - margin * 2, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(6, 95, 70);
  doc.text("Visual Cues — Why the AI made this diagnosis", margin + 8, y + 15);
  y += 28;

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text("Each cue below is a feature the AI detected in your image, with its confidence in that observation.", margin, y);
  y += 14;

  const cues = result.visualCues || [];
  if (cues.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 113, 108);
    doc.text("No detailed cues returned by the model for this image.", margin, y);
    y += 14;
  } else {
    cues.forEach((c) => {
      const blockH = layout === "single" ? 32 : 40;
      ensureSpace(blockH);
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageW - margin * 2, blockH, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const cueText = doc.splitTextToSize(c.cue, pageW - margin * 2 - 110);
      doc.text(cueText, margin + 8, y + 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const desc = doc.splitTextToSize(`${c.description}  (${c.location} · supports: ${c.supports})`, pageW - margin * 2 - 110);
      doc.text(desc.slice(0, 2), margin + 8, y + 24);

      // Confidence bar on right
      const barX = pageW - margin - 95;
      const barY = y + 12;
      doc.setFillColor(226, 232, 240);
      doc.rect(barX, barY, 80, 8, "F");
      doc.setFillColor(16, 185, 129);
      doc.rect(barX, barY, Math.max(2, (c.confidence / 100) * 80), 8, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.text(`${Math.round(c.confidence)}%`, barX + 30, barY + 22);

      y += blockH + 4;
    });
  }
  y += 8;

  // Sections
  const section = (title: string, items: string[]) => {
    const need = 30 + Math.max(items.length, 1) * 14;
    if (layout === "multi") ensureSpace(need);
    if (layout === "single" && y + need > pageH - 40) return; // skip overflow in single page mode

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageW - margin * 2, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(title, margin + 8, y + 14);
    y += 26;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(layout === "single" ? 8 : 9);
    doc.setTextColor(71, 85, 105);
    const list = items.length ? items : ["None reported"];
    list.forEach((item) => {
      const lines = doc.splitTextToSize(`• ${item}`, pageW - margin * 2 - 10);
      if (layout === "multi") ensureSpace(lines.length * 12);
      if (layout === "single" && y + lines.length * 12 > pageH - 40) return;
      doc.text(lines, margin + 8, y);
      y += lines.length * (layout === "single" ? 10 : 12) + 2;
    });
    y += 6;
  };

  section("Symptoms Observed", result.symptoms);
  section("Recommended Treatment", result.treatment);
  section("Prevention Measures", result.prevention);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Kisaan Vision AI Report  •  Page ${i} of ${pageCount}  •  Not a substitute for professional advice`,
      pageW / 2, pageH - 20, { align: "center" }
    );
  }

  const safeName = result.plantName.replace(/[^a-z0-9]/gi, "_");
  doc.save(`KisaanVision_${safeName}_${layout}_${Date.now()}.pdf`);
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
  const [pdfLayout, setPdfLayout] = useState<PdfLayout>("multi");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastBase64Ref = useRef<string | null>(null);

  useEffect(() => { setHistory(loadHistory()); }, []);

  useEffect(() => {
    if (!isAnalyzing) { setProgress(0); return; }
    setProgress(5);
    const id = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(1, (90 - p) * 0.06) : p));
    }, 250);
    return () => clearInterval(id);
  }, [isAnalyzing]);

  const runAnalysis = useCallback(async (base64: string, dataUrl: string, fileName: string, attempt = 0) => {
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

      // Save to history
      const entry: HistoryEntry = {
        id: `${Date.now()}`,
        timestamp: Date.now(),
        plantName: data.plantName,
        disease: data.disease,
        isHealthy: data.isHealthy,
        thumbnail: dataUrl,
        diagnosis: data,
        imageDataUrl: dataUrl,
      };
      saveHistoryEntry(entry);
      setHistory(loadHistory());
    } catch (e: any) {
      const msg = e?.message || "Unknown error";
      console.error("[AIAnalyzer] analysis failed:", msg);
      if (attempt === 0 && /network|fetch|timeout|502|503|504/i.test(msg)) {
        toast.info("Retrying analysis...");
        await new Promise((r) => setTimeout(r, 800));
        return runAnalysis(base64, dataUrl, fileName, 1);
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
      await runAnalysis(base64, dataUrl, file.name, 0);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to process image");
      toast.error(e?.message || "Failed to process image");
      setIsAnalyzing(false);
    }
  }, [runAnalysis]);

  // Local sample handler — uses bundled assets (no external fetch dependency)
  const handleExample = useCallback(async (assetUrl: string, name: string) => {
    try {
      toast.info(`Loading ${name}...`);
      setStage("Loading sample...");
      setIsAnalyzing(true);
      setError(null);
      setResult(null);
      const dataUrl = await resizeImage(assetUrl);
      setImageDataUrl(dataUrl);
      setImageFileName(`${name}.jpg`);
      const base64 = dataUrl.split(",")[1];
      lastBase64Ref.current = base64;
      await runAnalysis(base64, dataUrl, `${name}.jpg`, 0);
    } catch (e: any) {
      console.error(e);
      toast.error(`Could not load sample: ${e?.message || ""}`);
      setIsAnalyzing(false);
    }
  }, [runAnalysis]);

  const retry = () => {
    if (lastBase64Ref.current && imageDataUrl) {
      runAnalysis(lastBase64Ref.current, imageDataUrl, imageFileName, retryAttempt + 1);
    }
  };

  const reset = () => {
    setImageDataUrl(null);
    setImageFileName("");
    setResult(null);
    setError(null);
    lastBase64Ref.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadCurrent = (layout?: PdfLayout) => {
    if (!result) return;
    try {
      generatePDF(result, imageDataUrl, layout || pdfLayout);
      toast.success(`PDF downloaded (${(layout || pdfLayout) === "single" ? "compact" : "detailed"})`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    }
  };

  const downloadHistoryEntry = (entry: HistoryEntry, layout: PdfLayout) => {
    try {
      generatePDF(entry.diagnosis, entry.imageDataUrl, layout);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error("Failed to generate PDF");
    }
  };

  const deleteHistoryEntry = (id: string) => {
    const next = history.filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    setHistory(next);
    toast.success("Removed from history");
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
    toast.success("History cleared");
  };

  const viewHistoryEntry = (entry: HistoryEntry) => {
    setResult(entry.diagnosis);
    setImageDataUrl(entry.imageDataUrl);
    setImageFileName(`${entry.plantName}.jpg`);
    setShowHistory(false);
    setTimeout(() => document.getElementById("ai-lab")?.scrollIntoView({ behavior: "smooth" }), 100);
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
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(true)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#10b981] hover:text-[#059669] transition"
            >
              <History className="w-4 h-4" /> View history ({history.length})
            </button>
          )}
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
              <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-4">Try Examples (Bundled)</p>
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
                      loading="lazy"
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
              <DiagnosisReport
                result={result}
                image={imageDataUrl}
                pdfLayout={pdfLayout}
                setPdfLayout={setPdfLayout}
                onDownload={downloadCurrent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <History className="w-5 h-5 text-[#10b981]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1e293b]">Diagnosis History</h3>
                    <p className="text-xs text-[#64748b]">Last {HISTORY_LIMIT} scans on this device</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistory(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-[#64748b]" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-[#94a3b8]">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No diagnoses yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition">
                        <img src={entry.thumbnail} alt={entry.plantName} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#1e293b] text-sm truncate">{entry.plantName}</p>
                          <p className={`text-xs font-medium truncate ${entry.isHealthy ? "text-emerald-600" : "text-red-600"}`}>
                            {entry.isHealthy ? "Healthy" : entry.disease}
                          </p>
                          <p className="text-[10px] text-[#94a3b8]">{new Date(entry.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => viewHistoryEntry(entry)}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-emerald-50 flex items-center justify-center transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-[#10b981]" />
                          </button>
                          <button
                            onClick={() => downloadHistoryEntry(entry, "single")}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-blue-50 flex items-center justify-center transition"
                            title="Download 1-page PDF"
                          >
                            <FileText className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => downloadHistoryEntry(entry, "multi")}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-blue-50 flex items-center justify-center transition"
                            title="Download multi-page PDF"
                          >
                            <Files className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => deleteHistoryEntry(entry.id)}
                            className="w-8 h-8 rounded-lg bg-white hover:bg-red-50 flex items-center justify-center transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const DiagnosisReport = ({
  result, image, pdfLayout, setPdfLayout, onDownload
}: {
  result: Diagnosis; image: string | null;
  pdfLayout: PdfLayout; setPdfLayout: (l: PdfLayout) => void;
  onDownload: (layout?: PdfLayout) => void;
}) => {
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

          {/* PDF layout chooser */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider mr-1">PDF Layout:</span>
            <button
              onClick={() => setPdfLayout("single")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                pdfLayout === "single" ? "bg-[#10b981] text-white" : "bg-slate-100 text-[#64748b] hover:bg-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> 1-page (Compact)
            </button>
            <button
              onClick={() => setPdfLayout("multi")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                pdfLayout === "multi" ? "bg-[#10b981] text-white" : "bg-slate-100 text-[#64748b] hover:bg-slate-200"
              }`}
            >
              <Files className="w-3.5 h-3.5" /> Multi-page (Detailed)
            </button>
          </div>

          <button
            onClick={() => onDownload()}
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

      {/* Visual Cues — what the AI saw */}
      {result.visualCues && result.visualCues.length > 0 && (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 mb-8">
          <h4 className="font-bold text-[#1e293b] mb-1 flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#10b981]" /> Visual Cues — Why the AI made this call
          </h4>
          <p className="text-xs text-[#64748b] mb-4">Each cue is a feature the AI spotted in your image. The bar shows how confident it is in that observation.</p>
          <div className="space-y-3">
            {result.visualCues.map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-emerald-100/60">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1e293b]">{c.cue}</p>
                    <p className="text-xs text-[#64748b] mt-0.5">{c.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-[#64748b]">
                        {c.location}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        c.supports === "plant" ? "bg-blue-100 text-blue-700" :
                        c.supports === "disease" ? "bg-red-100 text-red-700" :
                        "bg-purple-100 text-purple-700"
                      }`}>
                        Supports: {c.supports}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-extrabold text-[#10b981]">{Math.round(c.confidence)}%</div>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${c.confidence}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#059669]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
