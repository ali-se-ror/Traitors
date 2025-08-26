import { useEffect } from "react";
import { motion } from "framer-motion";
import { Skull, Ghost, Eye, Moon, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const SPOOKY_MESSAGES = [
  "The shadows remember you... until next time.",
  "Your secrets remain safe in the darkness...",
  "The game awaits your return, traitor.",
  "Your presence lingers in the castle halls...",
  "The whispers will echo your name...",
  "May the darkness embrace you until we meet again.",
  "Your betrayals are not forgotten...",
  "The night keeps your secrets safe.",
  "Until the shadows call you back...",
  "The game never truly ends..."
];

export default function Logout() {
  const randomMessage = SPOOKY_MESSAGES[Math.floor(Math.random() * SPOOKY_MESSAGES.length)];

  useEffect(() => {
    // Add some spooky atmosphere sound effect or animation trigger here if needed
    document.title = "Farewell, Traitor...";
    return () => {
      document.title = "The Traitors";
    };
  }, []);

  return (
    <div className="min-h-screen atmospheric-bg relative overflow-hidden">
      {/* Floating Particles Background */}
      <div className="floating-particles">
        <div className="particle w-3 h-3 animate-float" style={{ left: "10%", animationDelay: "0s", animationDuration: "8s" }}></div>
        <div className="particle w-2 h-2 animate-float" style={{ left: "20%", top: "20%", animationDelay: "2s", animationDuration: "12s" }}></div>
        <div className="particle w-4 h-4 animate-float" style={{ left: "30%", top: "60%", animationDelay: "1s", animationDuration: "10s" }}></div>
        <div className="particle w-2 h-2 animate-float" style={{ left: "70%", top: "30%", animationDelay: "3s", animationDuration: "14s" }}></div>
        <div className="particle w-1 h-1 animate-float" style={{ left: "80%", top: "70%", animationDelay: "4s", animationDuration: "9s" }}></div>
        <div className="particle w-3 h-3 animate-float" style={{ left: "90%", top: "10%", animationDelay: "5s", animationDuration: "11s" }}></div>
      </div>

      {/* Eerie Background Effects */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/10 to-transparent"
        animate={{
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Main Icon */}
          <motion.div
            className="mb-8"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Skull className="w-24 h-24 text-red-400 mx-auto drop-shadow-2xl" />
          </motion.div>

          {/* Farewell Message */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-serif text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 via-amber-300 to-red-400 bg-clip-text text-transparent"
          >
            Farewell, Traitor
          </motion.h1>

          {/* Random Spooky Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-8"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent blur-sm"
                animate={{
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <p className="relative text-xl md:text-2xl text-amber-200 font-medium leading-relaxed">
                {randomMessage}
              </p>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex items-center justify-center space-x-8 mb-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Eye className="w-6 h-6 text-purple-400" />
            </motion.div>
            <Ghost className="w-8 h-8 text-slate-300 animate-pulse" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Moon className="w-6 h-6 text-blue-300" />
            </motion.div>
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="w-6 h-6 text-amber-400" />
            </motion.div>
          </motion.div>

          {/* Return Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <Link href="/auth">
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(239, 68, 68, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="btn-primary px-8 py-4 font-bold text-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border border-red-500/50 shadow-lg shadow-red-900/50"
                  data-testid="button-return-to-shadows"
                >
                  <Ghost className="mr-2 h-5 w-5" />
                  Return to the Shadows
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Atmospheric Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-8 text-slate-400 text-sm italic"
          >
            "In the end, we are all traitors to someone..."
          </motion.p>
        </motion.div>
      </div>

      {/* Subtle Background Animation */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}