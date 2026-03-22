import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getMethodBySlug } from "@/data/farmingMethods";
import MobileBottomNav from "@/components/MobileBottomNav";
import Navbar from "@/components/Navbar";

const FarmingMethodDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const method = getMethodBySlug(slug || "");

  if (!method) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-foreground mb-4">Method Not Found</h1>
          <Link to="/" className="text-primary hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={method.heroImage}
          alt={method.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
          <div className="container mx-auto">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="group mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back
            </motion.button>

            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl mb-4 block"
            >
              {method.emoji}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-foreground tracking-tight"
            >
              {method.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary font-semibold text-lg mt-2"
            >
              {method.subtitle}
            </motion.p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        {/* Deep Description */}
        <div className="max-w-3xl mx-auto space-y-6 mb-20">
          {method.deepDescription.map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-muted-foreground text-lg leading-relaxed"
            >
              {para}
            </motion.p>
          ))}
        </div>

        {/* Key Features */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-black text-foreground text-center mb-12"
          >
            Key <span className="text-gradient-green">Features</span>
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {method.features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 text-center glow-border hover:glow-green transition-all"
              >
                <span className="text-4xl block mb-4">{feat.icon}</span>
                <h3 className="text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* VR Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/vr-experience/${method.slug}`)}
            className="inline-flex items-center gap-3 rounded-full bg-primary px-10 py-4 text-lg font-black text-primary-foreground shadow-xl shadow-primary/20 hover:glow-green transition-all"
          >
            <Sparkles className="h-5 w-5" />
            Experience in VR
          </motion.button>
          <p className="text-sm text-muted-foreground mt-4">
            Explore a 3D virtual environment of this farming practice
          </p>
        </motion.div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default FarmingMethodDetail;
