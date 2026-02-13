import { useRef, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // 1. Capture Scroll Progress
  // target: the 800vh container | offset: start to end
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // 2. The "Smoothness" Engine
  // This aligns the scroll feeling to the video playback
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 35,   // How fast the video 'catches up' to your scroll
    damping: 25,     // Prevents bouncy jitter
    restDelta: 0.001
  });

  // 3. Sync Video Time with Scroll
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (videoRef.current && videoRef.current.duration) {
      // Direct assignment within requestAnimationFrame for maximum smoothness
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = latest * videoRef.current.duration;
        }
      });
    }
  });

  // 4. Align UI Elements
  // Text is fully visible at 0, starts fading out at 10% scroll, gone by 20%
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  // Ensure video is paused on load so it only moves when we scroll
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  return (
    /* h-[800vh] gives the 8s video enough "room" to scroll slowly */
    <div ref={sectionRef} className="relative h-[800vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* The Video Layer */}
        <video
          ref={videoRef}
          // Using the direct MP4 link from your Cloudinary account
          src="https://res.cloudinary.com/divan2dib/video/upload/v1708700000/tractor-video.mp4" 
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          style={{ filter: "brightness(0.6)" }}
        />

        {/* Branding Overlay */}
        <motion.div 
          style={{ opacity, scale }}
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-primary"
          >
            MV Studios Japan Presents
          </motion.p>

          <h1 className="max-w-5xl text-6xl font-black tracking-tighter text-white md:text-8xl lg:text-9xl">
            KISAAN <br />
            <span className="text-primary italic">VISION.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-gray-400">
            Scroll to see how our AI-driven tractors are reshaping the agricultural landscape.
          </p>

          <div className="mt-10 flex gap-4">
            <button 
              onClick={() => navigate("/chatbot")}
              className="rounded-full bg-primary px-10 py-4 font-bold text-black transition-transform hover:scale-105 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </motion.div>

        {/* Scroll Progress Indicator */}
        <motion.div 
          className="absolute bottom-0 left-0 h-1.5 bg-primary z-20"
          style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
        />
      </div>
    </div>
  );
};

export default HeroSection;