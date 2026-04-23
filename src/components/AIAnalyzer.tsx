import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudUpload, Loader2, RotateCcw, Info, CheckCircle2, AlertTriangle,
  Sprout, ShieldCheck, Activity, Leaf, FlaskConical, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EXAMPLE_PLANTS = [
  { name: "Rice plant", image: "https://tse3.mm.bing.net/th/id/OIP.2ix1On2l3y-H0EKzLEpqQAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { name: "Tomato blight", image: "https://tse3.mm.bing.net/th/id/OIP.o5XZLyg8yfuEPcr1jLCWTwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { name: "Mosaic virus", image: "https://www.planetnatural.com/wp-content/uploads/2021/11/Cucumber-Mosaic-Virus.jpg" },
  { name: "Cotton plant", image: "https://cdn.pixabay.com/photo/2019/11/26/12/54/cotton-4654533_1280.jpg" },
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

// Resize image to keep payload small
const resizeImage = (file: File, maxSize = 1024, quality = 0.85): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
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
        if (!ctx) return reject(new Error("Canvas error"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const urlToFile = async (url: string, name: string) => {
  const r = await fetch(url);
  const b = await r.blob();
  return new File([b], name, { type: b.type });
};

const AIAnalyzer = () => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyze = useCallback(async (file: File) => {
    try {
      setIsAnalyzing(true);
      setResult(null);
      const dataUrl = await resizeImage(file);
      setImageDataUrl(dataUrl);
      const base64 = dataUrl.split(",")[1];

      const { data, error } = await supabase.functions.invoke("analyze-plant", {
        body: { imageBase64: base64 },
      });

      if (error) {
        console.error("invoke error", error);
        toast.error(error.message || "Failed to analyze image. Please try again.");
        setIsAnalyzing(false);
        return;
      }
      if ((data as any)?.error) {
        toast.error((data as any).error);
        setIsAnalyzing(false);
        return;
      }

      setResult(data as Diagnosis);
      toast.success("Diagnosis complete!");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    analyze(file);
  };

  const handleExample = async (url: string, name: string) => {
    try {
      toast.info(`Loading ${name}...`);
      const file = await urlToFile(url, `${name}.jpg`);
      analyze(file);
    } catch {
      toast.error("Could not load example image");
    }
  };

  const reset = () => {
    setImageDataUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section id="ai-lab" className="py-20 bg-[#f8fafc]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#334155] mb-4">
            Identify Plants and <span className="text-[#10b981]">Diagnose Diseases</span>
          </h2>
          <p className="text-[#64748b] max-w-2xl mx-auto text-lg">
            Upload photos of your plants or crops, and our AI will identify them and diagnose any problems.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Upload + Preview */}
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
                className={`bg-white rounded-3xl border-2 border-dashed p-12 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[360px] shadow-sm ${
                  dragOver ? "border-[#10b981] bg-emerald-50" : "border-[#e2e8f0] hover:border-[#10b981]/50"
                }`}
              >
                <div className="w-16 h-16 bg-[#f1f5f9] rounded-2xl flex items-center justify-center mb-6">
                  <CloudUpload className="text-[#94a3b8] w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1e293b] mb-2">Upload photos for diagnosis</h3>
                <p className="text-[#94a3b8] text-center mb-8">Drag and drop, or click to select an image</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl font-bold transition-colors"
                >
                  Upload Photo
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-[#f1f5f9] p-6 min-h-[360px] relative">
                <button
                  onClick={reset}
                  className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow border border-[#f1f5f9] hover:bg-red-50 transition"
                >
                  <X className="w-4 h-4 text-[#64748b]" />
                </button>
                <div className="relative rounded-2xl overflow-hidden bg-[#f1f5f9]">
                  <img src={imageDataUrl} alt="Uploaded plant" className="w-full max-h-[400px] object-contain" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-4 border-white/30 border-t-[#10b981] mb-4"
                      />
                      <p className="text-white font-bold">AI scanning leaf...</p>
                      <p className="text-white/70 text-sm mt-1">Identifying species & diseases</p>
                    </div>
                  )}
                </div>
                {!isAnalyzing && !result && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    Upload another
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Examples & Tips */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#f1f5f9]">
              <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-4">Try Examples</p>
              <div className="grid grid-cols-2 gap-3">
                {EXAMPLE_PLANTS.map((plant) => (
                  <button
                    key={plant.name}
                    onClick={() => handleExample(plant.image, plant.name)}
                    disabled={isAnalyzing}
                    className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-[#f1f5f9] transition disabled:opacity-50"
                  >
                    <img src={plant.image} className="w-full h-16 rounded-xl object-cover border border-[#f1f5f9]" alt={plant.name} />
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
                {["Take clear close-up photos", "Make sure leaves/fruits are visible", "Good lighting helps accuracy"].map((tip, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#64748b]">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <DiagnosisReport result={result} image={imageDataUrl} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const DiagnosisReport = ({ result, image }: { result: Diagnosis; image: string | null }) => {
  const healthColor = result.healthScore >= 70 ? "#10b981" : result.healthScore >= 40 ? "#f59e0b" : "#ef4444";
  const severityColor = {
    None: "bg-emerald-100 text-emerald-700",
    Mild: "bg-yellow-100 text-yellow-700",
    Moderate: "bg-orange-100 text-orange-700",
    Severe: "bg-red-100 text-red-700",
  }[result.severity] || "bg-slate-100 text-slate-700";

  const riskColor = {
    Low: "bg-emerald-100 text-emerald-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  }[result.spreadRisk] || "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-[#f1f5f9] p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-[#f1f5f9]">
        {image && (
          <img src={image} alt={result.plantName} className="w-full md:w-48 h-48 object-cover rounded-2xl" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-[#10b981]" />
            <span className="text-xs font-bold text-[#10b981] bg-emerald-50 px-2 py-1 rounded">
              PLANT IDENTIFIED
            </span>
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
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${severityColor}`}>
              Severity: {result.severity}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskColor}`}>
              Spread Risk: {result.spreadRisk}
            </span>
          </div>
          {!result.isHealthy && result.diseaseScientific !== "N/A" && (
            <p className="text-xs italic text-[#94a3b8]">Pathogen: {result.diseaseScientific}</p>
          )}
        </div>
      </div>

      {/* Graphical metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CircularMetric label="Health Score" value={result.healthScore} color={healthColor} icon={<Activity className="w-5 h-5" />} />
        <CircularMetric label="AI Confidence" value={result.confidence} color="#6366f1" icon={<Sprout className="w-5 h-5" />} />
        <CircularMetric
          label="Affected Area"
          value={result.affectedArea}
          color={result.affectedArea > 50 ? "#ef4444" : result.affectedArea > 20 ? "#f59e0b" : "#10b981"}
          icon={<FlaskConical className="w-5 h-5" />}
          inverse
        />
      </div>

      {/* Bar chart of factors */}
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

      {/* Symptoms / Treatment / Prevention */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Symptoms"
          icon={<AlertTriangle className="w-4 h-4" />}
          color="text-orange-600 bg-orange-50"
          items={result.symptoms}
        />
        <InfoCard
          title="Treatment"
          icon={<FlaskConical className="w-4 h-4" />}
          color="text-blue-600 bg-blue-50"
          items={result.treatment}
        />
        <InfoCard
          title="Prevention"
          icon={<ShieldCheck className="w-4 h-4" />}
          color="text-emerald-600 bg-emerald-50"
          items={result.prevention}
        />
      </div>
    </div>
  );
};

const severityToValue = (s: string) => ({ None: 0, Mild: 30, Moderate: 65, Severe: 95 }[s] ?? 0);

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
            cx="56" cy="56" r={radius}
            stroke={color} strokeWidth="10" fill="transparent"
            strokeLinecap="round"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
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
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

const InfoCard = ({ title, icon, color, items }: { title: string; icon: React.ReactNode; color: string; items: string[] }) => (
  <div className="bg-white border border-[#f1f5f9] rounded-2xl p-5">
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold mb-3 ${color}`}>
      {icon} {title}
    </div>
    <ul className="space-y-2">
      {items.length === 0 ? (
        <li className="text-xs text-[#94a3b8] italic">None reported</li>
      ) : items.map((item, i) => (
        <li key={i} className="text-sm text-[#475569] flex items-start gap-2">
          <span className="text-[#10b981] mt-1">•</span> {item}
        </li>
      ))}
    </ul>
  </div>
);

export default AIAnalyzer;
