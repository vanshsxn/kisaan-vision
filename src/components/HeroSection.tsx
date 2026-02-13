import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  // Optimized Video URL
  const videoUrl = "https://res.cloudinary.com/divan2dib/video/upload/f_auto,q_auto/v1771002367/0213_pgikbv.mp4";

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      
      {/* 1. BACKGROUND VIDEO */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="https://res.cloudinary.com/divan2dib/video/upload/so_0/v1771002367/0213_pgikbv.jpg"
        className="absolute inset-0 h-full w-full object-cover z-0"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* 2. OVERLAY GRADIENT - Darkens the top for Navbar visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/60 z-10" />

      {/* 3. CONTENT CONTAINER */}
      {/* Changed to justify-start and added heavy top padding to move it down */}
      <div className="relative z-20 flex h-full flex-col items-center justify-start px-6 pt-32 md:pt-48 lg:pt-56">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center text-center select-none"
        >
          {/* THE BRANDING - Using flex-col and tight leading to prevent overlap */}
          <h1 className="flex flex-col items-center font-black tracking-tighter uppercase leading-[0.75]">
            <span className="text-[16vw] md:text-[10rem] lg:text-[12rem] text-white">
              Kisaan
            </span>
            <span className="text-[16vw] md:text-[10rem] lg:text-[12rem] text-[#22C55E]">
              Vision
            </span>
          </h1>

          {/* TAGLINE */}
          <p className="mt-12 max-w-xl text-sm md:text-lg text-gray-300 font-medium tracking-[0.2em] uppercase">
            Revolutionizing Agriculture Through Precision Intelligence.
          </p>

          {/* ACTION BUTTON */}
          <button 
            onClick={() => navigate("/chatbot")}
            className="mt-10 rounded-full bg-[#22C55E] px-12 py-4 font-bold text-black shadow-lg shadow-green-500/20 hover:scale-105 transition-transform active:scale-95"
          >
            Get Started
          </button>
        </motion.div>
      </div>

      {/* BOTTOM VIGNETTE */}
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-10" />
    </div>
  );
};

export default HeroSection;