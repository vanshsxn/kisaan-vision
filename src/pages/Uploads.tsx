import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ImageIcon, Trash2, CheckCircle2, AlertTriangle, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";

interface HistoryEntry {
  id: string;
  timestamp: number;
  plantName: string;
  disease: string;
  isHealthy: boolean;
  thumbnail: string;
}

const HISTORY_KEY = "kv_diagnosis_history_v1";

const Uploads = () => {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, []);

  const removeItem = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    toast.success("Removed from history");
  };

  const clearAll = () => {
    setItems([]);
    localStorage.removeItem(HISTORY_KEY);
    toast.success("History cleared");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">My Uploads</h1>
              <p className="text-sm text-slate-500">{items.length} scan{items.length !== 1 ? "s" : ""} on this device</p>
            </div>
          </div>
          {items.length > 0 && (
            <button onClick={clearAll} className="text-xs font-bold text-red-500 hover:text-red-600 inline-flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-16 text-center">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-bold text-slate-700 mb-1">No scans yet</p>
            <p className="text-sm text-slate-500 mb-6">Run your first plant scan from the AI Lab.</p>
            <Link to="/#ai-lab" className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition shadow-md shadow-emerald-200">
              Go to AI Lab
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-md shadow-slate-200/40 overflow-hidden flex"
              >
                <img src={item.thumbnail} alt={item.plantName} className="w-28 h-28 object-cover shrink-0" />
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-slate-900 text-sm truncate">{item.plantName}</p>
                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mb-2">
                    {item.isHealthy ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Healthy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" /> {item.disease}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-auto">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Uploads;
