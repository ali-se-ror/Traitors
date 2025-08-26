import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { voteSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Target, Vote } from "lucide-react";
import type { PublicUser, VoteData } from "@shared/schema";

interface VotingInterfaceProps {
  players: PublicUser[];
  currentVote: string | null | undefined;
  onVoteSuccess: () => void;
}

export default function VotingInterface({ players, currentVote, onVoteSuccess }: VotingInterfaceProps) {
  const { toast } = useToast();
  
  const form = useForm<VoteData>({
    resolver: zodResolver(voteSchema),
    defaultValues: {
      targetId: currentVote || "",
    },
  });

  const voteMutation = useMutation({
    mutationFn: (data: VoteData) => apiRequest("POST", "/api/vote", data),
    onSuccess: () => {
      toast({
        title: "Vote cast",
        description: "Your vote has been submitted successfully",
      });
      onVoteSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cast vote",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VoteData) => {
    voteMutation.mutate(data);
  };

  const currentTarget = players.find(p => p.id === currentVote);

  return (
    <motion.div 
      className="bg-obsidian/70 rounded-xl p-6 border border-shadow"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="font-semibold text-white mb-4 flex items-center">
        <Target className="text-ember mr-3" />
        Cast Your Suspicion
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="targetId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select 
                      value={field.value || ""} 
                      onValueChange={field.onChange}
                      data-testid="select-vote-target"
                    >
                      <SelectTrigger className="w-full bg-midnight border-shadow text-white focus:border-ember focus:ring-ember/20">
                        <SelectValue placeholder="— Choose your target —" />
                      </SelectTrigger>
                      <SelectContent className="bg-midnight border-shadow">
                        {players.map((player) => (
                          <SelectItem 
                            key={player.id} 
                            value={player.id}
                            className="text-white hover:bg-ember/10 focus:bg-ember/10"
                          >
                            {player.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              type="submit" 
              disabled={voteMutation.isPending || !form.watch("targetId")}
              className="btn-primary px-8 py-3 rounded-lg font-semibold text-midnight whitespace-nowrap"
              data-testid="button-submit-vote"
            >
              {voteMutation.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  ⚡
                </motion.div>
              ) : (
                <Vote className="mr-2 h-4 w-4" />
              )}
              {voteMutation.isPending ? "Casting..." : "Submit Vote"}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
