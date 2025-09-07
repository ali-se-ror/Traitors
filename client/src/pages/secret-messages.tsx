import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Eye, Send, X, Upload, Paperclip, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { resolveProfileImage } from "@/lib/profileImages";
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
  receiverId?: string;
  receiverUsername?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export default function SecretMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newPrivateMessage, setNewPrivateMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState("");
  const [pendingMedia, setPendingMedia] = useState<{ url: string; type: string } | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Check URL parameters for auto-selecting conversation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation');
    if (conversationId) {
      setSelectedConversation(conversationId);
    }
  }, []);

  // Get notification count for this page
  const { data: notificationData = { count: 0, hasMessages: false } } = useQuery<{ count: number; hasMessages: boolean }>({
    queryKey: ["/api/messages/private/count"],
    refetchInterval: 3000,
    enabled: !!user,
  });

  // Fetch all players
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    refetchInterval: 5000,
  });

  // Fetch conversation with selected user
  const { data: conversationMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages/private", selectedConversation],
    queryFn: async () => {
      const response = await fetch(`/api/messages/private/${selectedConversation}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    refetchInterval: 3000,
    enabled: !!selectedConversation,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [conversationMessages]);

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
      queryClient.invalidateQueries({ queryKey: ["/api/messages/private", selectedConversation] });
      toast({ title: "Secret message sent!", description: "Your whisper reaches its target" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send secret", description: error.message, variant: "destructive" });
    },
  });

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get available players to message (excluding current user)
  const availablePlayers = players.filter(p => p.id !== user?.id);

  return (
    <div className="min-h-screen atmospheric-bg">
      <div className="container mx-auto px-2 lg:px-4 py-4 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 lg:mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white">Secret Messages</h1>
              <p className="text-slate-400 text-sm lg:text-base">Whisper in the shadows with your fellow players</p>
            </div>
          </div>
        </motion.div>

        {/* New Messages Notification */}
        {notificationData.hasMessages && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-800/30 to-purple-800/30 border border-red-500/50 rounded-lg p-4 mb-6 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-red-300 font-medium">
                  📬 You have {notificationData.count} new secret message{notificationData.count > 1 ? 's' : ''}!
                </h3>
                <p className="text-red-400/80 text-sm">Select a conversation below to read and reply to your messages</p>
              </div>
            </div>
          </motion.div>
        )}

        {!selectedConversation ? (
          /* Player Selection */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="card-medieval">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-red-300 text-center flex items-center justify-center">
                  <Eye className="mr-2 h-6 w-6" />
                  Choose a Player to Message Secretly
                </CardTitle>
                <CardDescription className="text-center">
                  Select any player below to start a private conversation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePlayers.map((player) => {
                    // Generate consistent spooky symbol for each player
                    const spookySymbols = ["👻", "💀", "🦇", "🕷️", "🔮", "⚡", "🌙", "🗡️", "🏴‍☠️", "🦹", "🎭", "🔥"];
                    const symbolIndex = player.id.charCodeAt(0) % spookySymbols.length;
                    const playerSymbol = spookySymbols[symbolIndex];
                    
                    return (
                      <div
                        key={player.id}
                        onClick={() => setSelectedConversation(player.id)}
                        className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
                      >
                        <Card className="card-medieval hover:border-red-400/50 transition-colors h-full">
                          <CardContent className="p-6">
                            <div className="text-center">
                              <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-slate-600 group-hover:border-red-400/50 transition-colors">
                                <AvatarImage 
                                  src={resolveProfileImage(player.profileImage || null)} 
                                  alt={`${player.username}'s avatar`} 
                                />
                                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-3xl">
                                  {player.symbol || playerSymbol}
                                </AvatarFallback>
                              </Avatar>
                              <h3 className="font-semibold text-white mb-2 group-hover:text-red-300 transition-colors text-lg">
                                {player.username}
                              </h3>
                              <p className="text-sm text-slate-400">
                                Click to start secret conversation
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
                
                {availablePlayers.length === 0 && (
                  <div className="text-center text-slate-400 py-16">
                    <Eye className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg mb-2">No Other Players Found</p>
                    <p className="text-sm">Wait for more players to join the game to start secret conversations.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Conversation View */
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6 max-w-7xl mx-auto">
            {/* Mobile Header & Back Button */}
            <div className="lg:hidden">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="flex items-center gap-3 mb-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedConversation("")}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                
                {(() => {
                  const targetPlayer = players.find(p => p.id === selectedConversation);
                  const spookySymbols = ["👻", "💀", "🦇", "🕷️", "🔮", "⚡", "🌙", "🗡️", "🏴‍☠️", "🦹", "🎭", "🔥"];
                  const symbolIndex = selectedConversation.charCodeAt(0) % spookySymbols.length;
                  const playerSymbol = spookySymbols[symbolIndex];
                  
                  return (
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-slate-600">
                        <AvatarImage 
                          src={resolveProfileImage(targetPlayer?.profileImage || null)} 
                          alt={`${targetPlayer?.username}'s avatar`} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-sm">
                          {targetPlayer?.symbol || playerSymbol}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-white text-sm">
                          {targetPlayer?.username || 'Unknown'}
                        </h3>
                        <p className="text-xs text-slate-400">Secret Conversation</p>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </div>

            {/* Desktop Sidebar */}
            <motion.div
              // initial={{ opacity: 0, x: -20 }}
              // animate={{ opacity: 1, x: 0 }}
              // transition={{ delay: 0.1, duration: 0.6 }}
              className="hidden lg:block"
            >
              <Card className="card-medieval">
                <CardContent className="p-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedConversation("")}
                    className="w-full mb-4 border-slate-600 hover:bg-slate-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Player List
                  </Button>
                  
                  <div className="text-center">
                    {(() => {
                      const targetPlayer = players.find(p => p.id === selectedConversation);
                      const spookySymbols = ["👻", "💀", "🦇", "🕷️", "🔮", "⚡", "🌙", "🗡️", "🏴‍☠️", "🦹", "🎭", "🔥"];
                      const symbolIndex = selectedConversation.charCodeAt(0) % spookySymbols.length;
                      const playerSymbol = spookySymbols[symbolIndex];
                      
                      return (
                        <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-slate-600">
                          <AvatarImage 
                            src={resolveProfileImage(targetPlayer?.profileImage || null)} 
                            alt={`${targetPlayer?.username}'s avatar`} 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-2xl">
                            {targetPlayer?.symbol || playerSymbol}
                          </AvatarFallback>
                        </Avatar>
                      );
                    })()}
                    <h3 className="font-semibold text-white mb-1">
                      {players.find(p => p.id === selectedConversation)?.username || 'Unknown'}
                    </h3>
                    <p className="text-xs text-slate-400">Secret Conversation</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Message Thread - Mobile Optimized */}
            <motion.div
              // initial={{ opacity: 0, y: 20 }}
              // animate={{ opacity: 1, y: 0 }}
              // transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-3 flex flex-col h-full"
            >
              <Card className="retro-card border-amber-500/30 bg-gradient-to-br from-amber-900/10 to-yellow-900/10">
                <CardHeader className="hidden lg:block">
                  <CardTitle className="text-lg font-serif text-red-300">
                    Conversation with {players.find(p => p.id === selectedConversation)?.username || 'Unknown'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-3 lg:p-6">
                  <div className="flex flex-col h-full space-y-4">
                    {/* Messages Container - Fixed Height with Proper Scrolling */}
                    <div className="flex-1 min-h-0">
                      <div 
                        ref={messagesRef}
                        className="w-full h-60 overflow-y-auto"
                        // style={{ maxHeight: 'calc(100vh - 280px)' }}
                      >
                        {/* <div className="space-y-3"> */}
                          {conversationMessages.map((msg, index) => (
                            <motion.div
                              key={msg.id}
                              // initial={{ opacity: 0, x: -20 }}
                              // animate={{ opacity: 1, x: 0 }}
                              // transition={{ delay: index * 0.05 }}
                              className={`p-3 rounded ${
                                msg.senderId === user?.id 
                                  ? 'bg-red-900/20 ml-4 lg:ml-8 border-l-2 border-red-400' 
                                  : 'bg-slate-700/50 mr-4 lg:mr-8 border border-amber-500/30'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="w-6 h-6 border border-red-400/30">
                                  <AvatarImage 
                                    src={resolveProfileImage(msg.senderProfileImage || null)} 
                                    alt={`${msg.senderUsername}'s avatar`} 
                                  />
                                  <AvatarFallback className="bg-red-800 text-xs">
                                    {msg.senderId === user?.id ? user?.symbol : (players.find(p => p.id === msg.senderId)?.symbol || msg.senderUsername.slice(0, 2).toUpperCase())}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-red-300 font-medium text-xs">
                                  {msg.senderId === user?.id ? 'You' : msg.senderUsername}
                                </span>
                                <span className="text-slate-400 text-xs">
                                  {formatTime(msg.createdAt)}
                                </span>
                              </div>
                              <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                              {msg.mediaUrl && (
                                <div className="mt-2">
                                  {msg.mediaType?.startsWith('image/') ? (
                                    <img 
                                      src={`https://thetraitorsapp.s3.us-west-2.amazonaws.com/${msg.mediaUrl}`} 
                                      alt="Shared media" 
                                      className="rounded border border-slate-600"
                                    />
                                  ) : msg.mediaType?.startsWith('video/') ? (
                                    <video 
                                      src={`https://thetraitorsapp.s3.us-west-2.amazonaws.com/${msg.mediaUrl}`}
                                      controls 
                                      className="rounded border border-slate-600"
                                    />
                                  ) : (
                                    <a 
                                      href={`https://thetraitorsapp.s3.us-west-2.amazonaws.com/${msg.mediaUrl}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-red-400 hover:text-red-300 underline text-sm"
                                    >
                                      <Paperclip className="w-3 h-3 inline mr-1" />
                                      View attachment
                                    </a>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          ))}
                          {conversationMessages.length === 0 && (
                            <div className="text-center text-slate-400 py-8">
                              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Start the conversation...</p>
                            </div>
                          )}
                        {/* </div> */}
                      </div>
                    </div>

                    {/* Send Message - Always at Bottom */}
                    <div className="flex-shrink-0 space-y-3">
                      <Textarea
                        value={newPrivateMessage}
                        onChange={(e) => setNewPrivateMessage(e.target.value)}
                        placeholder="Send a secret message..."
                        className="bg-slate-700/50 border-slate-600 text-white min-h-16 text-sm resize-none"
                        maxLength={200}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <ObjectUploader
                          onUploadComplete={(url, type) => setPendingMedia({ url, type })}
                          className="flex-shrink-0"
                          buttonBG=" "
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
                        <div className="p-2 bg-red-900/20 rounded border border-red-400/30 text-sm text-red-300">
                          <Paperclip className="w-3 h-3 inline mr-1" />
                          Media attached ({pendingMedia.type.split('/')[0]})
                        </div>
                      )}
                      <Button
                        onClick={() => sendPrivateMessageMutation.mutate({ 
                          content: newPrivateMessage, 
                          receiverId: selectedConversation 
                        })}
                        disabled={!newPrivateMessage.trim() || sendPrivateMessageMutation.isPending}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {sendPrivateMessageMutation.isPending ? "Sending..." : "Send Secret"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}