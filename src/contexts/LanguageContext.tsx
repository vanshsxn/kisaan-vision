import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi";

interface Translations {
  [key: string]: { en: string; hi: string };
}

const translations: Translations = {
  // Navbar
  solutions: { en: "Solutions", hi: "समाधान" },
  technology: { en: "Technology", hi: "तकनीक" },
  aiLab: { en: "AI Lab", hi: "एआई लैब" },
  contact: { en: "Contact", hi: "संपर्क" },
  profile: { en: "Profile", hi: "प्रोफ़ाइल" },
  dashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
  myProfile: { en: "My Profile", hi: "मेरी प्रोफ़ाइल" },
  logout: { en: "Logout", hi: "लॉग आउट" },
  getStarted: { en: "Get Started", hi: "शुरू करें" },

  // Hero
  heroTitle1: { en: "The Future of", hi: "खेती का" },
  heroTitle2: { en: "Farming is Here", hi: "भविष्य यहाँ है" },
  heroSubtitle: {
    en: "Harness the power of Artificial Intelligence and precision agriculture to transform every acre of your land into a smart, sustainable powerhouse.",
    hi: "अपनी ज़मीन के हर एकड़ को स्मार्ट, टिकाऊ ताक़त में बदलने के लिए AI और सटीक कृषि की शक्ति का उपयोग करें।",
  },
  exploreSolutions: { en: "Explore Solutions", hi: "समाधान देखें" },

  // AI Analyzer
  aiPowered: { en: "AI-Powered", hi: "एआई-संचालित" },
  aiCropAnalyzer: { en: "AI Crop", hi: "एआई फसल" },
  analyzer: { en: "Analyzer", hi: "विश्लेषक" },
  uploadPrompt: {
    en: "Upload a photo of your crop leaf and let our AI detect diseases, deficiencies, and health status.",
    hi: "अपनी फसल की पत्ती की तस्वीर अपलोड करें और हमारे AI से बीमारियाँ पहचानें।",
  },
  dropImage: { en: "Drop your crop image here", hi: "अपनी फसल की तस्वीर यहाँ डालें" },
  orBrowse: { en: "or click to browse • PNG, JPG up to 10MB", hi: "या ब्राउज़ करें • PNG, JPG 10MB तक" },
  scanLeaf: { en: "Scan Leaf", hi: "पत्ती स्कैन करें" },
  analyzing: { en: "Analyzing…", hi: "विश्लेषण हो रहा है…" },
  diagnosis: { en: "Diagnosis", hi: "निदान" },
  confidence: { en: "Confidence", hi: "विश्वसनीयता" },
  healthyMsg: { en: "Your crop looks healthy! ✅", hi: "आपकी फसल स्वस्थ है! ✅" },
  diseaseMsg: { en: "Disease detected — take action ⚠️", hi: "बीमारी पाई गई — कार्रवाई करें ⚠️" },
  downloadReport: { en: "Download Report", hi: "रिपोर्ट डाउनलोड करें" },
  readyForAnalysis: { en: "Ready for analysis", hi: "विश्लेषण के लिए तैयार" },

  // Features
  diseaseDetection: { en: "Disease Detection", hi: "बीमारी पहचान" },
  growthStage: { en: "Growth Stage", hi: "विकास चरण" },
  nutrientAnalysis: { en: "Nutrient Analysis", hi: "पोषक तत्व विश्लेषण" },
  pestIdentification: { en: "Pest Identification", hi: "कीट पहचान" },

  // Contact
  contactUs: { en: "Get in Touch", hi: "संपर्क करें" },
  contactSubtitle: {
    en: "Ready to transform your farm? Reach out to our team.",
    hi: "अपने खेत को बदलने के लिए तैयार हैं? हमारी टीम से संपर्क करें।",
  },

  // Drip Irrigation / AI Scan
  kisaanVisionAIScan: { en: "Kisaan Vision AI Scan", hi: "किसान विज़न AI स्कैन" },
  realtimePathogen: { en: "Real-time Pathogen Detection", hi: "रियल-टाइम रोगाणु पहचान" },
  accuracyRate: { en: "Accuracy Rate", hi: "सटीकता दर" },
  cropCategories: { en: "Crop Categories", hi: "फसल श्रेणियाँ" },
  inferenceTime: { en: "Inference Time", hi: "विश्लेषण समय" },

  // Auth
  login: { en: "Login", hi: "लॉगिन" },
  signup: { en: "Sign Up", hi: "साइन अप" },
  email: { en: "Email", hi: "ईमेल" },
  password: { en: "Password", hi: "पासवर्ड" },
  fullName: { en: "Full Name", hi: "पूरा नाम" },
  forgotPassword: { en: "Forgot password?", hi: "पासवर्ड भूल गए?" },
  noAccount: { en: "Don't have an account?", hi: "खाता नहीं है?" },
  haveAccount: { en: "Already have an account?", hi: "पहले से खाता है?" },
  continueWithGoogle: { en: "Continue with Google", hi: "Google से जारी रखें" },
  continueWithApple: { en: "Continue with Apple", hi: "Apple से जारी रखें" },

  // Language
  language: { en: "हिंदी", hi: "English" },
};

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  toggleLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>("en");

  const toggleLang = () => setLang((prev) => (prev === "en" ? "hi" : "en"));

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
