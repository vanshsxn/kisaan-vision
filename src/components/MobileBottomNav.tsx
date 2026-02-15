import { Home, Cpu, FlaskConical, MessageSquare, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const items = [
    { icon: Home, label: "Home", action: () => { window.scrollTo({ top: 0, behavior: "smooth" }); if (location.pathname !== "/") navigate("/"); } },
    { icon: FlaskConical, label: "Solutions", action: () => scrollTo("solutions") },
    { icon: Cpu, label: "Tech", action: () => scrollTo("technology") },
    { icon: MessageSquare, label: "AI Lab", action: () => scrollTo("ai-lab") },
    { icon: User, label: "Profile", action: () => navigate(user ? "/profile" : "/login") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-border">
      <div className="flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
