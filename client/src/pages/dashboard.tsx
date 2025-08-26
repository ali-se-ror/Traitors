import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VotingForm } from "@/components/voting-form";
import { PlayerCard } from "@/components/player-card";
import { useAuth } from "@/hooks/use-auth";
import { Users, Activity, Gamepad2, Clock, MessageCircle, User, BarChart3, LogOut, Send, Ghost } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Player {
  id: string;
  username: string;
  createdAt: string;
}

interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  content: string;
  createdAt: string;
}

const SPOOKY_EMOJIS = ["👻", "💀", "🦇", "🕷️", "🔮", "⚡", "🌙", "🗡️"];

export default function Dashboard() {
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: publicMessages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages/public"],
    refetchInterval: 3000,
  });

  const currentVote = authData?.currentVote;
  const activePlayersCount = players.length;
  const votedPlayersCount = currentVote ? 1 : 0; // This would be improved with real vote counting

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => apiClient.post("/api/messages", { content, isPrivate: false }),
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      toast({ title: "Whisper sent!", description: "Your message echoes through the darkness" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send whisper", description: error.message, variant: "destructive" });
    },
  });

  const insertEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (playersLoading) {
    return (
      <div className="min-h-screen atmospheric-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome, <span className="text-primary">{user?.username}</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          The shadows whisper secrets. Choose wisely.
        </p>
      </motion.div>

      {/* Whispers in the Dark - Communication Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="mb-8"
      >
        <Card className="card-medieval">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-semibold text-foreground flex items-center">
              <Ghost className="mr-3 h-6 w-6 text-purple-400" />
              Whispers in the Dark
            </CardTitle>
            <CardDescription>
              Share your thoughts with fellow shadows...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Messages Display */}
              <div className="lg:col-span-2">
                <div className="bg-slate-800/50 rounded-lg p-4 h-48 overflow-y-auto border border-slate-700" data-testid="dashboard-messages">
                  <div className="space-y-3">
                    {publicMessages.slice(-5).map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-2 rounded ${
                          msg.senderId === user?.id 
                            ? 'bg-purple-900/30 ml-4 border-l-2 border-purple-400' 
                            : 'bg-slate-700/50 mr-4'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-purple-300 font-medium text-xs">
                            {msg.senderUsername}
                          </span>
                          <span className="text-slate-400 text-xs">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-white text-sm">{msg.content}</p>
                      </motion.div>
                    ))}
                    {publicMessages.length === 0 && (
                      <div className="text-center text-slate-400 py-8">
                        <Ghost className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">The darkness is silent... be the first to whisper</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Message Panel */}
              <div className="space-y-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Share a dark whisper..."
                  className="bg-slate-700/50 border-slate-600 text-white min-h-16 text-sm"
                  maxLength={200}
                  data-testid="dashboard-message-input"
                />
                
                {/* Quick Spooky Emojis */}
                <div className="grid grid-cols-4 gap-1">
                  {SPOOKY_EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="text-sm hover:bg-purple-900/30 p-1"
                      onClick={() => insertEmoji(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={() => sendMessageMutation.mutate(newMessage)}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm"
                  data-testid="dashboard-send-message"
                >
                  <Send className="w-3 h-3 mr-2" />
                  {sendMessageMutation.isPending ? "Sending..." : "Whisper"}
                </Button>

                <Link href="/communications">
                  <Button variant="outline" className="w-full text-sm border-purple-500/30 text-purple-300 hover:bg-purple-900/20">
                    <MessageCircle className="w-3 h-3 mr-2" />
                    Full Communications
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Voting Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="card-medieval">
              <CardHeader>
                <CardTitle className="font-serif text-2xl font-semibold text-foreground flex items-center">
                  <Activity className="mr-3 h-6 w-6 text-primary" />
                  Cast Your Suspicion
                </CardTitle>
                <CardDescription>
                  The shadows whisper secrets. Choose your target wisely.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VotingForm 
                  players={players.filter(p => p.id !== user?.id)} 
                  currentVote={currentVote}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Players List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="card-medieval">
              <CardHeader>
                <CardTitle className="font-serif text-2xl font-semibold text-foreground flex items-center">
                  <Users className="mr-3 h-6 w-6 text-secondary" />
                  All Players
                </CardTitle>
                <CardDescription>
                  {players.length} souls dwelling in the shadows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4" data-testid="players-grid">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                    >
                      <PlayerCard 
                        player={player} 
                        isCurrentUser={player.id === user?.id}
                        data-testid={`player-card-${player.id}`}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Game Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card className="card-medieval">
              <CardHeader>
                <CardTitle className="font-semibold text-foreground flex items-center">
                  <Gamepad2 className="mr-3 h-5 w-5 text-primary" />
                  Game Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Active Players</span>
                    <span className="text-foreground font-semibold" data-testid="text-active-players">{activePlayersCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Votes Cast</span>
                    <span className="text-primary font-semibold" data-testid="text-votes-cast">{votedPlayersCount}/{activePlayersCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Round</span>
                    <span className="text-secondary font-semibold" data-testid="text-round">#1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="card-medieval">
              <CardHeader>
                <CardTitle className="font-semibold text-foreground flex items-center">
                  <Clock className="mr-3 h-5 w-5 text-secondary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm" data-testid="activity-feed">
                  {currentVote && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse"></div>
                      <div>
                        <p className="text-foreground">You cast a vote for {currentVote.username}</p>
                        <p className="text-muted-foreground text-xs">Just now</p>
                      </div>
                    </motion.div>
                  )}
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                    <div>
                      <p className="text-foreground">Game round started</p>
                      <p className="text-muted-foreground text-xs">Few minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-foreground">Players have joined</p>
                      <p className="text-muted-foreground text-xs">Recently</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Card className="card-medieval">
              <CardHeader>
                <CardTitle className="font-semibold text-foreground flex items-center">
                  <Activity className="mr-3 h-5 w-5 text-emerald-400" />
                  Navigate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/communications">
                  <Button className="w-full justify-start bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30" data-testid="nav-communications">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Communications
                  </Button>
                </Link>
                <Link href="/suspicion">
                  <Button className="w-full justify-start bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30" data-testid="nav-suspicion">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Suspicion Meter
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button className="w-full justify-start bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30" data-testid="nav-profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
                <Link href="/logout">
                  <Button className="w-full justify-start bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 border border-slate-500/30" data-testid="nav-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Leave Castle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
