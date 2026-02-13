import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      
      {/* 1. AUTO-PLAY VIDEO (PLAYS ONCE) */}
      <video
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover z-0"
        /* We removed 'loop' so it stops at the end */
        onEnded={(e) => {
          // Optional: You can trigger an action when the video finishes
          console.log("Intro complete");
        }}
      >
        <source 
          src="https://res.cloudinary.com/divan2dib/video/upload/v1771002367/0213_pgikbv.mp4" 
          type="video/mp4" 
        />
      </video>

      {/* 2. THE OVERLAY (Ensures text is readable) */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* 3. CENTERED LOGO TEXT */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Aligned Typography: K and V centered */}
          <h1 className="flex flex-col items-center font-black tracking-tighter text-white leading-[0.8] uppercase">
            <span className="text-7xl md:text-9xl lg:text-[10rem]">Kisaan</span>
            <span className="text-7xl md:text-9xl lg:text-[10rem] text-primary">Vision</span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-8 max-w-lg text-lg md:text-xl text-gray-300 font-medium tracking-wide"
          >
            Revolutionizing Agriculture Through Precision Intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-10"
          >
            <button 
              onClick={() => navigate("/chatbot")}
              className="rounded-full bg-primary px-12 py-4 font-bold text-black transition-transform hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Blends the bottom of the hero into your website content */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-20" />
    </div>
  );
};

export default HeroSection;