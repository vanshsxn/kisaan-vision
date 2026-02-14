import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = ["Solutions", "Technology", "AI Lab", "Contact"];

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item) => (
        <a
          key={item}
          href={`#${item.toLowerCase().replace(" ", "-")}`}
          onClick={onClick}
          className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
        >
          {item}
        </a>
      ))}
    </>
  );

  const AuthButton = ({ onClick }: { onClick?: () => void }) =>
    user ? (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { supabase.auth.signOut(); onClick?.(); }}
        className="glass rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
      >
        <LogOut className="h-3.5 w-3.5" />
        Logout
      </motion.button>
    ) : (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { navigate("/signup"); onClick?.(); }}
        className="glass glow-green-subtle rounded-full px-5 py-2 text-sm font-semibold text-primary transition-all hover:glow-green"
      >
        Get Started
      </motion.button>
    );

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="select-none leading-none">
          <div className="text-xl font-black tracking-wider text-foreground">KISAAN</div>
          <div className="text-xl font-black tracking-wider text-gradient-green">VISION</div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
        </div>
        <div className="hidden md:flex items-center gap-3">
          <AuthButton />
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="text-foreground p-2">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-strong border-border w-[280px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 mt-8">
                <NavLinks onClick={() => setOpen(false)} />
                <div className="pt-4 border-t border-border">
                  <AuthButton onClick={() => setOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
