import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const videoUrl = "https://res.cloudinary.com/divan2dib/video/upload/f_auto,q_auto/v1771002367/0213_pgikbv.mp4";

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      
      {/* 1. OPTIMIZED VIDEO */}
      <video
        autoPlay
        muted
        playsInline
        poster="https://res.cloudinary.com/divan2dib/video/upload/so_0/v1771002367/0213_pgikbv.jpg"
        className="absolute inset-0 h-full w-full object-cover z-0"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* 2. GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/60 z-10" />

      {/* 3. ALIGNED TEXT CONTENT */}
      {/* CHANGED: 'justify-start' instead of 'justify-center' plus 'pt' to shift it down from Navbar */}
      <div className="relative z-20 flex h-full flex-col items-center justify-start px-4 pt-32 md:pt-48 lg:pt-56">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          {/* Added mt-10 here for additional downward shift control */}
          className="flex flex-col items-center text-center select-none mt-10"
        >
          {/* THE LOGO */}
          <h1 className="flex flex-col items-center font-black tracking-tighter uppercase">
            {/* KISAAN */}
            <span className="text-[15vw] md:text-[9rem] lg:text-[11rem] leading-[0.75] text-white">
              Kisaan
            </span>
            {/* VISION */}
            <span className="text-[15vw] md:text-[9rem] lg:text-[11rem] leading-[0.75] text-primary">
              Vision
            </span>
          </h1>

          {/* SUBTEXT */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 max-w-xl text-sm md:text-lg text-gray-300 font-medium tracking-widest px-4"
          >
            REVOLUTIONIZING AGRICULTURE THROUGH PRECISION INTELLIGENCE.
          </motion.p>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/chatbot")}
            className="mt-10 rounded-full bg-primary px-12 py-4 font-bold text-black shadow-xl shadow-primary/20"
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>
      
      {/* Optional: Subtle bottom fade to blend with next section */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-20" />
    </div>
  );
};

export default HeroSection;