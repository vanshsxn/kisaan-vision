import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, AlertTriangle, Loader2, ArrowLeft, Server, Zap } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://hpdqrrhdoqvcdbmpxqqz.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || "hpdqrrhdoqvcdbmpxqqz";

type Status = "checking" | "ok" | "error";

const Diagnostics = () => {
  const [edgeStatus, setEdgeStatus] = useState<Status>("checking");
  const [edgeMessage, setEdgeMessage] = useState<string>("Pinging analyze-plant edge function...");
  const [latency, setLatency] = useState<number | null>(null);
  const [authStatus, setAuthStatus] = useState<Status>("checking");

  const runChecks = async () => {
    setEdgeStatus("checking");
    setEdgeMessage("Pinging analyze-plant edge function...");
    setLatency(null);
    const start = performance.now();
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-plant`, {
        method: "OPTIONS",
        headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY },
      });
      const ms = Math.round(performance.now() - start);
      setLatency(ms);
      if (res.ok || res.status === 204) {
        setEdgeStatus("ok");
        setEdgeMessage(`Edge function reachable (HTTP ${res.status}) in ${ms}ms`);
      } else {
        setEdgeStatus("error");
        setEdgeMessage(`Edge function responded HTTP ${res.status}`);
      }
    } catch (e: any) {
      setEdgeStatus("error");
      setEdgeMessage(`Could not reach edge function: ${e?.message || "network error"}`);
    }

    setAuthStatus("checking");
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
        headers: { apikey: SUPABASE_KEY },
      });
      setAuthStatus(res.ok ? "ok" : "error");
    } catch {
      setAuthStatus("error");
    }
  };

  useEffect(() => { runChecks(); }, []);

  const StatusBadge = ({ status }: { status: Status }) => {
    if (status === "checking") return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold"><Loader2 className="w-3 h-3 animate-spin" /> Checking...</span>;
    if (status === "ok") return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Healthy</span>;
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold"><AlertTriangle className="w-3 h-3" /> Error</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">System Diagnostics</h1>
              <p className="text-sm text-slate-500">Verify backend connectivity before scanning</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-800">Active Backend</h2>
          </div>
          <div className="space-y-3 text-sm">
            <Row label="Project ID" value={PROJECT_ID} />
            <Row label="Project URL" value={SUPABASE_URL} mono />
            <Row label="Anon Key" value={SUPABASE_KEY ? `${SUPABASE_KEY.slice(0, 24)}…${SUPABASE_KEY.slice(-8)}` : "(missing)"} mono />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-500" />
              <h2 className="font-bold text-slate-800">Edge Function: analyze-plant</h2>
            </div>
            <StatusBadge status={edgeStatus} />
          </div>
          <p className="text-sm text-slate-600 mb-2">{edgeMessage}</p>
          {latency !== null && (
            <p className="text-xs text-slate-500">Round-trip latency: <span className="font-bold text-slate-700">{latency}ms</span></p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-800">Authentication Service</h2>
            <StatusBadge status={authStatus} />
          </div>
          <p className="text-xs text-slate-500">Supabase Auth `/health` endpoint</p>
        </motion.div>

        <button
          onClick={runChecks}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl text-sm transition shadow-lg shadow-emerald-200"
        >
          Re-run Diagnostics
        </button>

        {edgeStatus === "error" && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm">
            <p className="font-bold text-amber-900 mb-2">⚠ Edge function unreachable</p>
            <p className="text-amber-800 mb-2">If you are on Render, check that these env vars match this Lovable Cloud project:</p>
            <pre className="text-xs bg-white border border-amber-200 rounded-lg p-3 overflow-x-auto">
{`VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_PROJECT_ID=${PROJECT_ID}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
    <span className="text-slate-500 font-medium shrink-0">{label}</span>
    <span className={`text-slate-800 font-bold text-right break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
  </div>
);

export default Diagnostics;
