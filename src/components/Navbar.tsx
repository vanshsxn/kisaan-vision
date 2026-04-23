import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, ChevronDown, LayoutDashboard, LogOut, Search, Bell, ShoppingCart, HelpCircle, Sparkles } from "lucide-react";

const navItems = [
  { label: "Solutions", id: "solutions" },
  { label: "Technology", id: "technology" },
  { label: "AI Lab", id: "ai-lab" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
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

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 hidden md:block"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Brand Name */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="text-xl font-black tracking-tight text-slate-800 flex items-center">
            Kissan <span className="text-[#4ade80] ml-1">Vision</span>
          </div>
        </Link>

        {/* Centered Search Bar (From Image 4) */}
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

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-slate-500">
            <button className="relative p-1 hover:text-[#4ade80] transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-1 hover:text-[#4ade80] transition-colors">
              <ShoppingCart size={20} />
            </button>
            <button
              onClick={() => navigate("/uploads")}
              className="text-sm font-bold hover:text-slate-800 transition-colors hidden lg:block"
            >
              My Uploads
            </button>
            <button className="text-sm font-bold hover:text-slate-800 transition-colors hidden lg:block">
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