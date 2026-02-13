import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, ImagePlus, X, LogOut, Bot, User, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

const demoResponses: Record<string, string> = {
  default:
    "I'm Kisaan Vision's AI assistant — currently in demo mode. I can help with crop diseases, soil health, irrigation, pest management, and more. Ask me anything about agriculture! 🌾",
  crop: "For healthy crop growth, ensure proper soil pH (6.0-7.0), adequate sunlight, and consistent watering. Rotate crops annually to prevent soil depletion. Consider companion planting — for example, marigolds deter pests when planted near tomatoes.",
  soil: "Healthy soil is the foundation of farming. Test your soil's NPK levels regularly. Add compost or vermicompost to improve organic matter. Avoid over-tilling as it destroys soil structure and beneficial microorganisms.",
  water: "Drip irrigation saves 30-50% water compared to flood irrigation. Water early morning to minimize evaporation. Use mulching to retain soil moisture. Monitor soil moisture sensors for precision watering schedules.",
  pest: "Integrated Pest Management (IPM) is the best approach: start with biological controls like ladybugs for aphids, use neem oil as a natural pesticide, and resort to chemical treatments only when necessary. Always identify the pest before treatment.",
  fertilizer: "Use organic fertilizers like vermicompost, bone meal, and fish emulsion for sustainable farming. Apply NPK fertilizers based on soil test results. Over-fertilization can burn roots and pollute groundwater.",
  disease: "Common crop diseases include blight, rust, and powdery mildew. Prevention is key: use disease-resistant varieties, ensure proper spacing for air circulation, and avoid overhead watering. If you upload a photo, I can help identify the issue!",
  weather: "Modern farming relies on weather data. Use weather forecasting apps to plan irrigation and harvesting. Protect crops from extreme heat with shade nets and from frost with row covers.",
};

function getDemoResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("crop") || lower.includes("plant") || lower.includes("grow"))
    return demoResponses.crop;
  if (lower.includes("soil") || lower.includes("earth") || lower.includes("compost"))
    return demoResponses.soil;
  if (lower.includes("water") || lower.includes("irrigat") || lower.includes("drip"))
    return demoResponses.water;
  if (lower.includes("pest") || lower.includes("insect") || lower.includes("bug"))
    return demoResponses.pest;
  if (lower.includes("fertiliz") || lower.includes("nutrient") || lower.includes("npk"))
    return demoResponses.fertilizer;
  if (lower.includes("disease") || lower.includes("blight") || lower.includes("fungus"))
    return demoResponses.disease;
  if (lower.includes("weather") || lower.includes("rain") || lower.includes("climate"))
    return demoResponses.weather;
  return demoResponses.default;
}

const Chatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to Kisaan Vision AI! 🌱 I'm your agriculture assistant (demo mode). Ask me about crops, soil, pests, irrigation, or upload a crop image for analysis!",
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed && !selectedImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed || "Uploaded an image for analysis",
      image: selectedImage ?? undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedImage(null);
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500));

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: selectedImage
        ? "I can see the crop image you uploaded. In the full version, our AI would analyze it for diseases, nutrient deficiencies, and growth stage. This is a demo — the trained model will be integrated soon! 📸🌿"
        : getDemoResponse(trimmed),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="glass-strong border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="rounded-full glass p-1.5 glow-green-subtle">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Kisaan AI</div>
              <div className="text-[10px] text-primary">Demo Mode</div>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="glass rounded-full px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </motion.button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "glass glow-border rounded-bl-md"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {msg.role === "assistant" ? (
                  <Bot className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  {msg.role === "user" ? "You" : "Kisaan AI"}
                </span>
              </div>
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Uploaded crop"
                  className="rounded-lg mb-2 max-h-48 object-cover"
                />
              )}
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.3s]" />
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:0.6s]" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {selectedImage && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-20 rounded-lg object-cover" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="glass-strong border-t border-border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3 max-w-3xl mx-auto"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ImagePlus className="h-5 w-5" />
          </motion.button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about crops, soil, pests..."
            className="flex-1 bg-secondary/50 border-border"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={!input.trim() && !selectedImage}
            className="rounded-full bg-primary p-2.5 text-primary-foreground disabled:opacity-30 hover:glow-green transition-all"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
