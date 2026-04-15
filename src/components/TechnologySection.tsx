import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { farmingMethods } from "@/data/farmingMethods";

// Keep your existing asset imports
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
    <section id="technology" className="relative py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header - Updated to match Image 3 style */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 mb-4"
          >
            Future of <span className="text-[#4ade80]">Farming</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg max-w-2xl mx-auto"
          >
            Cutting-edge technologies revolutionizing agriculture for a sustainable tomorrow.
          </motion.p>
        </div>

        {/* 4-column Glass Grid (Image 3 Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {farmingMethods.map((tech, i) => (
            <motion.div
              key={tech.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/farming-methods/${tech.slug}`)}
              className="group relative h-[400px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl shadow-slate-200/50 transition-all duration-500"
            >
              {/* Main Image Background */}
              <img
                src={imageMap[tech.slug] || tech.heroImage}
                alt={tech.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Dark Gradient Overlay for readability */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />

              {/* Floating Glass Content Card (Image 3 specific) */}
              <div className="absolute bottom-4 left-4 right-4 p-5 bg-white/20 backdrop-blur-xl rounded-[2rem] border border-white/30 text-white transform transition-all duration-500 group-hover:translate-y-[-5px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-2xl bg-[#4ade80] shadow-lg shadow-[#4ade80]/30">
                    <tech.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold leading-tight">{tech.title}</h3>
                </div>
                
                <p className="text-xs text-white/90 leading-relaxed line-clamp-2">
                  {tech.description}
                </p>
                
                {/* Hidden "Explore" that appears on hover */}
                <div className="h-0 opacity-0 group-hover:h-6 group-hover:opacity-100 transition-all duration-300 mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#4ade80]">
                  Explore Details →
                </div>
              </div>

              {/* Top Right "Action" Dot (Image 3 Detail) */}
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xl">+</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;