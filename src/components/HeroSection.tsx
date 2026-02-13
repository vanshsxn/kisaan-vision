import { useRef, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 35,
    damping: 25,
    restDelta: 0.001
  });

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = latest * videoRef.current.duration;
    }
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div ref={sectionRef} className="relative h-[600vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Background Video */}
        <video
          ref={videoRef}
          src="https://res.cloudinary.com/divan2dib/video/upload/v1771002367/0213_pgikbv.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover z-0"
        />

        {/* Dark Overlay to make text pop */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Content Layer */}
        <motion.div 
          style={{ opacity }}
          className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center"
        >
          {/* Aligned Typography */}
          <h1 className="flex flex-col items-center font-black tracking-tighter text-white leading-[0.85]">
            <span className="text-7xl md:text-9xl uppercase">Kisaan</span>
            <span className="text-7xl md:text-9xl uppercase text-primary">Vision</span>
          </h1>

          <p className="mt-8 max-w-lg text-lg text-gray-200 font-medium">
            Next-gen precision farming at your fingertips.
          </p>

          <button 
            onClick={() => navigate("/chatbot")}
            className="mt-10 rounded-full bg-primary px-10 py-4 font-bold text-black hover:scale-105 transition-transform"
          >
            Get Started
          </button>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-primary z-30"
          style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
        />
      </div>
    </div>
  );
};

export default HeroSection;