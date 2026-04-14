import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import DripIrrigation from "@/components/DripIrrigation";
import TechnologySection from "@/components/TechnologySection";
import AIAnalyzer from "@/components/AIAnalyzer";
import ContactSection from "@/components/ContactSection";
import MobileBottomNav from "@/components/MobileBottomNav";

const ScrollLanding = lazy(() => import("@/components/scroll3d/ScrollLanding"));

const Index = () => {
  return (
    <div className="min-h-screen bg-[#030711]">
      <Navbar />

      {/* Scroll-driven 3D storytelling */}
      <Suspense fallback={<div className="h-screen bg-[#030711]" />}>
        <ScrollLanding />
      </Suspense>

      <DripIrrigation />
      <TechnologySection />
      <AIAnalyzer />
      <ContactSection />

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#030711]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="leading-none">
            <div className="text-sm font-black tracking-wider text-white">KISAAN</div>
            <div className="text-sm font-black tracking-wider text-primary">VISION</div>
          </div>
          <p className="text-xs text-gray-600">
            © 2026 Kisaan Vision. Cultivating the future.
          </p>
        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
};

export default Index;
