import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Bot, Leaf, TrendingUp, Activity,
  Calendar, ImageIcon, ScanLine, CheckCircle2, AlertTriangle
} from "lucide-react";
import MobileBottomNav from "@/components/MobileBottomNav";
import { fetchNotifications, type AppNotification } from "@/lib/notifications";

interface RecentScan {
  id: string;
  title: string;
  date: string;
  status: string;
  isHealthy: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [scansDone, setScansDone] = useState<number>(0);
  const [healthyCount, setHealthyCount] = useState<number>(0);
  const [diseasedCount, setDiseasedCount] = useState<number>(0);
  const [recent, setRecent] = useState<RecentScan[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", session.user.id)
        .single();
      setFullName(profile?.full_name ?? session.user.email?.split("@")[0] ?? "Farmer");

      // Pull notifications (per-user scan history from DB)
      const notifs: AppNotification[] = await fetchNotifications();
      setScansDone(notifs.length);
      setHealthyCount(notifs.filter((n) => n.isHealthy).length);
      setDiseasedCount(notifs.filter((n) => !n.isHealthy).length);
      setRecent(
        notifs.slice(0, 5).map((n) => ({
          id: n.id,
          title: n.plantName,
          date: new Date(n.timestamp).toLocaleString(),
          status: n.isHealthy ? "Healthy" : (n.disease || "Diseased"),
          isHealthy: n.isHealthy,
        }))
      );

      setLoading(false);
    };
    load();
  }, [navigate]);

  const healthScore = scansDone > 0 ? Math.round((healthyCount / scansDone) * 100) : 0;
  const stats = [
    { icon: ScanLine, label: "Scans Done", value: String(scansDone), color: "text-primary" },
    { icon: Leaf, label: "Healthy Crops", value: String(healthyCount), color: "text-primary" },
    { icon: Activity, label: "Health Score", value: scansDone > 0 ? `${healthScore}%` : "—", color: "text-primary" },
    { icon: TrendingUp, label: "Issues Found", value: String(diseasedCount), color: "text-muted-foreground" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 pt-8 relative">
        <button
          onClick={() => navigate("/")}
          className="group mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </button>

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            Welcome, <span className="text-gradient-green">{fullName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-2">Your crop intelligence dashboard</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-5 glow-border"
            >
              <div className="rounded-xl glass p-2.5 w-fit mb-3 glow-green-subtle">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid sm:grid-cols-2 gap-4 mb-10"
        >
          <button
            onClick={() => navigate("/chatbot")}
            className="glass rounded-2xl p-6 glow-border hover:glow-green transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl glass p-2.5 glow-green-subtle group-hover:glow-green transition-all">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">AI Chatbot</h3>
            </div>
            <p className="text-sm text-muted-foreground">Ask questions about crops, diseases, and farming techniques</p>
          </button>

          <button
            onClick={() => {
              navigate("/");
              setTimeout(() => document.getElementById("ai-lab")?.scrollIntoView({ behavior: "smooth" }), 300);
            }}
            className="glass rounded-2xl p-6 glow-border hover:glow-green transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl glass p-2.5 glow-green-subtle group-hover:glow-green transition-all">
                <ScanLine className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Scan Crop</h3>
            </div>
            <p className="text-sm text-muted-foreground">Upload a photo to analyze diseases and growth stage</p>
          </button>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="glass rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg glass p-2 glow-green-subtle">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary glass rounded-full px-3 py-1">
                  {item.status}
                </span>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Full analysis history coming soon with AI integration 🚀
          </p>
        </motion.div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Dashboard;
