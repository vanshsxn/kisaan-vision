import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScanLine, Crosshair, Layers, Timer } from "lucide-react";

const stats = [
  { icon: ScanLine, value: "96.7%", label: "Accuracy Rate", delay: 0.1 },
  { icon: Layers, value: "38", label: "Crop Categories", delay: 0.2 },
  { icon: Timer, value: "<1s", label: "Inference Time", delay: 0.3 },
];

const DripIrrigation = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section ref={sectionRef} id="solutions" className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Parallax Image */}
          <div className="relative h-[500px] rounded-2xl overflow-hidden glow-border">
            <motion.img
              src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&q=80"
              alt="Kisaan Vision AI Scan"
              style={{ y: imageY }}
              className="absolute inset-0 w-full h-[130%] object-cover -top-[15%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            
            {/* Scanning overlay effect */}
            <motion.div
              animate={{ y: ["0%", "100%", "0%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-primary/60 shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
            />
          </div>

          {/* Content */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-sm font-semibold uppercase tracking-[0.3em] text-primary mb-4"
            >
              AI-Powered Diagnostics
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6"
            >
              Kisaan Vision
              <br />
              <span className="text-gradient-green">AI Scan</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xs font-semibold uppercase tracking-wider text-primary/70 mb-4"
            >
              Real-time Pathogen Detection
            </motion.p>

            <motion.p
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-muted-foreground text-lg leading-relaxed mb-10"
            >
              Powered by a custom-trained Convolutional Neural Network (CNN), our vision system identifies 38 different crop diseases from a single leaf photo. By utilizing Edge AI, the scanning process happens instantly on the farmer's device, providing immediate remedies for blight, rust, and viral infections.
            </motion.p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map(({ icon: Icon, value, label, delay }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay }}
                  className="glass rounded-xl p-4 text-center"
                >
                  <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <div className="text-2xl font-black text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DripIrrigation;
