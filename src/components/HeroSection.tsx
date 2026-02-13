import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  // Cloudinary Optimization Tip: 
  // Adding 'f_auto,q_auto' to the URL tells Cloudinary to deliver the smallest 
  // file size possible based on the user's browser (WebP/AV1).
  const videoUrl = "https://res.cloudinary.com/divan2dib/video/upload/f_auto,q_auto/v1771002367/0213_pgikbv.mp4";

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      
      {/* 1. OPTIMIZED VIDEO */}
      <video
        autoPlay
        muted
        playsInline
        // We use 'poster' to show a frame immediately while the video downloads
        poster="https://res.cloudinary.com/divan2dib/video/upload/so_0/v1771002367/0213_pgikbv.jpg"
        className="absolute inset-0 h-full w-full object-cover z-0"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* 2. GRADIENT OVERLAY (Prevents the text-overlap from looking messy) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60 z-10" />

      {/* 3. ALIGNED TEXT CONTENT */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-4">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center select-none"
        >
          {/* THE LOGO: Fixed 'Leading' to prevent overlapping */}
          <h1 className="flex flex-col items-center font-black tracking-tighter uppercase">
            {/* KISAAN - White */}
            <span className="text-[16vw] md:text-[10rem] lg:text-[13rem] leading-[0.7] text-white">
              Kisaan
            </span>
            {/* VISION - Green, perfectly aligned under K */}
            <span className="text-[16vw] md:text-[10rem] lg:text-[13rem] leading-[0.7] text-primary">
              Vision
            </span>
          </h1>

          {/* SUBTEXT: Increased margin-top to separate from large font */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 max-w-xl text-sm md:text-lg text-gray-300 font-medium tracking-widest px-4"
          >
            REVOLUTIONIZING AGRICULTURE THROUGH PRECISION INTELLIGENCE.
          </motion.p>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/chatbot")}
            className="mt-10 rounded-full bg-primary px-12 py-4 font-bold text-black shadow-xl shadow-primary/10"
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;