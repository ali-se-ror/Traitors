import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Skull, Zap, Shield, Target, Hourglass, Eye, Crown, Ghost, AlertCircle, Home, Users, MessageSquare, Vote, BarChart3, LogOut, Lock, X, Cloud, Volume2, Moon, Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { resolveProfileImage } from "@/lib/profileImages";

interface FateCard {
  id: string;
  title: string;
  description: string;
  type: 'challenge' | 'advantage' | 'disadvantage';
  icon: React.ReactNode;
  effect: string;
}

const FATE_CARDS: FateCard[] = [
  // Advantage Cards ✨
  {
    id: 'advantage-1',
    title: 'Secret Shield',
    description: 'Divine protection surrounds you',
    type: 'advantage',
    icon: <Shield className="w-8 h-8" />,
    effect: 'You cannot be banished at the next roundtable'
  },
  {
    id: 'advantage-2', 
    title: 'Divine Protection',
    description: 'The spirits guard your life',
    type: 'advantage',
    icon: <Crown className="w-8 h-8" />,
    effect: 'You cannot be murdered tonight'
  },
  {
    id: 'advantage-3',
    title: 'Ghostly Whisper',
    description: 'Secrets drift through the shadows',
    type: 'advantage', 
    icon: <Ghost className="w-8 h-8" />,
    effect: 'The Game Master will secretly slip you a clue about one traitor'
  },
  {
    id: 'advantage-4',
    title: 'Double Vote',
    description: 'Your voice echoes twice',
    type: 'advantage',
    icon: <Eye className="w-8 h-8" />,
    effect: 'Your vote counts twice this round (but you must vote for the same person)'
  },
  {
    id: 'advantage-5',
    title: 'Phantom Ally',
    description: 'Fates intertwine in darkness',
    type: 'advantage',
    icon: <Users className="w-8 h-8" />,
    effect: 'Choose one person; if they are eliminated this round, you survive instead (your fates swap)'
  },
  {
    id: 'advantage-6',
    title: 'Eternal Life',
    description: 'Death is not the end',
    type: 'advantage',
    icon: <Skull className="w-8 h-8" />,
    effect: 'If you are murdered, you come back as a ghost and get one more round to vote before fully eliminated'
  },
  {
    id: 'advantage-7',
    title: 'Resurrection',
    description: 'Rise from the ashes',
    type: 'advantage',
    icon: <Crown className="w-8 h-8" />,
    effect: 'If banished, you survive but cannot vote ever again'
  },
  {
    id: 'advantage-8',
    title: 'Blood Moon',
    description: 'The crimson night protects all',
    type: 'advantage',
    icon: <Moon className="w-8 h-8" />,
    effect: 'If you pull this card, the traitors are not allowed to murder anyone tonight'
  },
  {
    id: 'advantage-9',
    title: 'The Curse of Reverse',
    description: 'Death turns upon itself',
    type: 'advantage',
    icon: <Zap className="w-8 h-8" />,
    effect: 'If you are murdered in the next round, the traitor who killed you dies instead'
  },
  {
    id: 'advantage-10',
    title: 'The Ghost Arises',
    description: 'Command over life and death',
    type: 'advantage',
    icon: <Ghost className="w-8 h-8" />,
    effect: 'At any point in the game, you may bring one murdered or eliminated player back from the dead'
  },
  {
    id: 'advantage-11',
    title: 'Traitor for a Night',
    description: 'Darkness consumes the faithful',
    type: 'advantage',
    icon: <Skull className="w-8 h-8" />,
    effect: 'Even if you are Faithful, you may murder one player at any point in the game'
  },

  // Disadvantage Cards 💀
  {
    id: 'disadvantage-1',
    title: 'Tongue-Tied',
    description: 'Words fail you in darkness',
    type: 'disadvantage',
    icon: <Lock className="w-8 h-8" />,
    effect: 'You cannot speak during the next roundtable (only vote silently)'
  },
  {
    id: 'disadvantage-2',
    title: 'No Vote for You',
    description: 'Your voice is silenced',
    type: 'disadvantage',
    icon: <X className="w-8 h-8" />,
    effect: 'You cannot vote this round'
  },
  {
    id: 'disadvantage-3',
    title: 'Cursed Mark',
    description: 'All eyes turn to you',
    type: 'disadvantage',
    icon: <Target className="w-8 h-8" />,
    effect: 'Announce publicly that you have drawn this card; your name must be written on at least one ballot this round'
  },
  {
    id: 'disadvantage-4',
    title: 'Restless Spirit',
    description: 'The dead demand your confession',
    type: 'disadvantage',
    icon: <Ghost className="w-8 h-8" />,
    effect: 'You must stand up and reveal your suspicion out loud before voting'
  },
  {
    id: 'disadvantage-5',
    title: 'Bad Omen',
    description: 'Darkness clouds your judgment',
    type: 'disadvantage',
    icon: <Cloud className="w-8 h-8" />,
    effect: 'You must cast your vote first this round'
  },
  {
    id: 'disadvantage-6',
    title: 'Ghastly Burden',
    description: 'The weight of shadows',
    type: 'disadvantage',
    icon: <Hourglass className="w-8 h-8" />,
    effect: 'You automatically lose your vote next round'
  },
  {
    id: 'disadvantage-7',
    title: 'Gravedigger\'s Debt',
    description: 'Bound by unholy oath',
    type: 'disadvantage',
    icon: <Users className="w-8 h-8" />,
    effect: 'You owe loyalty to the next person who speaks to you; you must vote the same as them this round'
  },
  {
    id: 'disadvantage-8',
    title: 'Haunted Silence',
    description: 'Ghosts steal your defense',
    type: 'disadvantage',
    icon: <Lock className="w-8 h-8" />,
    effect: 'You may not defend yourself if accused at the next roundtable'
  },
  {
    id: 'disadvantage-9',
    title: 'Cursed Treasure',
    description: 'Safety comes at a price',
    type: 'disadvantage',
    icon: <Shield className="w-8 h-8" />,
    effect: 'You are safe for 2 rounds but cannot vote during them'
  },
  {
    id: 'disadvantage-10',
    title: 'Scare',
    description: 'Terror must be shared',
    type: 'disadvantage',
    icon: <Zap className="w-8 h-8" />,
    effect: 'You must capture a jump scare on another player this week and share it with the group. If successful, you gain an extra vote; if not, you cannot vote next round'
  },

  // Chaotic / Funny Cards 🎭
  {
    id: 'chaotic-1',
    title: 'Bat Wings',
    description: 'Embrace your inner creature',
    type: 'challenge',
    icon: <Ghost className="w-8 h-8" />,
    effect: 'After you vote, you must leave the roundtable doing your best bat impression (no explanation). If you don\'t, your vote is void'
  },
  {
    id: 'chaotic-2',
    title: 'Haunted Megaphone',
    description: 'The spirits amplify your voice',
    type: 'challenge',
    icon: <Volume2 className="w-8 h-8" />,
    effect: 'You must shout all your arguments in the next roundtable. But you cannot be murdered that night because "the ghosts find you entertaining"'
  },
  {
    id: 'chaotic-3',
    title: 'Pumpkin King/Queen',
    description: 'Crown yourself in orange',
    type: 'challenge',
    icon: <Crown className="w-8 h-8" />,
    effect: 'Wear something orange (or put something orange on you). As long as it stays on, you cannot be eliminated. Do not share this with others'
  },
  {
    id: 'chaotic-4',
    title: 'Silent Movie Star',
    description: 'Words are forbidden',
    type: 'challenge',
    icon: <Users className="w-8 h-8" />,
    effect: 'You must communicate only through exaggerated gestures during the next roundtable. No explanation allowed'
  },
  {
    id: 'chaotic-5',
    title: 'Cackle of Doom',
    description: 'Madness overtakes you',
    type: 'challenge',
    icon: <Skull className="w-8 h-8" />,
    effect: 'You must laugh maniacally every time someone says the word "traitor." (If you forget, you lose your vote.)'
  },
  {
    id: 'chaotic-6',
    title: 'Possessed Puppet',
    description: 'Another controls your strings',
    type: 'challenge',
    icon: <Users className="w-8 h-8" />,
    effect: 'Another player of your choice gets to control your vote this round'
  },
  {
    id: 'chaotic-7',
    title: 'The Itchy Twitch',
    description: 'Cursed with supernatural affliction',
    type: 'challenge',
    icon: <Zap className="w-8 h-8" />,
    effect: 'At the roundtable, you must scratch and twitch every time someone says "traitor." If you forget, you lose your vote'
  },
  {
    id: 'chaotic-8',
    title: 'Dead Weight',
    description: 'Burden of the grave',
    type: 'challenge',
    icon: <Hourglass className="w-8 h-8" />,
    effect: 'You must carry a big heavy object (pumpkin, rock, random prop) during the next in-person event'
  },
  {
    id: 'chaotic-9',
    title: 'No Eye Contact',
    description: 'The gaze of guilt',
    type: 'challenge',
    icon: <Eye className="w-8 h-8" />,
    effect: 'You cannot look anyone in the eyes during the next roundtable. No explanation allowed'
  },
  {
    id: 'chaotic-10',
    title: 'Truth Serum',
    description: 'Honesty becomes compulsion',
    type: 'challenge',
    icon: <Shield className="w-8 h-8" />,
    effect: 'You must answer every question at the roundtable honestly (Game Master enforces). Roundabout truths are allowed'
  },
  {
    id: 'chaotic-11',
    title: 'Monster Mash',
    description: 'Become the beast within',
    type: 'challenge',
    icon: <Skull className="w-8 h-8" />,
    effect: 'You must speak in your best monster voice at the next roundtable. No exceptions'
  },
  {
    id: 'chaotic-12',
    title: 'Werewolf Howl',
    description: 'Channel your inner predator',
    type: 'challenge',
    icon: <Moon className="w-8 h-8" />,
    effect: 'You must howl loudly every time someone accuses you. If you do it well enough, you gain protection from murder and elimination that night'
  },
  {
    id: 'chaotic-13',
    title: 'Phantom Flatulence',
    description: 'Blame the supernatural',
    type: 'challenge',
    icon: <Ghost className="w-8 h-8" />,
    effect: 'You must blame any strange noises on a ghost at the next in-person meeting. If the group laughs, you gain immunity from elimination'
  },
  {
    id: 'chaotic-14',
    title: 'Vampire\'s Kiss',
    description: 'Bound by blood',
    type: 'challenge',
    icon: <Heart className="w-8 h-8" />,
    effect: 'Pick another player before the next roundtable begins. You\'re "bound" to them — if they\'re eliminated, you go too'
  },
  {
    id: 'chaotic-15',
    title: 'The Skeleton\'s Joke',
    description: 'Humor from beyond the grave',
    type: 'challenge',
    icon: <Skull className="w-8 h-8" />,
    effect: 'Tell a skeleton-themed joke at the roundtable. If no one laughs, you\'re cursed and cannot vote'
  },
  {
    id: 'chaotic-16',
    title: 'Coffin Nap',
    description: 'Embrace temporary death',
    type: 'challenge',
    icon: <Hourglass className="w-8 h-8" />,
    effect: 'Pretend to "die" (lie down, close eyes) for the first half of the discussion. No one can accuse you while you\'re "dead"'
  },
  {
    id: 'chaotic-17',
    title: 'Headless Horseman\'s Gamble',
    description: 'Let fate decide your doom',
    type: 'challenge',
    icon: <Zap className="w-8 h-8" />,
    effect: 'Flip a coin in front of everyone: heads, you\'re immune next round; tails, you\'re automatically on the chopping block'
  }
];

export default function FateCards() {
  const [selectedCard, setSelectedCard] = useState<FateCard | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasDrawnCard, setHasDrawnCard] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [location] = useLocation();

  // Check if user can draw a card
  const { data: drawStatus, isLoading } = useQuery<{
    canDraw: boolean;
    lastDraw?: { drawnAt: string } | null;
  }>({
    queryKey: ["/api/cards/can-draw"],
    refetchOnWindowFocus: false,
  });

  // Card draw mutation
  const drawCardMutation = useMutation({
    mutationFn: async (cardData: { cardId: string; cardTitle: string; cardType: string; cardEffect: string }) => {
      const response = await apiRequest("POST", "/api/cards/draw", cardData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards/can-draw"] });
      toast({
        title: "Card Drawn!",
        description: "Your fate has been sealed... The Game Master has been notified.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cannot Draw Card",
        description: error.message || "You can only draw one card per week",
        variant: "destructive",
      });
      setIsFlipping(false);
      setHasDrawnCard(false);
    },
  });

  const drawCard = () => {
    if (hasDrawnCard || !drawStatus?.canDraw) return;
    
    setIsFlipping(true);
    const randomCard = FATE_CARDS[Math.floor(Math.random() * FATE_CARDS.length)];
    
    setTimeout(() => {
      setSelectedCard(randomCard);
      setHasDrawnCard(true);
      setIsFlipping(false);
      
      // Record the card draw on the backend
      drawCardMutation.mutate({
        cardId: randomCard.id,
        cardTitle: randomCard.title,
        cardType: randomCard.type,
        cardEffect: randomCard.effect,
      });
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
        return '🎭';
      case 'advantage':
        return '✨';
      case 'disadvantage':
        return '💀';
      default:
        return '🎴';
    }
  };

  // Navigation items
  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/suspicion-meter", icon: BarChart3, label: "Suspicion Meter" },
    { href: "/secret-messages", icon: MessageSquare, label: "Secret Messages" },
    { href: "/fate-cards", icon: Skull, label: "Dark Deck" },
  ];

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({ title: "Logout failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen atmospheric-bg">
      {/* Floating Particles Background */}
      <div className="floating-particles">
        <div className="particle w-2 h-2 animate-float" style={{ left: "10%", animationDelay: "0s", animationDuration: "6s" }}></div>
        <div className="particle w-1 h-1 animate-float" style={{ left: "20%", top: "20%", animationDelay: "2s", animationDuration: "8s" }}></div>
        <div className="particle w-3 h-3 animate-float" style={{ left: "30%", top: "60%", animationDelay: "1s", animationDuration: "7s" }}></div>
        <div className="particle w-2 h-2 animate-float" style={{ left: "70%", top: "30%", animationDelay: "3s", animationDuration: "9s" }}></div>
        <div className="particle w-1 h-1 animate-float" style={{ left: "80%", top: "70%", animationDelay: "4s", animationDuration: "6s" }}></div>
        <div className="particle w-2 h-2 animate-float" style={{ left: "90%", top: "10%", animationDelay: "5s", animationDuration: "8s" }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Skull className="text-primary text-3xl animate-pulse-ember" />
            <Link href="/dashboard">
              <h1 className="text-xl md:text-2xl font-bold neon-gradient-title cursor-pointer hover:scale-105 transition-transform">
                The Traitors: A Game of Shadows
              </h1>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div 
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <button 
                    className={`nav-link flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "text-primary bg-primary/10 border border-primary/20" 
                        : "text-foreground hover:text-primary"
                    }`}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </Link>
              );
            })}

            {/* Profile Section */}
            <div className="flex items-center space-x-4 pl-4 border-l border-border/30">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 border-2 border-primary/30">
                  <AvatarImage 
                    src={resolveProfileImage(user?.profileImage || null) || undefined} 
                    alt={`${user?.username}'s avatar`} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                    {user?.symbol || user?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-foreground">{user?.username}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Player</p>
                    {user?.isGameMaster && (
                      <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-300">
                        GM
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-muted-foreground hover:text-destructive transition-colors"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Mobile Navigation */}
          <motion.div 
            className="md:hidden flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Avatar className="w-8 h-8 border border-primary/30">
              <AvatarImage 
                src={resolveProfileImage(user?.profileImage || null) || undefined} 
                alt={`${user?.username}'s avatar`} 
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-xs">
                {user?.symbol || user?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-muted-foreground hover:text-destructive transition-colors"
              data-testid="logout-button-mobile"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 neon-gradient-title">
            THE DARK DECK
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From the shadows emerges a deck of ancient power. Draw wisely - each card will alter your path...
          </p>
          {!isLoading && drawStatus && !drawStatus.canDraw && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg max-w-md mx-auto">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Card Already Drawn</span>
              </div>
              <p className="text-sm text-red-200/80 mt-1">
                {drawStatus.lastDraw 
                  ? `Last drawn: ${new Date(drawStatus.lastDraw.drawnAt).toLocaleDateString()}. You can draw again in one week.`
                  : "You can only draw one card per week."
                }
              </p>
            </div>
          )}
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
                          <h3 className="text-2xl font-bold neon-gradient-title">DARK DECK</h3>
                          <p className="text-purple-300 text-sm">Click to reveal your fate</p>
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
                disabled={isFlipping || !drawStatus?.canDraw || isLoading}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 text-lg disabled:opacity-50"
                data-testid="button-draw-card"
              >
                {isFlipping ? (
                  <>
                    <Hourglass className="w-5 h-5 mr-2 animate-spin" />
                    Revealing...
                  </>
                ) : !drawStatus?.canDraw ? (
                  <>
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Card Already Drawn
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Draw From The Dark Deck
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