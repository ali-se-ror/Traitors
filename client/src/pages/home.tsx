import { motion } from "framer-motion";
import AuthForm from "@/components/auth-form";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const [, navigate] = useLocation();
  
  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => getCurrentUser(),
    retry: false,
  });

  useEffect(() => {
    if (authData) {
      navigate("/dashboard");
    }
  }, [authData, navigate]);

  if (authData) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 opacity-20 z-0 rounded-2xl overflow-hidden mb-8">
            <img 
              src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600" 
              alt="Medieval castle with mysterious shadows" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10">
            <motion.h2 
              className="font-serif text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-ember via-gold to-ember bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Enter the Shadows
            </motion.h2>
            <motion.p 
              className="text-xl text-mist max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              In the depths of an ancient castle, whispers of betrayal echo through shadowed halls. 
              Trust no one. Suspect everyone. Let the game of deception begin.
            </motion.p>
          </div>
        </motion.div>

        {/* Auth Forms */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <AuthForm type="register" />
          <AuthForm type="login" />
        </div>
      </div>
    </div>
  );
}
