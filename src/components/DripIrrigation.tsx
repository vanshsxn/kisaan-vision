import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dripImage from "@/assets/drip-irrigation.jpg";
import { Droplets, Gauge, Leaf } from "lucide-react";

const stats = [
  { icon: Droplets, value: "40%", label: "Water Saved", delay: 0.1 },
  { icon: Gauge, value: "3x", label: "Yield Increase", delay: 0.2 },
  { icon: Leaf, value: "98%", label: "Efficiency Rate", delay: 0.3 },
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
              src={dripImage}
              alt="Precision Drip Irrigation"
              style={{ y: imageY }}
              className="absolute inset-0 w-full h-[130%] object-cover -top-[15%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
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
              Smart Irrigation
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6"
            >
              Precision Drip
              <br />
              <span className="text-gradient-green">Irrigation</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-muted-foreground text-lg leading-relaxed mb-10"
            >
              Our sensor-driven drip system delivers water directly to root zones with
              millimeter precision, reducing waste and maximizing crop health through
              real-time soil moisture analytics.
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
