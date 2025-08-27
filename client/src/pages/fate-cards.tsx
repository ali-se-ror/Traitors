import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Skull, Zap, Shield, Target, Hourglass, Eye, Crown, Ghost } from "lucide-react";

interface FateCard {
  id: string;
  title: string;
  description: string;
  type: 'challenge' | 'advantage' | 'disadvantage';
  icon: React.ReactNode;
  effect: string;
}

const FATE_CARDS: FateCard[] = [
  // Challenges
  {
    id: 'challenge-1',
    title: 'Trial by Shadows',
    description: 'The darkness tests your resolve',
    type: 'challenge',
    icon: <Skull className="w-8 h-8" />,
    effect: 'You must vote for someone different than your original suspicion this round'
  },
  {
    id: 'challenge-2',
    title: 'Whispered Doubts',
    description: 'Paranoia clouds your judgment',
    type: 'challenge',
    icon: <Ghost className="w-8 h-8" />,
    effect: 'Your next private message must contain exactly 13 words'
  },
  {
    id: 'challenge-3',
    title: 'Cursed Silence',
    description: 'The spirits demand quiet',
    type: 'challenge',
    icon: <Hourglass className="w-8 h-8" />,
    effect: 'You cannot send any public messages for the next 5 minutes'
  },
  // Advantages
  {
    id: 'advantage-1',
    title: 'Mystic Insight',
    description: 'The crystal ball reveals truth',
    type: 'advantage',
    icon: <Eye className="w-8 h-8" />,
    effect: 'You can see who the last person to vote was (ask Game Master privately)'
  },
  {
    id: 'advantage-2',
    title: 'Shadow Cloak',
    description: 'You blend with the darkness',
    type: 'advantage',
    icon: <Shield className="w-8 h-8" />,
    effect: 'Your vote this round is completely anonymous and untraceable'
  },
  {
    id: 'advantage-3',
    title: 'Divine Protection',
    description: 'The spirits favor you',
    type: 'advantage',
    icon: <Crown className="w-8 h-8" />,
    effect: 'Immunity from elimination if you receive the most votes this round'
  },
  // Disadvantages
  {
    id: 'disadvantage-1',
    title: 'Marked by Fear',
    description: 'Others sense your terror',
    type: 'disadvantage',
    icon: <Target className="w-8 h-8" />,
    effect: 'Your username appears in red to all other players for this round'
  },
  {
    id: 'disadvantage-2',
    title: 'Cursed Tongue',
    description: 'Your words betray you',
    type: 'disadvantage',
    icon: <Zap className="w-8 h-8" />,
    effect: 'All your messages this round must end with "...or so the spirits whisper"'
  },
  {
    id: 'disadvantage-3',
    title: 'Phantom Votes',
    description: 'Your influence wanes',
    type: 'disadvantage',
    icon: <Ghost className="w-8 h-8" />,
    effect: 'Your vote counts as 0.5 instead of 1 for this round'
  }
];

export default function FateCards() {
  const [selectedCard, setSelectedCard] = useState<FateCard | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasDrawnCard, setHasDrawnCard] = useState(false);

  const drawCard = () => {
    if (hasDrawnCard) return;
    
    setIsFlipping(true);
    const randomCard = FATE_CARDS[Math.floor(Math.random() * FATE_CARDS.length)];
    
    setTimeout(() => {
      setSelectedCard(randomCard);
      setHasDrawnCard(true);
      setIsFlipping(false);
    }, 800);
  };

  const resetDeck = () => {
    setSelectedCard(null);
    setHasDrawnCard(false);
    setIsFlipping(false);
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case 'challenge':
        return 'from-purple-600 to-purple-800';
      case 'advantage':
        return 'from-green-600 to-green-800';
      case 'disadvantage':
        return 'from-red-600 to-red-800';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'challenge':
        return '🎯';
      case 'advantage':
        return '✨';
      case 'disadvantage':
        return '⚡';
      default:
        return '🎴';
    }
  };

  return (
    <div className="min-h-screen atmospheric-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 neon-gradient-title">
            Pull a Card, Seal your FATE
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The ancient deck holds your destiny. One card will change the course of your game...
          </p>
        </motion.div>

        {/* Card Area */}
        <div className="flex flex-col items-center space-y-8">
          {/* Card Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <AnimatePresence mode="wait">
              {!hasDrawnCard ? (
                // Card Back
                <motion.div
                  key="card-back"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: isFlipping ? 180 : 0 }}
                  exit={{ rotateY: 180, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="cursor-pointer"
                  onClick={drawCard}
                >
                  <Card className="w-80 h-96 retro-card bg-gradient-to-br from-purple-900/80 to-black border-2 border-purple-500/50 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30">
                    <CardContent className="flex flex-col items-center justify-center h-full p-8">
                      <div className="text-center space-y-6">
                        <div className="relative">
                          <Skull className="w-24 h-24 text-purple-400 mx-auto animate-pulse" />
                          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold neon-gradient-title">FATE DECK</h3>
                          <p className="text-purple-300 text-sm">Click to draw your destiny</p>
                        </div>
                        <div className="grid grid-cols-3 gap-1 opacity-30">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className="w-4 h-6 bg-purple-600/50 rounded-sm"></div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                // Revealed Card
                <motion.div
                  key="card-front"
                  initial={{ rotateY: -180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <Card className={`w-80 h-96 retro-card bg-gradient-to-br ${getCardColor(selectedCard?.type || '')} border-2 border-purple-500/50 shadow-lg shadow-purple-500/30`}>
                    <CardContent className="flex flex-col items-center justify-between h-full p-6">
                      <div className="text-center space-y-4">
                        <div className="text-4xl">{getTypeIcon(selectedCard?.type || '')}</div>
                        <h3 className="text-xl font-bold text-white">{selectedCard?.title}</h3>
                        <p className="text-sm text-gray-200 italic">{selectedCard?.description}</p>
                      </div>
                      
                      <div className="text-center space-y-4">
                        <div className="text-white text-6xl opacity-20">
                          {selectedCard?.icon}
                        </div>
                      </div>

                      <div className="text-center space-y-2">
                        <div className="text-xs text-gray-300 uppercase tracking-wider">
                          {selectedCard?.type}
                        </div>
                        <div className="text-sm text-white font-medium bg-black/30 rounded p-2">
                          {selectedCard?.effect}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex gap-4"
          >
            {hasDrawnCard ? (
              <Button
                onClick={resetDeck}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 text-lg"
                data-testid="button-reset-deck"
              >
                <Skull className="w-5 h-5 mr-2" />
                Draw Again
              </Button>
            ) : (
              <Button
                onClick={drawCard}
                disabled={isFlipping}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 text-lg disabled:opacity-50"
                data-testid="button-draw-card"
              >
                {isFlipping ? (
                  <>
                    <Hourglass className="w-5 h-5 mr-2 animate-spin" />
                    Revealing...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Draw Your Fate
                  </>
                )}
              </Button>
            )}
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-center max-w-2xl space-y-4"
          >
            <Card className="retro-card bg-black/40 border-purple-500/30">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold neon-gradient-title mb-3">How It Works</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>🎯 <strong>Challenges:</strong> Special tasks you must complete</p>
                  <p>✨ <strong>Advantages:</strong> Powers that help you in the game</p>
                  <p>⚡ <strong>Disadvantages:</strong> Curses that hinder your progress</p>
                </div>
                <p className="text-xs text-purple-300 mt-4 italic">
                  Your fate is sealed until the next round. Choose wisely when to draw...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}