import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeCodewordSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { Link } from "wouter";
import { Eye, ArrowLeft, MessageCircle } from "lucide-react";

import { 
  User, 
  Calendar, 
  Shield, 
  Key, 
  BarChart3, 
  Vote, 
  TrendingUp, 

  X
} from "lucide-react";
import { useState } from "react";

type ChangeCodewordForm = z.infer<typeof changeCodewordSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showChangeCodeword, setShowChangeCodeword] = useState(false);

  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const currentVote = (authData as any)?.currentVote;

  const changeCodewordForm = useForm<ChangeCodewordForm>({
    resolver: zodResolver(changeCodewordSchema),
    defaultValues: {
      oldCodeword: "",
      newCodeword: "",
    },
  });

  const changeCodewordMutation = useMutation({
    mutationFn: async (data: ChangeCodewordForm) => {
      const response = await apiRequest("POST", "/api/auth/change-codeword", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Code word updated",
        description: "Your secret code word has been successfully changed.",
      });
      changeCodewordForm.reset();
      setShowChangeCodeword(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update",
        description: error.message || "Could not change your code word. Please try again.",
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
      toast({
        title: "Vote cleared",
        description: "Your vote has been removed from the suspicion meter.",
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

  const onChangeCodeword = (data: ChangeCodewordForm) => {
    changeCodewordMutation.mutate(data);
  };

  const handleClearVote = () => {
    clearVoteMutation.mutate();
  };

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
        <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4 neon-gradient-heading">
          Your Secret Profile
        </h1>
        <p className="text-sm md:text-lg lg:text-xl text-muted-foreground">
          Only you can see these shadows of your identity
        </p>
      </motion.div>
      <div className="flex items-center gap-4 mb-4">
        <Link href="/">
          <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="card-medieval">
              <CardHeader>
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24 border-4 border-primary/50 shadow-lg">
                    <AvatarFallback className="bg-primary/20 text-2xl font-bold text-primary">
                      {user?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="text-profile-username">
                      {user?.username}
                    </h2>
                    <p className="text-muted-foreground mb-1">Master of Shadows</p>
                    <p className="text-sm text-muted-foreground">
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'unknown'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Card className="bg-muted/50 border-border">
                      <CardContent className="p-6">
                        <Label className="flex items-center text-muted-foreground mb-2 uppercase tracking-wide">
                          <User className="mr-2 h-4 w-4" />
                          Name
                        </Label>
                        <p className="text-foreground font-mono text-lg" data-testid="text-alias">
                          {user?.username}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/50 border-border">
                      <CardContent className="p-6">
                        <Label className="flex items-center text-muted-foreground mb-2 uppercase tracking-wide">
                          <Vote className="mr-2 h-4 w-4" />
                          Current Vote
                        </Label>
                        {currentVote ? (
                          <div className="flex items-center justify-between">
                            <p className="text-primary font-semibold" data-testid="text-current-vote">
                              {currentVote.username}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleClearVote}
                              disabled={clearVoteMutation.isPending}
                              className="text-destructive hover:text-destructive/80"
                              data-testid="button-clear-vote"
                            >
                              <X className="mr-1 h-3 w-3" />
                              Clear
                            </Button>
                          </div>
                        ) : (
                          <p className="text-muted-foreground" data-testid="text-no-vote">No vote cast</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-4">
                    <Card className="bg-muted/50 border-border">
                      <CardContent className="p-6">
                        <Label className="flex items-center text-muted-foreground mb-2 uppercase tracking-wide">
                          <Calendar className="mr-2 h-4 w-4" />
                          Joined
                        </Label>
                        <p className="text-foreground" data-testid="text-joined-date">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/50 border-border">
                      <CardContent className="p-6">
                        <Label className="flex items-center text-muted-foreground mb-2 uppercase tracking-wide">
                          <Shield className="mr-2 h-4 w-4" />
                          Security
                        </Label>
                        <Button
                          variant="ghost"
                          onClick={() => setShowChangeCodeword(!showChangeCodeword)}
                          className="text-secondary hover:text-secondary/80 p-0 h-auto font-medium"
                          data-testid="button-change-codeword"
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Change Code Word
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Codeword Form */}
          {showChangeCodeword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="card-medieval border-secondary/50">
                <CardHeader>
                  <CardTitle className="font-serif text-xl font-semibold text-foreground">
                    Change Code Word
                  </CardTitle>
                  <CardDescription>
                    Update your secret authentication phrase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...changeCodewordForm}>
                    <form onSubmit={changeCodewordForm.handleSubmit(onChangeCodeword)} className="space-y-4">
                      <FormField
                        control={changeCodewordForm.control}
                        name="oldCodeword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Code Word</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="bg-input border-border focus:border-secondary"
                                data-testid="input-old-codeword"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={changeCodewordForm.control}
                        name="newCodeword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Code Word</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="bg-input border-border focus:border-secondary"
                                data-testid="input-new-codeword"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex space-x-4">
                        <Button 
                          type="submit" 
                          disabled={changeCodewordMutation.isPending}
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          data-testid="button-update-codeword"
                        >
                          {changeCodewordMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Updating...
                            </>
                          ) : (
                            "Update Code Word"
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowChangeCodeword(false)}
                          data-testid="button-cancel-codeword"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Game Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card className="card-medieval">
              <CardHeader>
                <CardTitle className="font-semibold text-foreground flex items-center">
                  <BarChart3 className="mr-3 h-5 w-5 text-primary" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Games Played</span>
                    <span className="text-foreground font-semibold" data-testid="text-games-played">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Votes Cast</span>
                    <span className="text-primary font-semibold" data-testid="text-votes-cast-total">
                      {currentVote ? 1 : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Suspicion Level</span>
                    <span className="text-emerald-400 font-semibold" data-testid="text-suspicion-level">Low</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Trust Rating</span>
                    <span className="text-secondary font-semibold" data-testid="text-trust-rating">Neutral</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>


        </div>
      </div>
      </div>
    </div>
  );
}
