import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { PlayerCard } from "@/components/player-card";
import { useAuth } from "@/hooks/use-auth";
import { Users, Activity, Gamepad2, Clock, MessageCircle, User, BarChart3, LogOut, Send, Ghost, Skull, Crown, Eye, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  isPrivate?: boolean;
  receiverId?: string;
  receiverUsername?: string;
}

interface Announcement {
  id: string;
  content: string;
  createdAt: string;
}

const SPOOKY_EMOJIS = ["👻", "💀", "🦇", "🕷️", "🔮", "⚡", "🌙", "🗡️"];

export default function Dashboard() {
  const [newMessage, setNewMessage] = useState("");
  const [newPrivateMessage, setNewPrivateMessage] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [showPrivateNotification, setShowPrivateNotification] = useState(false);
  const [selectedMessageSender, setSelectedMessageSender] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  const { data: receivedPrivateMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages/private/received"],
    refetchInterval: 2000,
  });

  const { data: announcements = [], refetch: refetchAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    refetchInterval: 3000,
  });

  const currentVote = (authData as any)?.user?.currentVote || (authData as any)?.currentVote;
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

  const sendPrivateMessageMutation = useMutation({
    mutationFn: ({ content, receiverId }: { content: string; receiverId: string }) => 
      apiClient.post("/api/messages", { content, isPrivate: true, receiverId }),
    onSuccess: () => {
      setNewPrivateMessage("");
      setSelectedRecipient("");
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages/private/received"] });
      toast({ title: "Secret message sent!", description: "Your whisper reaches its target" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send secret", description: error.message, variant: "destructive" });
    },
  });

  const handleLogout = async () => {
    try {
      // Call logout API
      await apiClient.post("/api/auth/logout", {});
      
      // Clear all cached data
      queryClient.clear();
      
      // Force navigation to logout page
      window.location.href = "/logout";
    } catch (error: any) {
      toast({ title: "Logout failed", description: error.message, variant: "destructive" });
    }
  };

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

  // Handle private message notification logic
  const hasNewPrivateMessages = receivedPrivateMessages.length > 0;
  const latestPrivateMessage = receivedPrivateMessages[0];

  const handleViewPrivateMessage = (senderId: string, senderUsername: string) => {
    setSelectedMessageSender(senderId);
    setShowPrivateNotification(true);
  };

  const handleReplyToMessage = () => {
    if (!selectedMessageSender || !replyMessage.trim()) return;
    
    sendPrivateMessageMutation.mutate({
      content: replyMessage,
      receiverId: selectedMessageSender
    });
  };

  return (
    <div className="space-y-8">
      {/* Private Message Notification - Only show if there are new messages */}
      {hasNewPrivateMessages && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-auto"
        >
          <Card className="bg-red-900/90 border-red-500/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-300 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-red-400" />
                Secret Message Received!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-red-800/30 border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-300 font-medium text-sm">
                      From: {latestPrivateMessage?.senderUsername}
                    </span>
                    <span className="text-red-400 text-xs">
                      {latestPrivateMessage && formatTime(latestPrivateMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-white text-sm">{latestPrivateMessage?.content}</p>
                </div>
                
                {!showPrivateNotification ? (
                  <Button 
                    onClick={() => handleViewPrivateMessage(latestPrivateMessage?.senderId || '', latestPrivateMessage?.senderUsername || '')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    data-testid="button-view-private-message"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View & Reply
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Send your secret reply..."
                      className="bg-slate-800/80 border-red-500/30 text-white resize-none"
                      data-testid="textarea-reply-message"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleReplyToMessage}
                        disabled={sendPrivateMessageMutation.isPending || !replyMessage.trim()}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        data-testid="button-send-reply"
                      >
                        {sendPrivateMessageMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Reply
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowPrivateNotification(false);
                          setSelectedMessageSender("");
                          setReplyMessage("");
                        }}
                        variant="outline"
                        className="border-red-500/50 text-red-300 hover:bg-red-900/20"
                        data-testid="button-dismiss-notification"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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

      {/* Game Master Announcements - Separate Window */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.6 }}
        className="mb-6"
      >
        <Card className="card-medieval border-amber-500/30 bg-gradient-to-br from-amber-900/10 to-yellow-900/10">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-semibold text-amber-300 flex items-center">
              <Crown className="mr-3 h-6 w-6 text-amber-400" />
              Game Master Announcements
              {announcements.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-amber-500/20 text-amber-300">
                  {announcements.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-amber-200/70">
              Official rules, updates, and proclamations from the shadows...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900/50 rounded-lg p-4 h-32 overflow-y-auto border border-amber-500/20">
              <div className="space-y-3">
                {announcements.slice(-5).map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded bg-gradient-to-r from-amber-800/20 to-yellow-800/20 border border-amber-500/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300 font-medium text-xs">
                        Game Master
                      </span>
                      <span className="text-slate-400 text-xs">
                        {formatTime(announcement.createdAt)}
                      </span>
                    </div>
                    <p className="text-amber-100 text-sm font-medium">{announcement.content}</p>
                  </motion.div>
                ))}
                {announcements.length === 0 && (
                  <div className="text-center text-amber-300/50 py-4">
                    <Crown className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Awaiting proclamations from the Game Master...</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
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
            <Tabs defaultValue="public" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                <TabsTrigger value="public" className="text-xs">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Public Board
                </TabsTrigger>
                <TabsTrigger value="private" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Private Messages
                  {receivedPrivateMessages.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {receivedPrivateMessages.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Public Messages Tab */}
              <TabsContent value="public" className="mt-4">
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <div className="bg-slate-800/50 rounded-lg p-4 h-48 overflow-y-auto border border-slate-700">
                      <div className="space-y-3">
                        {publicMessages.slice(-8).map((msg, index) => (
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
                  <div className="space-y-3">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Share a dark whisper..."
                      className="bg-slate-700/50 border-slate-600 text-white min-h-16 text-sm"
                      maxLength={200}
                    />
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
                    >
                      <Send className="w-3 h-3 mr-2" />
                      {sendMessageMutation.isPending ? "Sending..." : "Whisper"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Private Messages Tab */}
              <TabsContent value="private" className="mt-4">
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <div className="bg-slate-800/50 rounded-lg p-4 h-48 overflow-y-auto border border-slate-700">
                      <div className="space-y-3">
                        {receivedPrivateMessages.slice(-8).map((msg: Message, index: number) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-2 rounded ${
                              msg.senderId === user?.id 
                                ? 'bg-red-900/20 ml-4 border-l-2 border-red-400' 
                                : 'bg-slate-700/50 mr-4 border border-amber-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-red-300 font-medium text-xs">
                                {msg.senderId === user?.id ? `To: ${msg.receiverUsername}` : `From: ${msg.senderUsername}`}
                              </span>
                              <span className="text-slate-400 text-xs">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                            <p className="text-white text-sm">{msg.content}</p>
                          </motion.div>
                        ))}
                        {receivedPrivateMessages.length === 0 && (
                          <div className="text-center text-slate-400 py-8">
                            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No secret messages yet...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <select
                      value={selectedRecipient}
                      onChange={(e) => setSelectedRecipient(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white text-sm"
                    >
                      <option value="">Select recipient...</option>
                      {players.filter(p => p.id !== user?.id).map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.username}
                        </option>
                      ))}
                    </select>
                    <Textarea
                      value={newPrivateMessage}
                      onChange={(e) => setNewPrivateMessage(e.target.value)}
                      placeholder="Send a secret message..."
                      className="bg-slate-700/50 border-slate-600 text-white min-h-16 text-sm"
                      maxLength={200}
                      disabled={!selectedRecipient}
                    />
                    <Button
                      onClick={() => sendPrivateMessageMutation.mutate({ 
                        content: newPrivateMessage, 
                        receiverId: selectedRecipient 
                      })}
                      disabled={!newPrivateMessage.trim() || !selectedRecipient || sendPrivateMessageMutation.isPending}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
                    >
                      <Send className="w-3 h-3 mr-2" />
                      {sendPrivateMessageMutation.isPending ? "Sending..." : "Send Secret"}
                    </Button>
                  </div>
                </div>
              </TabsContent>


            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Voting Card - Big Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="card-medieval border-red-500/30 bg-gradient-to-br from-red-900/10 to-red-800/10">
              <CardHeader>
                <CardTitle className="font-serif text-2xl font-semibold text-red-300 flex items-center">
                  <Skull className="mr-3 h-6 w-6 text-red-400" />
                  Cast Your Suspicion
                </CardTitle>
                <CardDescription className="text-red-200/70">
                  The shadows whisper secrets. Choose your target wisely.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/voting">
                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(220, 38, 38, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full h-20 text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border border-red-500/50 shadow-lg shadow-red-900/50"
                      data-testid="button-cast-suspicion"
                    >
                      <Skull className="mr-3 h-8 w-8" />
                      Cast Your Suspicion
                    </Button>
                  </motion.div>
                </Link>
                <p className="text-center text-red-300/60 text-sm mt-4 italic">
                  Click to view all players and cast your vote
                </p>
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
                <Link href="/voting">
                  <Button className="w-full justify-start bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30" data-testid="nav-voting">
                    <Skull className="mr-2 h-4 w-4" />
                    Cast Your Vote
                  </Button>
                </Link>
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
                  <Button 
                    className="w-full justify-start bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 border border-slate-500/30" 
                    data-testid="nav-logout"
                  >
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
