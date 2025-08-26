import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Crosshair, X, Vote } from "lucide-react";

interface Player {
  id: string;
  username: string;
}

interface VotingFormProps {
  players: Player[];
  currentVote?: { id: string; username: string } | null;
}

export function VotingForm({ players, currentVote }: VotingFormProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const response = await apiRequest("POST", "/api/vote", { targetId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/suspicion"] });
      toast({
        title: "Vote cast successfully",
        description: `Your suspicion has been directed toward ${data.target.username}.`,
      });
      setSelectedTarget("");
    },
    onError: (error: any) => {
      toast({
        title: "Vote failed",
        description: error.message || "Could not cast your vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const clearVoteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/vote");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/suspicion"] });
      toast({
        title: "Vote cleared",
        description: "Your suspicion has been withdrawn.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to clear vote",
        description: error.message || "Could not clear your vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitVote = () => {
    if (selectedTarget) {
      voteMutation.mutate(selectedTarget);
    }
  };

  const handleClearVote = () => {
    clearVoteMutation.mutate();
  };

  return (
    <div className="bg-muted/70 rounded-xl p-6 border border-border">
      <h3 className="font-semibold text-foreground mb-4 flex items-center">
        <Vote className="text-primary mr-3 h-5 w-5" />
        Cast Your Suspicion
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={selectedTarget} onValueChange={setSelectedTarget}>
            <SelectTrigger 
              className="bg-background border-border focus:border-primary focus:ring-primary/20"
              data-testid="select-vote-target"
            >
              <SelectValue placeholder="— Choose your target —" />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem 
                  key={player.id} 
                  value={player.id}
                  data-testid={`option-player-${player.id}`}
                >
                  {player.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleSubmitVote}
            disabled={!selectedTarget || voteMutation.isPending}
            className="btn-primary px-8 py-3 font-semibold whitespace-nowrap"
            data-testid="button-submit-vote"
          >
            {voteMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Casting...
              </div>
            ) : (
              <>
                <Crosshair className="mr-2 h-4 w-4" />
                Submit Vote
              </>
            )}
          </Button>
        </motion.div>
      </div>
      
      {currentVote && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mt-4 pt-4 border-t border-border/50"
        >
          <p className="text-sm text-muted-foreground">
            Current Target: <span className="text-primary font-medium" data-testid="text-current-target">{currentVote.username}</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearVote}
            disabled={clearVoteMutation.isPending}
            className="text-destructive hover:text-destructive/80 text-sm font-medium"
            data-testid="button-clear-vote-form"
          >
            <X className="mr-1 h-3 w-3" />
            Clear Vote
          </Button>
        </motion.div>
      )}
    </div>
  );
}
