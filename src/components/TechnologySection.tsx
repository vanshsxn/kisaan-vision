import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { farmingMethods } from "@/data/farmingMethods";

import hydroponicsImg from "@/assets/farming/hydroponics.jpg";
import aquaponicsImg from "@/assets/farming/aquaponics.jpg";
import aeroponicsImg from "@/assets/farming/aeroponics.jpg";
import vraImg from "@/assets/farming/vra.jpg";
import agrivoltaicsImg from "@/assets/farming/agrivoltaics.jpg";
import dronesImg from "@/assets/farming/drones.jpg";
import greenhouseImg from "@/assets/farming/greenhouse.jpg";
import verticalFarmingImg from "@/assets/farming/vertical-farming.jpg";
import regenerativeImg from "@/assets/farming/regenerative.jpg";

const imageMap: Record<string, string> = {
  hydroponics: hydroponicsImg,
  aquaponics: aquaponicsImg,
  aeroponics: aeroponicsImg,
  vra: vraImg,
  agrivoltaics: agrivoltaicsImg,
  drones: dronesImg,
  greenhouse: greenhouseImg,
  "vertical-farming": verticalFarmingImg,
  "regenerative-no-till": regenerativeImg,
};

const TechnologySection = () => {
  const navigate = useNavigate();

  return (
    <section id="technology" className="relative py-24 overflow-hidden bg-background">
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4"
          >
            Future of <span className="text-gradient-green">Farming</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Cutting-edge technologies <strong className="text-foreground">revolutionizing</strong> agriculture for a <strong className="text-foreground">sustainable tomorrow</strong>.
          </motion.p>
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {farmingMethods.map((tech, i) => (
            <motion.div
              key={tech.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              onClick={() => navigate(`/farming-methods/${tech.slug}`)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer border border-border hover:border-primary/30 transition-all duration-500 bg-card shadow-sm hover:shadow-lg"
            >
              {/* Background image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={imageMap[tech.slug] || tech.heroImage}
                  alt={tech.title}
                  loading="lazy"
                  width={768}
                  height={512}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                {/* Icon badge */}
                <div className="absolute top-3 left-3 p-2 rounded-xl bg-white/80 backdrop-blur-md border border-border shadow-sm">
                  <tech.icon className="h-5 w-5 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-black text-foreground mb-0.5">{tech.title}</h3>
                <p className="text-xs font-bold text-primary mb-3">{tech.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {tech.description}
                </p>

                {/* Explore link */}
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:text-accent transition-colors">
                  Explore →
                </div>
              </div>

              {/* Bottom glow line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
