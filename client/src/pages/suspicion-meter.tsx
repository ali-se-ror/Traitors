import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Eye, ArrowLeft, TrendingUp, Users, Target } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { resolveProfileImage } from "@/lib/profileImages";

interface Player {
  id: string;
  username: string;
  symbol?: string;
  profileImage?: string;
  createdAt: string;
}

interface Vote {
  id: string;
  voterId: string;
  targetId: string;
  createdAt: string;
}

interface SuspicionData {
  playerId: string;
  username: string;
  symbol?: string;
  profileImage?: string;
  voteCount: number;
  percentage: number;
}

export default function SuspicionMeter() {
  const { user } = useAuth();

  // Get all players
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    refetchInterval: 2000,
  });

  // Get all votes
  const { data: votes = [] } = useQuery<Vote[]>({
    queryKey: ["/api/votes"],
    refetchInterval: 2000,
  });

  // Calculate suspicion data
  const suspicionData: SuspicionData[] = players.map(player => {
    const playerVotes = votes.filter(vote => vote.targetId === player.id);
    const voteCount = playerVotes.length;
    const percentage = votes.length > 0 ? (voteCount / votes.length) * 100 : 0;
    
    return {
      playerId: player.id,
      username: player.username,
      symbol: player.symbol,
      profileImage: player.profileImage,
      voteCount,
      percentage
    };
  }).sort((a, b) => b.voteCount - a.voteCount);

  const totalVotes = votes.length;
  const maxVotes = suspicionData[0]?.voteCount || 0;

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="border-red-500 hover:bg-red-500/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold neon-gradient-title">
                Suspicion Meter
              </h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mt-4">
            See who the shadows whisper about most...
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="retro-card border-orange-500/30 bg-gradient-to-br from-orange-900/10 to-red-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center neon-gradient-title">
                <Users className="w-5 h-5 mr-2 text-orange-400" />
                Total Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-300">{players.length}</div>
            </CardContent>
          </Card>
          
          <Card className="retro-card border-red-500/30 bg-gradient-to-br from-red-900/10 to-purple-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center neon-gradient-title">
                <Target className="w-5 h-5 mr-2 text-red-400" />
                Total Votes Cast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-300">{totalVotes}</div>
            </CardContent>
          </Card>
          
          <Card className="retro-card border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-pink-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center neon-gradient-title">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                Most Suspected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-300">
                {suspicionData[0]?.username || "None yet"}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Suspicion Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="retro-card">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center neon-gradient-title">
                <Eye className="mr-3 h-6 w-6 text-orange-400" />
                Suspicion Rankings
              </CardTitle>
              <CardDescription>
                Anonymous voting results - see who the community finds most suspicious
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suspicionData.map((data, index) => (
                  <motion.div
                    key={data.playerId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-orange-500/30 transition-all"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-12 h-12 border-2 border-orange-500/30">
                      <AvatarImage 
                        src={resolveProfileImage(data.profileImage || undefined)} 
                        alt={data.username}
                      />
                      <AvatarFallback className="bg-slate-800 text-orange-300 font-bold text-lg">
                        {data.symbol || data.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white truncate">{data.username}</h3>
                        {data.playerId === user?.id && (
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Suspicion Level</span>
                          <span className="text-orange-300 font-medium">
                            {data.voteCount} vote{data.voteCount !== 1 ? 's' : ''} ({data.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress 
                          value={maxVotes > 0 ? (data.voteCount / maxVotes) * 100 : 0} 
                          className="h-2 bg-slate-800"
                        />
                      </div>
                    </div>

                    {/* Suspicion Badge */}
                    {data.voteCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className={`
                          ${data.voteCount >= maxVotes * 0.7 ? 'bg-red-500/20 text-red-300' : 
                            data.voteCount >= maxVotes * 0.4 ? 'bg-orange-500/20 text-orange-300' : 
                            'bg-yellow-500/20 text-yellow-300'}
                        `}
                      >
                        {data.voteCount >= maxVotes * 0.7 ? 'Highly Suspicious' : 
                         data.voteCount >= maxVotes * 0.4 ? 'Moderately Suspicious' : 
                         'Slightly Suspicious'}
                      </Badge>
                    )}
                  </motion.div>
                ))}

                {suspicionData.length === 0 && (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400 text-lg">No votes cast yet</p>
                    <p className="text-slate-500 text-sm mt-2">
                      Players need to start voting to see suspicion levels
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <Link to="/voting">
            <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold px-8 py-3">
              <Target className="w-5 h-5 mr-2" />
              Cast Your Vote
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}