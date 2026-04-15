import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DripIrrigation from "@/components/DripIrrigation";
import TechnologySection from "@/components/TechnologySection";
import AIAnalyzer from "@/components/AIAnalyzer";
import MobileBottomNav from "@/components/MobileBottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <DripIrrigation />
      <TechnologySection />
      <AIAnalyzer />

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="leading-none">
            <div className="text-sm font-black tracking-wider text-foreground">KISAAN</div>
            <div className="text-sm font-black tracking-wider text-primary">VISION</div>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Kisaan Vision. Cultivating the future.
          </p>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
};

export default Index;
