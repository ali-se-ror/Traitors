import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { PlayerCard } from "@/components/player-card";
import { useAuth } from "@/hooks/use-auth";
import { Users, Send, Ghost, Skull, Crown, Eye, X, Upload, Paperclip, Info, Trash2, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ObjectUploader } from "@/components/ObjectUploader";

interface Player {
  id: string;
  username: string;
  symbol?: string;
  profileImage?: string;
  createdAt: string;
}

interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  senderProfileImage?: string | null;
  content: string;
  createdAt: string;
  isPrivate?: boolean;
  receiverId?: string;
  receiverUsername?: string;
  mediaUrl?: string;
  mediaType?: string;
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
  const [pendingMedia, setPendingMedia] = useState<{ url: string; type: string } | null>(null);
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

  // Get inbox data for notifications
  const { data: inboxData = [] } = useQuery<{ senderId: string; senderUsername: string; lastMessage: string; unreadCount: number }[]>({
    queryKey: ["/api/messages/inbox"],
    refetchInterval: 2000,
    enabled: !!user,
  });

  const totalUnreadCount = inboxData.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // Keep original query for backward compatibility
  const { data: receivedPrivateMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages/private/received"],
    refetchInterval: 2000,
    enabled: !!user,
  });

  const { data: announcements = [], refetch: refetchAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    refetchInterval: 3000,
  });

  const currentVote = (authData as any)?.user?.currentVote || (authData as any)?.currentVote;
  const activePlayersCount = players.length;
  const votedPlayersCount = currentVote ? 1 : 0; // This would be improved with real vote counting

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", { 
        content, 
        isPrivate: false,
        mediaUrl: pendingMedia?.url,
        mediaType: pendingMedia?.type,
      });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      setPendingMedia(null);
      queryClient.invalidateQueries({ queryKey: ["/api/messages/public"] });
      toast({ title: "Whisper sent!", description: "Your message echoes through the darkness" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send whisper", description: error.message, variant: "destructive" });
    },
  });

  const sendPrivateMessageMutation = useMutation({
    mutationFn: async ({ content, receiverId }: { content: string; receiverId: string }) => {
      const response = await apiRequest("POST", "/api/messages", { 
        content, 
        isPrivate: true, 
        receiverId,
        mediaUrl: pendingMedia?.url,
        mediaType: pendingMedia?.type,
      });
      return response.json();
    },
    onSuccess: () => {
      setNewPrivateMessage("");
      setPendingMedia(null);
      setSelectedRecipient("");
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages/private/received"] });
      toast({ title: "Secret message sent!", description: "Your whisper reaches its target" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send secret", description: error.message, variant: "destructive" });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      return await apiRequest("DELETE", `/api/announcements/${announcementId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({ title: "Announcement deleted!", description: "The proclamation has been removed from the shadows" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete announcement", description: error.message, variant: "destructive" });
    },
  });

  const handleLogout = async () => {
    try {
      // Call logout API
      await apiRequest("POST", "/api/auth/logout", {});
      
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

  // Simple notification logic using the inbox data
  const hasNewPrivateMessages = totalUnreadCount > 0;

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
      {/* Secret Mailbox Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="mb-6"
      >
        <Card className="retro-card border-red-500/30 bg-gradient-to-br from-red-900/10 to-purple-900/10">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center neon-gradient-title">
              <Ghost className="mr-3 h-6 w-6 text-red-400" />
              Secret Mailbox
              {totalUnreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-red-500/20 text-red-300 animate-pulse">
                  {totalUnreadCount} New
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-red-200/70">
              {totalUnreadCount > 0 
                ? `You have ${totalUnreadCount} secret message${totalUnreadCount > 1 ? 's' : ''} waiting in the shadows...`
                : "Your secret messages will appear here when other players whisper to you..."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalUnreadCount === 0 ? (
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                  <span className="text-slate-400">No secret messages yet</span>
                </div>
                <Link to="/secret-messages">
                  <Button 
                    size="sm"
                    className="bg-slate-600 hover:bg-slate-700 text-white"
                    data-testid="button-check-secret-mailbox"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Send Messages
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {inboxData.slice(0, 3).map((conversation) => (
                  <div key={conversation.senderId} className="p-3 bg-slate-900/50 rounded-lg border border-red-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-red-300 font-medium">{conversation.senderUsername}</span>
                          <Badge variant="secondary" className="bg-red-500/20 text-red-300 text-xs">
                            {conversation.unreadCount} new
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-sm truncate">{conversation.lastMessage}</p>
                      </div>
                      <Link to={`/secret-messages?conversation=${conversation.senderId}`}>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white animate-pulse ml-3"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Read
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {inboxData.length > 3 && (
                  <div className="text-center pt-2">
                    <Link to="/secret-messages">
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                        View all conversations →
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>



      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 neon-gradient-title">
          Welcome, <span className="neon-glow-magenta">{user?.username}</span>
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
        <Card className="retro-card border-amber-500/30 bg-gradient-to-br from-amber-900/10 to-yellow-900/10">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center neon-gradient-title">
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
                    className="p-3 rounded bg-gradient-to-r from-purple-800/20 to-green-800/20 border border-amber-500/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-300 font-medium text-xs">
                          Game Master
                        </span>
                        <span className="text-slate-400 text-xs">
                          {formatTime(announcement.createdAt)}
                        </span>
                      </div>
                      {user?.isGameMaster && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                          onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                          disabled={deleteAnnouncementMutation.isPending}
                          data-testid={`delete-announcement-${announcement.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
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
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-medium text-white">Public Board</div>
              <Link href="/secret-messages">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-red-800/20 border-red-400/50 text-red-300 hover:bg-red-800/40 hover:text-red-200"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Secret Messages
                  {receivedPrivateMessages.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-red-600/80">
                      {receivedPrivateMessages.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>

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
                          <Avatar className="w-6 h-6 border border-purple-400/30">
                            {msg.senderProfileImage && (
                              <AvatarImage src={msg.senderProfileImage} alt={`${msg.senderUsername}'s avatar`} />
                            )}
                            <AvatarFallback className="bg-purple-800 text-xs">
                              {players.find(p => p.id === msg.senderId)?.symbol || msg.senderUsername.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-purple-300 font-medium text-xs">
                            {msg.senderUsername}
                          </span>
                          <span className="text-slate-400 text-xs">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-white text-sm">{msg.content}</p>
                        {msg.mediaUrl && (
                          <div className="mt-2">
                            {msg.mediaType?.startsWith('image/') ? (
                              <img 
                                src={msg.mediaUrl} 
                                alt="Shared media" 
                                className="max-w-xs rounded border border-slate-600"
                              />
                            ) : msg.mediaType?.startsWith('video/') ? (
                              <video 
                                src={msg.mediaUrl} 
                                controls 
                                className="max-w-xs rounded border border-slate-600"
                              />
                            ) : (
                              <a 
                                href={msg.mediaUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 underline text-sm"
                              >
                                <Paperclip className="w-3 h-3 inline mr-1" />
                                View attachment
                              </a>
                            )}
                          </div>
                        )}
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
                <div className="flex gap-2">
                  <ObjectUploader
                    onUploadComplete={(url, type) => setPendingMedia({ url, type })}
                    className="flex-shrink-0"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Media
                  </ObjectUploader>
                  {pendingMedia && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingMedia(null)}
                      className="text-red-400 border-red-400/50 hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {pendingMedia && (
                  <div className="p-2 bg-purple-900/20 rounded border border-purple-400/30 text-sm text-purple-300">
                    <Paperclip className="w-3 h-3 inline mr-1" />
                    Media attached ({pendingMedia.type.split('/')[0]})
                  </div>
                )}
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


          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-8">
          {/* Voting Card - Big Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="card-medieval border-red-500/30 bg-gradient-to-br from-purple-900/10 to-green-800/10">
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
                <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-red-300 mb-3 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Voting Rules
                  </h4>
                  <div className="text-sm text-red-200/80 space-y-1">
                    <p>• Vote anytime for who you think is most suspicious</p>
                    <p>• All votes are completely anonymous</p>
                    <p>• Change your vote as often as you want</p>
                    <p>• Check the Suspicion Meter to see current poll results</p>
                    <p>• Voting helps identify potential traitors</p>
                  </div>
                </div>
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
    </div>
  );
}
