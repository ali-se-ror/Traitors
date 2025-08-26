import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Megaphone, Users, Send, Crown, Skull, Ghost } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PublicUser } from "@shared/schema";

const SPOOKY_EMOJIS = ["👻", "💀", "🦇", "🕷️", "🔮", "⚡", "🌙", "🗡️", "🏰", "🕯️", "🖤", "💜", "🩸"];

interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  content: string;
  createdAt: string;
}

interface Announcement {
  id: string;
  gameMasterUsername: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function Communications() {
  const [newMessage, setNewMessage] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [privateMessage, setPrivateMessage] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: players = [] } = useQuery<PublicUser[]>({
    queryKey: ["/api/players"],
  });

  const { data: publicMessages = [], refetch: refetchPublic } = useQuery<Message[]>({
    queryKey: ["/api/messages/public"],
    refetchInterval: 3000,
  });

  const { data: announcements = [], refetch: refetchAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    refetchInterval: 5000,
  });

  const { data: privateMessages = [], refetch: refetchPrivate } = useQuery<Message[]>({
    queryKey: ["/api/messages/private", selectedPlayer],
    enabled: !!selectedPlayer,
    refetchInterval: selectedPlayer ? 3000 : false,
  });

  const sendPublicMutation = useMutation({
    mutationFn: (content: string) => apiClient.post("/api/messages", { content, isPrivate: false }),
    onSuccess: () => {
      setNewMessage("");
      refetchPublic();
      toast({ title: "Message sent!", description: "Your message is now visible to all players" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    },
  });

  const sendPrivateMutation = useMutation({
    mutationFn: (data: { receiverId: string; content: string }) => 
      apiClient.post("/api/messages", { receiverId: data.receiverId, content: data.content, isPrivate: true }),
    onSuccess: () => {
      setPrivateMessage("");
      refetchPrivate();
      toast({ title: "Private message sent!", description: "Your secret message has been delivered" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send private message", description: error.message, variant: "destructive" });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) => apiClient.post("/api/announcements", data),
    onSuccess: () => {
      setAnnouncementTitle("");
      setAnnouncementContent("");
      refetchAnnouncements();
      toast({ title: "Announcement created!", description: "Your announcement is now visible to all players" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create announcement", description: error.message, variant: "destructive" });
    },
  });

  const insertEmoji = (emoji: string, isPrivate = false) => {
    if (isPrivate) {
      setPrivateMessage(prev => prev + emoji);
    } else {
      setNewMessage(prev => prev + emoji);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Shadow Communications</h1>
            <Skull className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-amber-200">Exchange whispers and secrets in the darkness...</p>
        </motion.div>

        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="public" className="data-[state=active]:bg-amber-600" data-testid="tab-public-chat">
              <Users className="w-4 h-4 mr-2" />
              Public Board
            </TabsTrigger>
            <TabsTrigger value="private" className="data-[state=active]:bg-purple-600" data-testid="tab-private-chat">
              <Ghost className="w-4 h-4 mr-2" />
              Private Messages
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-red-600" data-testid="tab-announcements">
              <Megaphone className="w-4 h-4 mr-2" />
              Announcements
            </TabsTrigger>
          </TabsList>

          {/* Public Chat */}
          <TabsContent value="public" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Messages Area */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/90 border-amber-500/30 h-96">
                  <CardHeader>
                    <CardTitle className="text-amber-400 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Public Whispers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full overflow-y-auto" data-testid="public-messages">
                    <div className="space-y-3 pb-20">
                      {publicMessages.map((msg, index) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3 rounded-lg ${
                            msg.senderId === user?.id 
                              ? 'bg-amber-900/30 ml-8 border-l-2 border-amber-400' 
                              : 'bg-slate-700/50 mr-8'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-amber-300 font-medium text-sm">
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
                          <Ghost className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>The shadows are silent... be the first to speak</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Send Message Panel */}
              <div className="space-y-4">
                <Card className="bg-slate-800/90 border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="text-amber-400 text-sm">Cast Your Words</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Whisper into the darkness..."
                      className="bg-slate-700 border-slate-600 text-white min-h-24"
                      maxLength={500}
                      data-testid="input-public-message"
                    />
                    
                    {/* Spooky Emojis */}
                    <div className="grid grid-cols-6 gap-1">
                      {SPOOKY_EMOJIS.slice(0, 12).map((emoji) => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          className="text-lg hover:bg-amber-900/30"
                          onClick={() => insertEmoji(emoji)}
                          data-testid={`emoji-${emoji}`}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>

                    <Button
                      onClick={() => sendPublicMutation.mutate(newMessage)}
                      disabled={!newMessage.trim() || sendPublicMutation.isPending}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold"
                      data-testid="button-send-public"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendPublicMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Private Messages */}
          <TabsContent value="private" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Messages Area */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/90 border-purple-500/30 h-96">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Ghost className="w-5 h-5" />
                      Secret Conversations
                      {selectedPlayer && (
                        <span className="text-sm">with {players.find(p => p.id === selectedPlayer)?.username}</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full overflow-y-auto" data-testid="private-messages">
                    {!selectedPlayer ? (
                      <div className="text-center text-slate-400 py-8">
                        <Ghost className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Select a player to begin secret communications</p>
                      </div>
                    ) : (
                      <div className="space-y-3 pb-20">
                        {privateMessages.map((msg, index) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: msg.senderId === user?.id ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-3 rounded-lg ${
                              msg.senderId === user?.id 
                                ? 'bg-purple-900/30 ml-8 border-l-2 border-purple-400' 
                                : 'bg-slate-700/50 mr-8 border-l-2 border-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-purple-300 font-medium text-sm">
                                {msg.senderUsername}
                              </span>
                              <span className="text-slate-400 text-xs">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                            <p className="text-white text-sm">{msg.content}</p>
                          </motion.div>
                        ))}
                        {privateMessages.length === 0 && (
                          <div className="text-center text-slate-400 py-8">
                            <p>No secrets shared yet...</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Private Message Panel */}
              <div className="space-y-4">
                <Card className="bg-slate-800/90 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-purple-400 text-sm">Secret Whisper</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white" data-testid="select-private-recipient">
                        <SelectValue placeholder="Choose your confidant..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {players
                          .filter(p => p.id !== user?.id)
                          .map((player) => (
                          <SelectItem 
                            key={player.id} 
                            value={player.id}
                            className="text-white hover:bg-purple-900/30"
                          >
                            {player.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Textarea
                      value={privateMessage}
                      onChange={(e) => setPrivateMessage(e.target.value)}
                      placeholder="Share your darkest secrets..."
                      className="bg-slate-700 border-slate-600 text-white min-h-24"
                      maxLength={500}
                      disabled={!selectedPlayer}
                      data-testid="input-private-message"
                    />
                    
                    {/* Spooky Emojis for Private */}
                    <div className="grid grid-cols-6 gap-1">
                      {SPOOKY_EMOJIS.slice(0, 12).map((emoji) => (
                        <Button
                          key={`private-${emoji}`}
                          variant="ghost"
                          size="sm"
                          className="text-lg hover:bg-purple-900/30"
                          onClick={() => insertEmoji(emoji, true)}
                          disabled={!selectedPlayer}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>

                    <Button
                      onClick={() => selectedPlayer && sendPrivateMutation.mutate({ 
                        receiverId: selectedPlayer, 
                        content: privateMessage 
                      })}
                      disabled={!privateMessage.trim() || !selectedPlayer || sendPrivateMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                      data-testid="button-send-private"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendPrivateMutation.isPending ? "Sending..." : "Send Secret"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Announcements */}
          <TabsContent value="announcements" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Announcements Area */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/90 border-red-500/30 min-h-96">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      <Megaphone className="w-5 h-5" />
                      Game Master Proclamations
                    </CardTitle>
                  </CardHeader>
                  <CardContent data-testid="announcements-list">
                    <div className="space-y-4">
                      {announcements.map((announcement, index) => (
                        <motion.div
                          key={announcement.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg bg-red-900/20 border border-red-500/30"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-300 font-semibold text-sm">
                              {announcement.gameMasterUsername}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {formatTime(announcement.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-red-300 font-bold mb-2">{announcement.title}</h3>
                          <p className="text-white">{announcement.content}</p>
                        </motion.div>
                      ))}
                      {announcements.length === 0 && (
                        <div className="text-center text-slate-400 py-8">
                          <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>The Game Master has made no proclamations yet...</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Create Announcement (Game Master Only) */}
              {user?.isGameMaster && (
                <div>
                  <Card className="bg-slate-800/90 border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Make Proclamation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                        placeholder="Announcement title..."
                        className="bg-slate-700 border-slate-600 text-white"
                        maxLength={100}
                        data-testid="input-announcement-title"
                      />

                      <Textarea
                        value={announcementContent}
                        onChange={(e) => setAnnouncementContent(e.target.value)}
                        placeholder="Your proclamation to all players..."
                        className="bg-slate-700 border-slate-600 text-white min-h-32"
                        maxLength={1000}
                        data-testid="input-announcement-content"
                      />

                      <Button
                        onClick={() => createAnnouncementMutation.mutate({
                          title: announcementTitle,
                          content: announcementContent
                        })}
                        disabled={!announcementTitle.trim() || !announcementContent.trim() || createAnnouncementMutation.isPending}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                        data-testid="button-create-announcement"
                      >
                        <Megaphone className="w-4 h-4 mr-2" />
                        {createAnnouncementMutation.isPending ? "Creating..." : "Make Proclamation"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}