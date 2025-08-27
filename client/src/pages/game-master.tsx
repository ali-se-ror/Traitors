import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Users, MessageCircle, Eye, BarChart3, Shield, Skull, Swords } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Player {
  id: string;
  username: string;
  createdAt: string;
}

interface Vote {
  voterId: string;
  targetId: string | null;
}

interface VoteCount {
  userId: string;
  username: string;
  voteCount: number;
}

interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  senderProfileImage?: string | null;
  content: string;
  createdAt: string;
}

interface PrivateMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderProfileImage?: string | null;
  receiverId: string;
  receiverUsername: string;
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

export default function GameMaster() {
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    refetchInterval: 5000,
  });

  const { data: voteCounts = [] } = useQuery<VoteCount[]>({
    queryKey: ["/api/vote-counts"],
    refetchInterval: 3000,
  });

  const { data: votes = [] } = useQuery<Vote[]>({
    queryKey: ["/api/votes"],
    refetchInterval: 3000,
  });

  const { data: publicMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages/public"],
    refetchInterval: 2000,
  });

  const { data: privateMessages = [] } = useQuery<PrivateMessage[]>({
    queryKey: ["/api/messages/private/admin/all"],
    refetchInterval: 2000,
  });

  const { data: announcements = [], refetch: refetchAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    refetchInterval: 5000,
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) => apiRequest("POST", "/api/announcements", data),
    onSuccess: () => {
      setAnnouncementTitle("");
      setAnnouncementContent("");
      refetchAnnouncements();
      toast({ title: "Announcement created!", description: "Your proclamation has been broadcast to all players" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create announcement", description: error.message, variant: "destructive" });
    },
  });

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVoteTargetName = (targetId: string | null) => {
    if (!targetId) return "None";
    const target = players.find(p => p.id === targetId);
    return target?.username || "Unknown";
  };

  const getVoterName = (voterId: string) => {
    const voter = players.find(p => p.id === voterId);
    return voter?.username || "Unknown";
  };

  // Calculate statistics
  const totalVotes = votes.filter(v => v.targetId).length;
  const voteParticipation = players.length > 0 ? Math.round((totalVotes / players.length) * 100) : 0;
  const mostSuspicious = voteCounts.length > 0 ? voteCounts[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Game Master Control</h1>
            <Skull className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-purple-200">Welcome, {user?.username}. Rule from the shadows...</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-slate-800/90 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{players.length}</p>
                  <p className="text-xs text-amber-300">Total Players</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{totalVotes}</p>
                  <p className="text-xs text-red-300">Votes Cast</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{voteParticipation}%</p>
                  <p className="text-xs text-purple-300">Participation</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/90 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{publicMessages.length}</p>
                  <p className="text-xs text-green-300">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-600" data-testid="tab-overview">
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="votes" className="data-[state=active]:bg-red-600" data-testid="tab-votes">
              <BarChart3 className="w-4 h-4 mr-2" />
              Voting Data
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-green-600" data-testid="tab-messages">
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-purple-600" data-testid="tab-announcements">
              <Crown className="w-4 h-4 mr-2" />
              Announcements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Players Overview */}
              <Card className="bg-slate-800/90 border-amber-500/30">
                <CardHeader>
                  <CardTitle className="text-amber-400 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Players in the Game
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto" data-testid="players-list">
                    {players.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600/50"
                      >
                        <div>
                          <p className="text-white font-medium">{player.username}</p>
                          <p className="text-slate-400 text-xs">Joined {formatDate(player.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {player.id === user?.id && (
                            <div className="px-2 py-1 bg-amber-600/20 text-amber-300 text-xs rounded">GM</div>
                          )}
                          <div className={`w-2 h-2 rounded-full ${votes.find(v => v.voterId === player.id && v.targetId) ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Game Status */}
              <Card className="bg-slate-800/90 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Swords className="w-5 h-5" />
                    Game Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                      <h3 className="text-purple-300 font-semibold mb-2">Most Suspicious</h3>
                      {mostSuspicious ? (
                        <div>
                          <p className="text-white font-bold text-lg">{mostSuspicious.username}</p>
                          <p className="text-purple-300 text-sm">{mostSuspicious.voteCount} votes against them</p>
                        </div>
                      ) : (
                        <p className="text-slate-400">No votes cast yet</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Voting Progress</span>
                        <span className="text-white">{totalVotes}/{players.length}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-green-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${voteParticipation}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-slate-700/30">
                        <p className="text-2xl font-bold text-white">{publicMessages.length}</p>
                        <p className="text-slate-400 text-xs">Messages</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-700/30">
                        <p className="text-2xl font-bold text-white">{announcements.length}</p>
                        <p className="text-slate-400 text-xs">Announcements</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Voting Data Tab */}
          <TabsContent value="votes" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vote Counts */}
              <Card className="bg-slate-800/90 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Suspicion Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto" data-testid="vote-counts">
                    {voteCounts.length > 0 ? (
                      voteCounts.map((count, index) => (
                        <motion.div
                          key={count.userId}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-red-900/20 border border-red-500/30"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-red-300 font-bold text-lg">#{index + 1}</div>
                            <div>
                              <p className="text-white font-medium">{count.username}</p>
                              <p className="text-red-300 text-sm">{count.voteCount} votes</p>
                            </div>
                          </div>
                          <div className="w-16 bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-red-400 h-2 rounded-full"
                              style={{ width: `${Math.min((count.voteCount / Math.max(1, voteCounts[0]?.voteCount || 1)) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No votes have been cast yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Individual Votes */}
              <Card className="bg-slate-800/90 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Individual Votes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto" data-testid="individual-votes">
                    {votes.map((vote, index) => (
                      <motion.div
                        key={`${vote.voterId}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-2 rounded bg-slate-700/30 text-sm"
                      >
                        <span className="text-orange-300">{getVoterName(vote.voterId)}</span>
                        <span className="text-slate-400">→</span>
                        <span className={`${vote.targetId ? 'text-red-300' : 'text-slate-500'}`}>
                          {getVoteTargetName(vote.targetId)}
                        </span>
                      </motion.div>
                    ))}
                    {votes.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No votes recorded</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Public Messages Monitor */}
              <Card className="bg-slate-800/90 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Public Messages ({publicMessages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto" data-testid="public-messages-monitor">
                    {publicMessages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="p-3 rounded-lg bg-green-900/20 border border-green-500/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-300 font-medium text-sm">{msg.senderUsername}</span>
                          <span className="text-slate-400 text-xs">{formatTime(msg.createdAt)}</span>
                        </div>
                        <p className="text-white text-sm">{msg.content}</p>
                      </motion.div>
                  ))}
                  {publicMessages.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                      <p className="text-slate-400">No public messages yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Private Messages Monitor */}
            <Card className="bg-slate-800/90 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Private Messages ({privateMessages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto" data-testid="private-messages-monitor">
                  {privateMessages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="p-3 rounded-lg bg-red-900/20 border border-red-500/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-red-300 font-medium">{msg.senderUsername}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-red-300 font-medium">{msg.receiverUsername}</span>
                        </div>
                        <span className="text-slate-400 text-xs">{formatTime(msg.createdAt)}</span>
                      </div>
                      <p className="text-white text-sm">{msg.content}</p>
                    </motion.div>
                  ))}
                  {privateMessages.length === 0 && (
                    <div className="text-center py-8">
                      <Eye className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                      <p className="text-slate-400">No private messages yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Announcements List */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/90 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Your Proclamations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto" data-testid="announcements-list">
                      {announcements.map((announcement, index) => (
                        <motion.div
                          key={announcement.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-purple-300 font-semibold text-sm">
                              {announcement.gameMasterUsername}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {formatTime(announcement.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-purple-200 font-bold mb-2">{announcement.title}</h3>
                          <p className="text-white text-sm">{announcement.content}</p>
                        </motion.div>
                      ))}
                      {announcements.length === 0 && (
                        <div className="text-center py-8">
                          <Crown className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                          <p className="text-slate-400">No announcements made yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Create Announcement */}
              <div>
                <Card className="bg-slate-800/90 border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Create Proclamation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      placeholder="Proclamation title..."
                      className="bg-slate-700 border-slate-600 text-white"
                      maxLength={100}
                      data-testid="input-gm-announcement-title"
                    />

                    <Textarea
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      placeholder="Your royal decree to all players..."
                      className="bg-slate-700 border-slate-600 text-white min-h-32"
                      maxLength={1000}
                      data-testid="input-gm-announcement-content"
                    />

                    <Button
                      onClick={() => createAnnouncementMutation.mutate({
                        title: announcementTitle,
                        content: announcementContent
                      })}
                      disabled={!announcementTitle.trim() || !announcementContent.trim() || createAnnouncementMutation.isPending}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-black font-semibold"
                      data-testid="button-create-gm-announcement"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {createAnnouncementMutation.isPending ? "Creating..." : "Issue Decree"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-slate-800/90 border-slate-500/30 mt-4">
                  <CardHeader>
                    <CardTitle className="text-slate-400 text-sm">Quick Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/communications">
                      <Button className="w-full justify-start bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30" size="sm">
                        <MessageCircle className="mr-2 h-3 w-3" />
                        Player Communications
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button className="w-full justify-start bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30" size="sm">
                        <Shield className="mr-2 h-3 w-3" />
                        Main Dashboard
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}