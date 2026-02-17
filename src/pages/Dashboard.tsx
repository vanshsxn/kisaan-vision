import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Bot, Leaf, TrendingUp, Activity,
  Calendar, ImageIcon, MessageSquare, ScanLine
} from "lucide-react";
import MobileBottomNav from "@/components/MobileBottomNav";

const stats = [
  { icon: ScanLine, label: "Scans Done", value: "—", color: "text-primary" },
  { icon: Leaf, label: "Crops Analyzed", value: "—", color: "text-primary" },
  { icon: Activity, label: "Health Score", value: "—", color: "text-primary" },
  { icon: TrendingUp, label: "Insights", value: "Coming Soon", color: "text-muted-foreground" },
];

const recentItems = [
  { title: "Tomato Leaf Scan", date: "Demo", status: "Healthy", icon: Leaf },
  { title: "Rice Paddy Analysis", date: "Demo", status: "Mild Blight", icon: ImageIcon },
  { title: "Wheat Field Report", date: "Demo", status: "Nutrient Deficiency", icon: ScanLine },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", session.user.id)
        .single();

      setFullName(data?.full_name ?? session.user.email?.split("@")[0] ?? "Farmer");
      setLoading(false);
    };
    load();
  }, [navigate]);

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
