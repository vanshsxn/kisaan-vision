import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Cpu } from "lucide-react";
import { farmingMethods } from "@/data/farmingMethods";

const TechnologySection = () => {
  const navigate = useNavigate();

  return (
    <section id="technology" className="relative py-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/3 blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold text-primary mb-6"
          >
            <Cpu className="h-3.5 w-3.5" />
            Our Technology
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4"
          >
            Future of <span className="text-gradient-green">Farming</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-lg mx-auto"
          >
            Cutting-edge technologies revolutionizing agriculture for a sustainable tomorrow.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmingMethods.map((tech, i) => (
            <motion.div
              key={tech.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              onClick={() => navigate(`/farming-methods/${tech.slug}`)}
              className="glass rounded-2xl p-6 hover:glow-border transition-all duration-500 group relative overflow-hidden cursor-pointer"
            >
              {/* Background emoji */}
              <span className="absolute top-3 right-3 text-4xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 select-none pointer-events-none">
                {tech.emoji}
              </span>

              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                className="rounded-xl glass p-3 w-fit mb-4 glow-green-subtle group-hover:glow-green transition-all"
              >
                <tech.icon className="h-5 w-5 text-primary" />
              </motion.div>
              <h3 className="text-lg font-bold text-foreground mb-1">{tech.title}</h3>
              <p className="text-xs font-semibold text-primary mb-3">{tech.subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{tech.description}</p>

              {/* Explore indicator */}
              <div className="mt-4 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Explore →
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
