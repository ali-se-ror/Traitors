import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SuspicionBar } from "@/components/suspicion-bar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart3, Info } from "lucide-react";

interface SuspicionData {
  userId: string;
  username: string;
  voteCount: number;
}

export default function SuspicionMeter() {
  const { data: suspicionData = [], isLoading } = useQuery<SuspicionData[]>({
    queryKey: ["/api/suspicion"],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen atmospheric-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const maxVotes = Math.max(...suspicionData.map(d => d.voteCount), 1);
  const totalVotes = suspicionData.reduce((sum, d) => sum + d.voteCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Suspicion Meter
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The scales of justice weigh heavy with doubt. Who among you harbors treachery?
        </p>
      </motion.div>

      {/* Voting Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <Card className="card-medieval border-red-400/30 bg-gradient-to-br from-red-900/10 to-red-800/10">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-semibold text-red-300 flex items-center">
              <Info className="mr-3 h-5 w-5 text-red-400" />
              How Voting Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-red-200/80">
              <div className="space-y-2">
                <p>• Vote anytime for who you think is most suspicious</p>
                <p>• All votes are completely anonymous</p>
                <p>• Change your vote as often as you want</p>
              </div>
              <div className="space-y-2">
                <p>• Results update in real-time on this page</p>
                <p>• Voting helps identify potential traitors</p>
                <p>• Use the "Cast Your Suspicion" button to vote</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Suspicion Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card className="card-medieval">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-semibold text-foreground flex items-center">
              <BarChart3 className="mr-3 h-6 w-6 text-primary" />
              Vote Distribution
            </CardTitle>
            <CardDescription>
              Anonymous votes cast by all players. {totalVotes} total votes recorded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6" data-testid="suspicion-list">
              {suspicionData.map((player, index) => (
                <motion.div
                  key={player.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className={`rounded-xl p-6 border transition-all duration-300 ${
                    player.voteCount > 0
                      ? index === 0 && player.voteCount > 0
                        ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/20"
                        : "bg-muted/50 border-border"
                      : "bg-muted/20 border-border/50"
                  }`}
                  data-testid={`suspicion-item-${player.userId}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className={`w-12 h-12 ${player.voteCount > 0 ? "border-2 border-primary" : "border border-border"}`}>
                        <AvatarFallback className="bg-muted font-medium">
                          {player.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg" data-testid={`text-username-${player.userId}`}>
                          {player.username}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {player.voteCount === 0 
                            ? "Clear of suspicion" 
                            : index === 0 && player.voteCount > 0
                            ? "Most Suspected"
                            : "Under Scrutiny"
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        player.voteCount === 0 
                          ? "text-emerald-400" 
                          : player.voteCount >= maxVotes && maxVotes > 0
                          ? "text-primary"
                          : "text-secondary"
                      }`} data-testid={`text-vote-count-${player.userId}`}>
                        {player.voteCount} vote{player.voteCount !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {totalVotes > 0 ? Math.round((player.voteCount / totalVotes) * 100) : 0}% suspicion
                      </p>
                    </div>
                  </div>
                  
                  <SuspicionBar 
                    percentage={maxVotes > 0 ? (player.voteCount / maxVotes) * 100 : 0}
                    delay={0.2 + (index * 0.1)}
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rules Reminder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Info className="text-primary text-2xl flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Game Rules Reminder</h4>
                <p className="text-muted-foreground text-sm">
                  Votes are anonymous. Only the vote counts are visible to all players. 
                  You may change your vote at any time during the round.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
