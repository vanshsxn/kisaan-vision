import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User } from "lucide-react";

const navItems = [
  { label: "Solutions", id: "solutions" },
  { label: "Technology", id: "technology" },
  { label: "AI Lab", id: "ai-lab" },
  { label: "Contact", id: "contact" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
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
      className="fixed top-0 left-0 right-0 z-50 glass-strong hidden md:block"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="select-none leading-none">
          <div className="text-xl font-black tracking-wider text-foreground">KISAAN</div>
          <div className="text-xl font-black tracking-wider text-gradient-green">VISION</div>
        </Link>

        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/profile")}
                className="glass rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5" />
                Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => supabase.auth.signOut()}
                className="glass rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="glass glow-green-subtle rounded-full px-5 py-2 text-sm font-semibold text-primary transition-all hover:glow-green"
            >
              Get Started
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
