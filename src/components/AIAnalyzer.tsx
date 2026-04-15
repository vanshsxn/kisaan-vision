import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, ShieldCheck, ShieldAlert,
  Loader2, RotateCcw, ScanLine,
  AlertTriangle, Sprout, Bug, Info, CheckCircle2, CloudUpload, Search, Bell, ShoppingCart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Mock data for the "Recent Diagnoses" section from Image 4
const RECENT_DIAGNOSES = [
  {
    id: 1,
    plantName: "Tomato Plant",
    variety: "Tomato Plant identified",
    disease: "Tomato Bhove",
    type: "Fungal Disease",
    image: "https://images.unsplash.com/photo-1592450865966-70130976a5a8?q=80&w=400",
    tips: ["Remove infected leaves and fruits", "Use fungicidal spray", "Improve air circulation around plants"]
  },
  {
    id: 2,
    plantName: "Chili Plant",
    variety: "Chili-Plant Light variety identified",
    disease: "Mosaic Virus",
    type: "Viral Disease",
    image: "https://images.unsplash.com/photo-1588612198056-4258f12128a3?q=80&w=400",
    tips: ["Manage insect pests like aphids", "Remove and destroy infected plants", "Plant resistant varieties"]
  }
];

const EXAMPLE_PLANTS = [
  { name: "Rice plant", image: "https://images.unsplash.com/photo-1536633107052-475990264103?w=100&h=100&fit=crop", query: "healthy rice plant leaf" },
  { name: "Tomato blight", image: "https://images.unsplash.com/photo-1592450865966-70130976a5a8?w=100&h=100&fit=crop", query: "tomato leaf with early blight" },
  { name: "Mosaic virus", image: "https://images.unsplash.com/photo-1588612198056-4258f12128a3?w=100&h=100&fit=crop", query: "leaf with mosaic virus pattern" },
  { name: "Cotton plant", image: "https://images.unsplash.com/photo-1615555465910-61405e35d2da?w=100&h=100&fit=crop", query: "healthy cotton plant" },
];

const AIAnalyzer = () => {
  const navigate = useNavigate();
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImageDataUrl(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="ai-lab" className="py-20 bg-[#f8fafc]">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#334155] mb-4">
            Identify Plants and <span className="text-[#4ade80]">Diagnose Diseases</span>
          </h2>
          <p className="text-[#64748b] max-w-2xl mx-auto text-lg">
            Upload photos of your plants or crops, and our AI will identify them and diagnose any problems.
          </p>
        </div>

        {/* Diagnostic Dashboard */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          {/* Left: Upload Box */}
          <div className="lg:col-span-2">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white rounded-3xl border-2 border-dashed border-[#e2e8f0] p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#4ade80]/50 transition-all min-h-[320px] shadow-sm relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-[#f1f5f9] rounded-2xl flex items-center justify-center mb-6">
                <CloudUpload className="text-[#94a3b8] w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1e293b] mb-2">Upload photos for diagnosis</h3>
              <p className="text-[#94a3b8] text-center mb-8">Drag and drop, or select images to identify and diagnose plants</p>
              <button className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl font-bold transition-colors">
                Upload Photos
              </button>
            </div>
          </div>

          {/* Right: Examples & Tips */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#f1f5f9]">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {EXAMPLE_PLANTS.map((plant) => (
                  <div key={plant.name} className="flex flex-col items-center gap-2">
                    <img src={plant.image} className="w-16 h-16 rounded-xl object-cover border border-[#f1f5f9]" alt={plant.name} />
                    <span className="text-[10px] font-medium text-[#64748b] text-center">{plant.name}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-2 bg-[#f1f5f9] text-[#64748b] rounded-xl text-xs font-bold tracking-widest hover:bg-[#e2e8f0] transition-colors uppercase">
                Try Examples
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#f1f5f9]">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-[#10b981]" />
                <h4 className="font-bold text-[#1e293b]">AI Diagnosis Tips:</h4>
              </div>
              <ul className="space-y-3">
                {["Take clear close-up photos", "Make sure leaves/fruits are visible", "Multiple angles help AI accuracy"].map((tip, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#64748b]">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Diagnoses Feed */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-bold text-[#334155] mb-8">Recent Diagnoses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {RECENT_DIAGNOSES.map((diag) => (
              <div key={diag.id} className="bg-white rounded-[2rem] p-5 shadow-md border border-[#f1f5f9] flex flex-col gap-4">
                <div className="flex gap-4">
                  <img src={diag.image} className="w-24 h-24 rounded-2xl object-cover" alt={diag.plantName} />
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-[#10b981] bg-[#f0fdf4] px-2 py-1 rounded">{diag.variety}</span>
                    <h4 className="text-lg font-black text-[#1e293b] mt-1">{diag.disease}</h4>
                    <p className="text-[10px] text-[#64748b] italic">Identified {diag.type.toLowerCase()} detected</p>
                    <div className="flex items-center gap-1 mt-2">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${diag.type.includes('Fungal') ? 'text-red-500 bg-red-50' : 'text-orange-500 bg-orange-50'}`}>
                        {diag.type}
                       </span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-1 border-t border-[#f1f5f9] pt-4">
                  {diag.tips.map((tip, idx) => (
                    <li key={idx} className="text-[11px] text-[#64748b] flex items-start gap-2">
                      <span className="text-[#10b981] mt-1">•</span> {tip}
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2 text-[#94a3b8]">
                    <Search size={14} className="cursor-pointer" />
                    <RotateCcw size={14} className="cursor-pointer" />
                  </div>
                  <button className="bg-[#6366f1] text-white text-[10px] font-bold px-4 py-2 rounded-lg">See Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAnalyzer;