import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DripIrrigation from "@/components/DripIrrigation";
import AIAnalyzer from "@/components/AIAnalyzer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <DripIrrigation />
      <AIAnalyzer />

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="leading-none">
            <div className="text-sm font-black tracking-wider text-foreground">KISAAN</div>
            <div className="text-sm font-black tracking-wider text-gradient-green">VISION</div>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Kisaan Vision. Cultivating the future.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
