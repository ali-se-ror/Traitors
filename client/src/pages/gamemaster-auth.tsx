import { motion } from "framer-motion";
import { Crown, Skull, ArrowLeft } from "lucide-react";
import GameMasterForm from "@/components/gamemaster-form";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function GameMasterAuth() {
  return (
    <div className="min-h-screen atmospheric-bg relative">
      {/* Floating Particles Background */}
      <div className="floating-particles">
        <div className="particle w-2 h-2 animate-float" style={{ left: "10%", animationDelay: "0s", animationDuration: "6s" }}></div>
        <div className="particle w-1 h-1 animate-float" style={{ left: "20%", top: "20%", animationDelay: "2s", animationDuration: "8s" }}></div>
        <div className="particle w-3 h-3 animate-float" style={{ left: "30%", top: "60%", animationDelay: "1s", animationDuration: "7s" }}></div>
        <div className="particle w-2 h-2 animate-float" style={{ left: "70%", top: "30%", animationDelay: "3s", animationDuration: "9s" }}></div>
        <div className="particle w-1 h-1 animate-float" style={{ left: "80%", top: "70%", animationDelay: "4s", animationDuration: "6s" }}></div>
        <div className="particle w-2 h-2 animate-float" style={{ left: "90%", top: "10%", animationDelay: "5s", animationDuration: "8s" }}></div>
      </div>

      <div className="relative z-10 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/auth">
              <Button 
                variant="ghost" 
                className="text-amber-200 hover:text-amber-100 hover:bg-amber-900/20"
                data-testid="button-back-to-auth"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Player Login
              </Button>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Crown className="text-amber-400 text-4xl animate-pulse-ember" />
              <Skull className="text-primary text-4xl animate-pulse-ember" />
              <Crown className="text-amber-400 text-4xl animate-pulse-ember" />
            </div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-serif text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent"
            >
              Game Master Access
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl text-amber-200/80 max-w-3xl mx-auto leading-relaxed"
            >
              Command the shadows from behind the veil. Monitor all players, observe every vote, 
              and maintain the delicate balance between suspicion and trust.
            </motion.p>
          </motion.div>

          {/* Game Master Form */}
          <div className="max-w-md mx-auto">
            <GameMasterForm />
          </div>

          {/* Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 p-6 bg-slate-800/60 border border-amber-500/30 rounded-lg backdrop-blur-sm"
          >
            <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Game Master Dashboard Features
            </h3>
            <ul className="text-amber-200/70 space-y-2 text-sm">
              <li>• View all player statistics and participation rates</li>
              <li>• Monitor real-time suspicion levels and vote counts</li>
              <li>• See detailed voting patterns and who suspects whom</li>
              <li>• Track player activity and game progression</li>
              <li>• Observe the complete game state without influencing gameplay</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}