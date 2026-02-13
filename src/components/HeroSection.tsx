import { useRef, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Use Motion Value Event to scrub the video
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (videoRef.current && videoRef.current.duration) {
      // requestAnimationFrame ensures the video updates smoothly with the hardware refresh rate
      requestAnimationFrame(() => {
        videoRef.current!.currentTime = latest * videoRef.current!.duration;
      });
    }
  });

  return (
    <div ref={sectionRef} className="relative h-[500vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src="https://www.w3schools.com/html/mov_bbb.mp4" // Directly from the public folder
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ willChange: "contents" }} // Optimization hint for the browser
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-white md:text-8xl"
          >
            Farm Smarter. <br />
            <span className="text-gradient-green">Grow More.</span>
          </motion.h1>
          
          <button 
            onClick={() => navigate("/chatbot")}
            className="mt-8 rounded-full bg-primary px-10 py-4 font-bold text-black hover:scale-105 transition-transform"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;