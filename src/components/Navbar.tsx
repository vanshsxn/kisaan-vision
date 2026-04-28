import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, LayoutDashboard, LogOut, Search, Bell, ShoppingCart, Sparkles, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import {
  fetchNotifications, markNotificationRead, clearAllNotifications,
  type AppNotification,
} from "@/lib/notifications";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const loadNotifs = async () => {
    const list = await fetchNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadNotifs();
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    loadNotifs();
    const onUpdate = () => loadNotifs();
    window.addEventListener("kv-notifications-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("kv-notifications-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollTo = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const next = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  };

  const clearNotifs = () => {
    setNotifications([]);
    localStorage.removeItem(NOTIF_KEY);
  };

  const openNotifs = () => {
    setNotifOpen((v) => !v);
    if (!notifOpen && unreadCount > 0) setTimeout(markAllRead, 600);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 hidden md:block"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="text-xl font-black tracking-tight text-slate-800 flex items-center">
            Kissan <span className="text-[#4ade80] ml-1">Vision</span>
          </div>
        </Link>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4ade80] transition-colors" />
            <input
              type="text"
              placeholder="Search plant or disease..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4ade80]/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-slate-500">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={openNotifs} className="relative p-1 hover:text-[#4ade80] transition-colors" aria-label="Notifications">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full border-2 border-white flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-sm font-extrabold text-slate-700">Notifications</p>
                      {notifications.length > 0 && (
                        <button onClick={clearNotifs} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-wider">Clear</button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500 font-medium">No notifications yet</p>
                          <p className="text-xs text-slate-400">Scan a plant to see results here</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => { setNotifOpen(false); navigate("/uploads"); }}
                            className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition flex items-start gap-3"
                          >
                            <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${n.isHealthy ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                              {n.isHealthy ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{n.plantName}</p>
                              <p className="text-xs text-slate-500 truncate">{n.isHealthy ? "Healthy plant" : n.disease}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{new Date(n.timestamp).toLocaleString()}</p>
                            </div>
                            {!n.read && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-2" />}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart -> Plans */}
            <button
              onClick={() => navigate("/plans")}
              className="p-1 hover:text-[#4ade80] transition-colors"
              aria-label="Book a consultant"
              title="Book a consultant"
            >
              <ShoppingCart size={20} />
            </button>

            <button
              onClick={() => navigate("/uploads")}
              className="text-sm font-bold hover:text-slate-800 transition-colors hidden lg:block"
            >
              My Uploads
            </button>
            <button
              onClick={() => navigate("/help")}
              className="text-sm font-bold hover:text-slate-800 transition-colors hidden lg:block"
            >
              Help
            </button>
          </div>

          <button
            onClick={() => scrollTo("ai-lab")}
            className="hidden md:inline-flex items-center gap-1.5 bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-md shadow-emerald-200"
          >
            <Sparkles className="w-4 h-4" /> Scan Now
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-0.5 rounded-full hover:bg-slate-50 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                  <img src={user.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Vansh"} alt="Profile" />
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <button onClick={() => { setDropdownOpen(false); navigate("/dashboard"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-[#4ade80]/10 hover:text-[#4ade80] rounded-xl transition-all">
                        <LayoutDashboard size={18} /> Dashboard
                      </button>
                      <button onClick={() => { setDropdownOpen(false); navigate("/diagnostics"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-[#4ade80]/10 hover:text-[#4ade80] rounded-xl transition-all">
                        <Activity size={18} /> Diagnostics
                      </button>
                      <button onClick={() => { setDropdownOpen(false); supabase.auth.signOut(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <LogOut size={18} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;