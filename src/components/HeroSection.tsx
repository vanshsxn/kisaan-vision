import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // 1. Track Scroll Progress
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // 2. Smooth the Scroll Progress (This kills the lag!)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 35,   // How fast it moves
    damping: 20,     // How much it bounces/resists
    restDelta: 0.001
  });

  // 3. Sync Video Time to the Smoothed Progress
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = latest * videoRef.current.duration;
    }
  });

  // 4. Content Animations (Text fades out as you scroll deep into the video)
  const contentOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  return (
    <div ref={sectionRef} className="relative h-[500vh] bg-background">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* The Video Layer */}
        <video
          ref={videoRef}
          src="https://www.w3schools.com/html/mov_bbb.mp4" 
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay Gradients for Readability */}
        <div className="absolute inset-0 bg-black/20 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background z-[2]" />

        {/* Main Content */}
        <motion.div 
          style={{ opacity: contentOpacity, scale: contentScale }}
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary"
          >
            Next-Gen Agriculture
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Farm Smarter.
            <br />
            <span className="text-gradient-green">Grow More.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-6 max-w-xl text-lg text-gray-200"
          >
            AI-powered precision agriculture that transforms how the world feeds itself.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-10 flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/chatbot")}
              className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-black transition-all hover:glow-green"
            >
              Explore Solutions
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="glass glow-green-subtle rounded-full px-8 py-3 text-sm font-bold text-white"
            >
              Get Started
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity: contentOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-xs text-white/50 tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-8 w-5 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="h-1.5 w-1 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;