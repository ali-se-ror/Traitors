import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Users, Vote, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { SuspicionBar } from "@/components/suspicion-bar";

interface Player {
  id: string;
  username: string;
  createdAt: string;
}

interface VoteDetail {
  voterId: string;
  targetId: string | null;
  voterUsername: string;
  targetUsername?: string;
}

interface SuspicionData {
  userId: string;
  username: string;
  voteCount: number;
}

export default function GameMaster() {
  const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: suspicionData = [], isLoading: suspicionLoading } = useQuery<SuspicionData[]>({
    queryKey: ["/api/suspicion"],
    refetchInterval: 5000,
  });

  const { data: votes = [], isLoading: votesLoading } = useQuery<VoteDetail[]>({
    queryKey: ["/api/votes/details"],
  });

  const totalPlayers = players.length;
  const totalVotes = votes.filter(v => v.targetId).length;
  const mostSuspicious = suspicionData[0];

  if (playersLoading || suspicionLoading || votesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white">
            <Crown className="w-12 h-12 mx-auto mb-4 text-amber-400" />
            <div>Loading Game Master Dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-amber-400" />
            <h1 className="text-4xl font-bold text-white">Game Master Dashboard</h1>
            <Crown className="w-10 h-10 text-amber-400" />
          </div>
          <p className="text-amber-200">Complete overview of the social deduction game</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/90 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-amber-200 text-sm">Total Players</p>
                    <p className="text-2xl font-bold text-white">{totalPlayers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/90 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Vote className="w-8 h-8 text-red-400" />
                  <div>
                    <p className="text-amber-200 text-sm">Active Votes</p>
                    <p className="text-2xl font-bold text-white">{totalVotes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/90 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Eye className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-amber-200 text-sm">Most Suspicious</p>
                    <p className="text-lg font-bold text-white truncate">
                      {mostSuspicious?.username || "None"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800/90 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-amber-200 text-sm">Participation</p>
                    <p className="text-2xl font-bold text-white">
                      {totalPlayers > 0 ? Math.round((totalVotes / totalPlayers) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Suspicion Levels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-slate-800/90 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  Suspicion Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4" data-testid="suspicion-levels">
                {suspicionData.map((player, index) => {
                  const maxVotes = Math.max(...suspicionData.map(p => p.voteCount));
                  const percentage = maxVotes > 0 ? (player.voteCount / maxVotes) * 100 : 0;
                  
                  return (
                    <div key={player.userId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? "destructive" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <span className="text-white font-medium">{player.username}</span>
                        </div>
                        <span className="text-amber-300 font-bold">
                          {player.voteCount} votes
                        </span>
                      </div>
                      <SuspicionBar 
                        percentage={percentage}
                        delay={index * 0.1}
                      />
                    </div>
                  );
                })}
                {suspicionData.length === 0 && (
                  <p className="text-slate-400 text-center py-8">No votes cast yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Vote Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-slate-800/90 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <Vote className="w-6 h-6" />
                  Vote Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto" data-testid="vote-details">
                  {votes
                    .filter(vote => vote.targetId)
                    .map((vote, index) => (
                    <motion.div
                      key={`${vote.voterId}-${vote.targetId}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-white font-medium">{vote.voterUsername}</span>
                        <span className="text-slate-400">suspects</span>
                        <span className="text-amber-300 font-medium">{vote.targetUsername}</span>
                      </div>
                    </motion.div>
                  ))}
                  {votes.filter(v => v.targetId).length === 0 && (
                    <p className="text-slate-400 text-center py-8">No votes cast yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* All Players */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className="bg-slate-800/90 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center gap-2">
                <Users className="w-6 h-6" />
                All Players ({totalPlayers})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="all-players">
                {players.map((player, index) => {
                  const playerSuspicion = suspicionData.find(s => s.userId === player.id);
                  const playerVote = votes.find(v => v.voterId === player.id);
                  
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                      className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{player.username}</span>
                        <Badge variant="outline" className="text-xs">
                          {playerSuspicion?.voteCount || 0} votes
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-400">
                        Voting for: {playerVote?.targetUsername ? (
                          <span className="text-amber-300">{playerVote.targetUsername}</span>
                        ) : (
                          <span className="text-slate-500">No vote</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Joined: {new Date(player.createdAt).toLocaleString()}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}