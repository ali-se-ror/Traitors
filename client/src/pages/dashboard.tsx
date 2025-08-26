import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VotingForm } from "@/components/voting-form";
import { PlayerCard } from "@/components/player-card";
import { useAuth } from "@/hooks/use-auth";
import { Users, Activity, Gamepad2, Clock } from "lucide-react";

interface Player {
  id: string;
  username: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const currentVote = authData?.currentVote;
  const activePlayersCount = players.length;
  const votedPlayersCount = currentVote ? 1 : 0; // This would be improved with real vote counting

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
        </div>
      </div>
    </div>
  );
}
