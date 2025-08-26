import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Eye, Send, X, Upload, Paperclip, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
// import { ObjectUploader } from "@/components/ObjectUploader";

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
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [selectedConversation, setSelectedConversation] = useState("");
  const [pendingMedia, setPendingMedia] = useState<{ url: string; type: string } | null>(null);

  // Fetch all players
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/users"],
    refetchInterval: 5000,
  });

  // Fetch received private messages
  const { data: receivedPrivateMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages/private/received"],
    refetchInterval: 3000,
    enabled: !!user && !user.isGameMaster,
  });

  // Fetch conversation with selected user
  const { data: conversationMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages/private", selectedConversation],
    refetchInterval: 3000,
    enabled: !!selectedConversation,
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
      queryClient.invalidateQueries({ queryKey: ["/api/messages/private/received"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/private", selectedRecipient] });
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

  // Get unique conversations
  const conversations = Array.from(
    new Set(
      receivedPrivateMessages.map(msg => 
        msg.senderId === user?.id ? msg.receiverId : msg.senderId
      )
    )
  ).map(userId => {
    const player = players.find(p => p.id === userId);
    const lastMessage = receivedPrivateMessages
      .filter(msg => 
        (msg.senderId === userId && msg.receiverId === user?.id) ||
        (msg.senderId === user?.id && msg.receiverId === userId)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    return {
      userId,
      username: player?.username || 'Unknown',
      lastMessage: lastMessage?.content || '',
      lastMessageTime: lastMessage?.createdAt || '',
      unreadCount: receivedPrivateMessages.filter(msg => 
        msg.senderId === userId && msg.receiverId === user?.id
      ).length
    };
  }).filter(conv => conv.userId && conv.username !== 'Unknown');

  // Get available players to message (excluding current user)
  const availablePlayers = players.filter(p => p.id !== user?.id);
  
  // Debug logging
  console.log('Secret Messages Debug:', {
    totalPlayers: players.length,
    availablePlayers: availablePlayers.length,
    currentUserId: user?.id,
    players: players.map(p => ({ id: p.id, username: p.username })),
    selectedConversation
  });

  return (
    <div className="min-h-screen atmospheric-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Secret Messages</h1>
              <p className="text-slate-400">Whisper in the shadows with your fellow players</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Conversations List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <Card className="card-medieval">
              <CardHeader>
                <CardTitle className="text-lg font-serif text-red-300 flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-center text-slate-400 mb-4">
                    <p className="text-xs">Active Conversations</p>
                  </div>
                  {conversations.length > 0 ? (
                    conversations.map((conv) => {
                      // Generate consistent spooky symbol for each player
                      const spookySymbols = ["👻", "💀", "🦇", "🕷️", "🔮", "⚡", "🌙", "🗡️", "🏴‍☠️", "🦹", "🎭", "🔥"];
                      const player = players.find(p => p.id === conv.userId);
                      const symbolIndex = conv.userId.charCodeAt(0) % spookySymbols.length;
                      const playerSymbol = spookySymbols[symbolIndex];
                      
                      return (
                        <Button
                          key={conv.userId}
                          variant={selectedConversation === conv.userId ? "secondary" : "ghost"}
                          className="w-full justify-start text-left p-3 h-auto"
                          onClick={() => setSelectedConversation(conv.userId)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                              {playerSymbol}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm truncate">{conv.username}</span>
                                {conv.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs ml-2">
                                    {conv.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 truncate mt-1">
                                {conv.lastMessage || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </Button>
                      );
                    })
                  ) : (
                    <div className="text-center text-slate-400 py-8">
                      <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No conversations yet</p>
                      <p className="text-xs mt-1">Select a player to start messaging</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Message Thread */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-3"
          >
            <Card className="card-medieval">
              <CardHeader>
                <CardTitle className="text-lg font-serif text-red-300">
                  {selectedConversation 
                    ? `Conversation with ${players.find(p => p.id === selectedConversation)?.username || 'Unknown'}`
                    : 'Select a conversation'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="bg-slate-800/50 rounded-lg p-4 h-96 overflow-y-auto border border-slate-700">
                      <div className="space-y-3">
                        {conversationMessages.map((msg, index) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-3 rounded ${
                              msg.senderId === user?.id 
                                ? 'bg-red-900/20 ml-8 border-l-2 border-red-400' 
                                : 'bg-slate-700/50 mr-8 border border-amber-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-red-300 font-medium text-xs">
                                {msg.senderId === user?.id ? 'You' : msg.senderUsername}
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
                      </div>
                    </div>

                    {/* Send Message */}
                    <div className="space-y-3">
                      <Textarea
                        value={newPrivateMessage}
                        onChange={(e) => setNewPrivateMessage(e.target.value)}
                        placeholder="Send a secret message..."
                        className="bg-slate-700/50 border-slate-600 text-white min-h-16 text-sm"
                        maxLength={200}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPendingMedia({ url: "test.jpg", type: "image/jpeg" })}
                          className="flex-shrink-0"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Media
                        </Button>
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
                ) : (
                  <div className="space-y-6">
                    <div className="text-center text-slate-400 py-8">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Start a Secret Conversation</p>
                      <p className="text-sm">Select a player to begin whispering in the shadows</p>
                      <p className="text-xs mt-2">Found {availablePlayers.length} players available</p>
                    </div>

                    {/* All Players Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availablePlayers.map((player) => {
                        // Generate consistent spooky symbol for each player
                        const spookySymbols = ["👻", "💀", "🦇", "🕷️", "🔮", "⚡", "🌙", "🗡️", "🏴‍☠️", "🦹", "🎭", "🔥"];
                        const symbolIndex = player.id.charCodeAt(0) % spookySymbols.length;
                        const playerSymbol = spookySymbols[symbolIndex];
                        
                        const hasConversation = conversations.some(conv => conv.userId === player.id);
                        const unreadCount = hasConversation 
                          ? conversations.find(conv => conv.userId === player.id)?.unreadCount || 0 
                          : 0;
                        
                        return (
                          <div
                            key={player.id}
                            onClick={() => setSelectedConversation(player.id)}
                            className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
                          >
                            <Card className="card-medieval hover:border-red-400/50 transition-colors">
                              <CardContent className="p-4">
                                <div className="text-center">
                                  <div className="relative">
                                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-2xl border-2 border-slate-600 group-hover:border-red-400/50 transition-colors">
                                      {playerSymbol}
                                    </div>
                                    {unreadCount > 0 && (
                                      <Badge 
                                        variant="destructive" 
                                        className="absolute -top-1 -right-1 text-xs min-w-6 h-6 flex items-center justify-center"
                                      >
                                        {unreadCount}
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="font-semibold text-white mb-1 group-hover:text-red-300 transition-colors">
                                    {player.username}
                                  </h3>
                                  <p className="text-xs text-slate-400">
                                    {hasConversation ? 'Existing conversation' : 'Start new conversation'}
                                  </p>
                                  {hasConversation && (
                                    <div className="mt-2 pt-2 border-t border-slate-700">
                                      <p className="text-xs text-slate-500 truncate">
                                        {conversations.find(conv => conv.userId === player.id)?.lastMessage || 'No messages yet'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        );
                      })}
                    </div>

                    {availablePlayers.length === 0 && (
                      <div className="text-center text-slate-400 py-8">
                        <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No other players found. Wait for more players to join the game.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}