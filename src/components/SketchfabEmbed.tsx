import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2 } from "lucide-react";

interface SketchfabEmbedProps {
  modelId: string;
  title: string;
}

const SketchfabEmbed = ({ modelId, title }: SketchfabEmbedProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const embedUrl = `https://sketchfab.com/models/${modelId}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0`;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-3 text-sm font-bold text-primary hover:bg-white/10 transition-all"
      >
        <Maximize2 className="h-4 w-4" />
        View 3D Model
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
                {title}
              </div>
              <iframe
                title={title}
                src={embedUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SketchfabEmbed;
