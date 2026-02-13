import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const videoUrl = "https://res.cloudinary.com/divan2dib/video/upload/f_auto,q_auto/v1771002367/0213_pgikbv.mp4";

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      
      {/* 1. BACKGROUND VIDEO */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover z-0"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* 2. OVERLAY */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* 3. CONTENT CONTAINER */}
      <div className="relative z-20 flex h-full flex-col items-center justify-start px-6 pt-32 md:pt-44">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center select-none"
        >
          {/* THE BRANDING - Using items-start inside to ensure K and V align perfectly */}
          <h1 className="flex flex-col items-start font-black tracking-tighter uppercase leading-[0.8]">
            <span className="text-[12vw] md:text-[6.5rem] lg:text-[8rem] text-white">
              Kisaan
            </span>
            <span className="text-[12vw] md:text-[6.5rem] lg:text-[8rem] text-[#22C55E]">
              Vision
            </span>
          </h1>

          {/* SUBTEXT */}
          <p className="mt-8 max-w-lg text-xs md:text-sm text-gray-300 font-bold tracking-[0.3em] uppercase leading-relaxed">
            Revolutionizing Agriculture Through <br className="hidden md:block"/> Precision Intelligence.
          </p>

          {/* GET STARTED BUTTON - Restored */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/chatbot")}
            className="mt-10 rounded-full bg-[#22C55E] px-10 py-3.5 text-sm font-black uppercase text-black shadow-xl shadow-green-500/20 transition-all"
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>

      {/* BOTTOM GRADIENT BLEND */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10" />
    </div>
  );
};

export default HeroSection;