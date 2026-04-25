import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Chatbot from "./pages/Chatbot";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import FarmingMethodDetail from "./pages/FarmingMethodDetail";
import Diagnostics from "./pages/Diagnostics";
import Plans from "./pages/Plans";
import Help from "./pages/Help";
import Uploads from "./pages/Uploads";
import AuthCallback from "./integrations/lovable/auth-callback";
import SplashScreen from "./components/SplashScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import { useDevToolsBlocker } from "./hooks/useDevToolsBlocker";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);

  useDevToolsBlocker();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SplashScreen isVisible={showSplash} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/~oauth" element={<AuthCallback />} />
        <Route path="/farming-methods/:slug" element={<FarmingMethodDetail />} />
        <Route path="/diagnostics" element={<Diagnostics />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/help" element={<Help />} />
        <Route path="/uploads" element={<Uploads />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/chatbot"
          element={<ProtectedRoute><Chatbot /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
