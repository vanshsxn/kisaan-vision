import { motion } from "framer-motion";
import { 
  Droplets, Fish, Wind, MapPin, Sun, Plane, 
  Thermometer, Building2, Shovel, Cpu 
} from "lucide-react";

const technologies = [
  {
    icon: Droplets,
    title: "Hydroponics",
    subtitle: "Soil-less Farming",
    description: "Growing plants in a nutrient-rich water solution instead of soil. It uses 90% less water and allows you to grow crops vertically in small spaces or indoor \"Plant Factories.\"",
  },
  {
    icon: Fish,
    title: "Aquaponics",
    subtitle: "The Fish & Plant Loop",
    description: "A circular ecosystem where you raise fish in tanks. The waste from the fish provides natural fertilizer for the plants, and the plants clean the water for the fish. It's a 100% organic, closed-loop system.",
  },
  {
    icon: Wind,
    title: "Aeroponics",
    subtitle: "Misting the Roots",
    description: "Plants are suspended in the air, and their roots are sprayed with a high-nutrient mist. This allows plants to absorb more oxygen, making them grow significantly faster.",
  },
  {
    icon: MapPin,
    title: "Variable Rate Application",
    subtitle: "VRA",
    description: "Using GPS and AI, tractors apply different amounts of fertilizer or seeds to different parts of a field. If one area is healthy, the machine uses less; if struggling, it uses more.",
  },
  {
    icon: Sun,
    title: "Agrivoltaics",
    subtitle: "Farming + Solar",
    description: "Installing solar panels high above the crops. The panels generate electricity while providing partial shade, reducing evaporation and protecting crops from heat stress.",
  },
  {
    icon: Plane,
    title: "Drone-Assisted Farming",
    subtitle: "Seeding & Spraying",
    description: "Drones fly over large fields to bombard the soil with seed pods or spray fertilizer only on specific unhealthy spots detected by AI, covering hectares in minutes.",
  },
  {
    icon: Thermometer,
    title: "Greenhouse Automation",
    subtitle: "AI Climate Control",
    description: "Using AI to control the climate inside a greenhouse. Motorized vents, fans, and LED grow lights automatically adjust based on weather to maintain the perfect growing season year-round.",
  },
  {
    icon: Building2,
    title: "Vertical Farming",
    subtitle: "Skyscraper Farms",
    description: "Growing crops in stacked layers. Essential for urban farming near cities, reducing food travel distance (lowering carbon footprint) and maximizing every square inch of land.",
  },
  {
    icon: Shovel,
    title: "Regenerative No-Till",
    subtitle: "Farming",
    description: "Using specialized machines to plant seeds without plowing. This keeps the soil's natural microbiome healthy, traps carbon in the ground, and prevents soil erosion.",
  },
];

const TechnologySection = () => {
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
          {technologies.map((tech, i) => (
            <motion.div
              key={tech.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 hover:glow-border transition-all duration-500 group"
            >
              <div className="rounded-xl glass p-3 w-fit mb-4 glow-green-subtle group-hover:glow-green transition-all">
                <tech.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{tech.title}</h3>
              <p className="text-xs font-semibold text-primary mb-3">{tech.subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
