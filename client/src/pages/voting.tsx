import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Skull, Crown, Users, ArrowLeft, Check } from "lucide-react";
import { resolveProfileImage } from "@/lib/profileImages";
// Player type will be inferred from the API response

export default function Voting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [votedFor, setVotedFor] = useState<string | null>(null);

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["/api/players"],
  });

  const voteMutation = useMutation({
    mutationFn: (suspectedId: string) => apiRequest("POST", "/api/votes", { suspectedId }),
    onSuccess: (_, suspectedId) => {
      setVotedFor(suspectedId);
      queryClient.invalidateQueries({ queryKey: ["/api/votes"] });
      toast({ 
        title: "Vote cast!", 
        description: "Your suspicion has been recorded in the shadows...",
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Vote failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleVote = (playerId: string, playerName: string) => {
    if (playerId === user?.id) {
      toast({
        title: "Invalid vote",
        description: "You cannot vote for yourself, traitor!",
        variant: "destructive"
      });
      return;
    }
    
    voteMutation.mutate(playerId);
  };

  if (playersLoading) {
    return (
      <div className="min-h-screen atmospheric-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const otherPlayers = (players as any[]).filter((player: any) => player.id !== user?.id);

  return (
    <div className="min-h-screen atmospheric-bg">
      <div className="container mx-auto px-4 py-6 md:py-8 space-y-4 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-6">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              className="text-slate-400 hover:text-primary mr-4"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Castle
            </Button>
          </Link>
          <Skull className="w-10 h-10 text-red-400 mr-4" />
          <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold neon-gradient-title">
            Cast Your Suspicion
          </h1>
        </div>
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="card-medieval border-red-400/30 bg-gradient-to-br from-red-900/10 to-red-800/10">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4 text-sm text-red-200/80">
                <div className="space-y-2">
                  <p>• Vote anytime for who you think is most suspicious</p>
                  <p>• All votes are completely anonymous</p>
                  <p>• Change your vote as often as you want</p>
                </div>
                <div className="space-y-2">
                  <p>• Check the Suspicion Meter to see current poll results</p>
                  <p>• Voting helps identify potential traitors</p>
                  <p>• Click any player below to cast your vote</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose wisely, for your vote may determine the fate of the castle. Who do you suspect harbors treachery in their heart?
        </p>
      </motion.div>

      {/* Voting Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card className="card-medieval">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-semibold text-foreground flex items-center">
              <Users className="mr-3 h-6 w-6 text-purple-400" />
              Fellow Shadows
            </CardTitle>
            <CardDescription>
              Click on a player to cast your vote of suspicion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {otherPlayers.length === 0 ? (
              <div className="text-center py-12">
                <Crown className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400 text-lg">You are alone in the castle...</p>
                <p className="text-slate-500 text-sm mt-2">Wait for other players to join the game</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {otherPlayers.map((player: any, index: number) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                        votedFor === player.id
                          ? 'border-destructive bg-destructive/20 shadow-lg shadow-destructive/50'
                          : 'border-slate-700 hover:border-primary bg-slate-800/50'
                      }`}
                      onClick={() => handleVote(player.id, player.username)}
                      data-testid={`card-player-${player.id}`}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="relative mb-4">
                          <Avatar className="w-16 h-16 mx-auto border-2 border-slate-600">
                            {player.profileImage && resolveProfileImage(player.profileImage) && (
                              <AvatarImage src={resolveProfileImage(player.profileImage)!} alt={`${player.username}'s avatar`} />
                            )}
                            <AvatarFallback className="bg-slate-800 text-3xl">
                              {player.symbol || player.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {votedFor === player.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 bg-destructive rounded-full p-1"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                        
                        <h3 className="font-serif text-xl font-semibold text-white mb-2">
                          {player.username}
                        </h3>
                        
                        <Badge 
                          variant="secondary" 
                          className="mb-4 bg-slate-700 text-slate-300"
                        >
                          Castle Resident
                        </Badge>
                        
                        <div className="text-sm text-slate-400 mb-4">
                          <p>Joined: {new Date(player.createdAt).toLocaleDateString()}</p>
                        </div>

                        {votedFor === player.id ? (
                          <Button 
                            disabled
                            className="w-full bg-destructive hover:bg-destructive/80 text-white border border-destructive"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Vote Cast
                          </Button>
                        ) : (
                          <Button 
                            variant="outline"
                            disabled={voteMutation.isPending || votedFor !== null}
                            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
                          >
                            <Skull className="w-4 h-4 mr-2" />
                            {voteMutation.isPending ? "Casting..." : "Vote Suspicious"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Voting Status */}
      {votedFor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="card-medieval bg-red-900/20 border-red-500/30">
            <CardContent className="p-6">
              <Check className="w-8 h-8 mx-auto mb-4 text-red-400" />
              <h3 className="font-serif text-xl font-semibold text-red-400 mb-2">
                Suspicion Cast
              </h3>
              <p className="text-slate-300 mb-4">
                Your vote has been recorded in the shadows. The truth will be revealed in due time...
              </p>
              <Link href="/dashboard">
                <Button 
                  className="bg-primary hover:bg-primary/80"
                  data-testid="button-return-to-dashboard"
                >
                  Return to Castle
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </div>
    </div>
  );
}