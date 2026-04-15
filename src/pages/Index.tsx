import Navbar from "@/components/Navbar";
import DripIrrigation from "@/components/DripIrrigation";
import TechnologySection from "@/components/TechnologySection"; // This is "Future of Farming"
import AIAnalyzer from "@/components/AIAnalyzer";
import MobileBottomNav from "@/components/MobileBottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      
      {/* 1. AI Diagnostic Hero */}
      <div className="pt-24">
        <AIAnalyzer />
      </div>

      {/* 2. Future of Farming Section */}
      <TechnologySection />

      {/* 3. Other Sections */}
      <DripIrrigation />

      <footer className="border-t border-slate-100 py-12 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="leading-none">
            <div className="text-sm font-black tracking-wider text-slate-800">KISSAN</div>
            <div className="text-sm font-black tracking-wider text-[#4ade80]">VISION</div>
          </div>
          <p className="text-xs text-slate-400">
            © 2026 Kissan Vision. Cultivating the future.
          </p>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
};

export default Index;