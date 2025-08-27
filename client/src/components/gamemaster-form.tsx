import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gameMasterSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Crown, Key, Shield } from "lucide-react";
import type { z } from "zod";

type GameMasterData = z.infer<typeof gameMasterSchema>;

export default function GameMasterForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<GameMasterData>({
    resolver: zodResolver(gameMasterSchema),
    defaultValues: {
      username: "",
      codeword: "",
      secretKey: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: GameMasterData) => {
      const response = await apiRequest("POST", "/api/auth/gamemaster", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Game Master Access Granted",
        description: `Welcome Master ${data.user.username}! You now have administrative control.`,
      });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Game Master Registration Failed",
        description: error.message || "Please check your credentials and secret key",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GameMasterData) => {
    mutation.mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="card-medieval rounded-2xl border-primary/50">
        <CardHeader className="text-center">
          <motion.div 
            className="flex justify-center mb-4"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Crown className="w-12 h-12 text-primary drop-shadow-lg" />
          </motion.div>
          <CardTitle className="text-2xl font-bold neon-gradient-title">
            Game Master Registration
          </CardTitle>
          <CardDescription className="text-soft-cream/80">
            Enter your credentials and secret key to gain administrative access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Master Username
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Choose your master identity..."
                        className="input-medieval"
                        data-testid="input-gamemaster-username"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="codeword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Master Codeword
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="password"
                        placeholder="Your secret codeword..."
                        className="input-medieval"
                        data-testid="input-gamemaster-codeword"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secretKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-accent flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Game Master Secret Key
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="password"
                        placeholder="Enter the master key..."
                        className="input-medieval"
                        data-testid="input-gamemaster-secret"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                    <p className="text-xs text-soft-cream/60 mt-1">
                      Hint: The secret key for this demo is "TRAITORS_MASTER_2024"
                    </p>
                  </FormItem>
                )}
              />
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="button-medieval w-full"
                  disabled={mutation.isPending}
                  data-testid="button-gamemaster-register"
                >
                  {mutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Crown className="w-5 h-5 mr-2" />
                    </motion.div>
                  ) : (
                    <Crown className="w-5 h-5 mr-2" />
                  )}
                  Claim Master Status
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}