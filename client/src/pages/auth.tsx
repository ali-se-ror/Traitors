import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema, registerSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Skull, UserPlus, LogIn, Key, VenetianMask, DoorOpen, DoorClosed, Crown } from "lucide-react";
import { Link } from "wouter";

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      codeword: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      codeword: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Welcome back to the shadows",
        description: "You have successfully entered the game.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Entry denied",
        description: error.message || "Invalid credentials. Check your username and code word.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Welcome to the shadows",
        description: "Your identity has been forged. The game begins.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to enter",
        description: error.message || "Could not create your identity. Try a different username.",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen atmospheric-bg relative">
      {/* Floating Particles Background */}
      <div className="floating-particles">
        <div className="particle w-2 h-2 animate-float" style={{ left: "10%", animationDelay: "0s", animationDuration: "6s" }}></div>
        <div className="particle w-1 h-1 animate-float" style={{ left: "20%", top: "20%", animationDelay: "2s", animationDuration: "8s" }}></div>
        <div className="particle w-3 h-3 animate-float" style={{ left: "30%", top: "60%", animationDelay: "1s", animationDuration: "7s" }}></div>
        <div className="particle w-2 h-2 animate-float" style={{ left: "70%", top: "30%", animationDelay: "3s", animationDuration: "9s" }}></div>
        <div className="particle w-1 h-1 animate-float" style={{ left: "80%", top: "70%", animationDelay: "4s", animationDuration: "6s" }}></div>
        <div className="particle w-2 h-2 animate-float" style={{ left: "90%", top: "10%", animationDelay: "5s", animationDuration: "8s" }}></div>
      </div>

      <div className="relative z-10 px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-6 md:mb-12"
          >
            <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-4 md:mb-6">
              <Skull className="text-primary text-2xl md:text-4xl animate-pulse-ember" />
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold neon-gradient-heading">
                The Traitors: A Game of Shadows
              </h1>
            </div>
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6 neon-gradient-accent"
            >
              Enter the Shadows
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-sm md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4"
            >
              In the depths of an ancient castle, whispers of betrayal echo through shadowed halls. 
              Trust no one. Suspect everyone. Let the game of deception begin.
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
            {/* Registration Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Card className={`retro-card border-2 transition-all duration-300 ${!isLogin ? 'border-primary shadow-lg shadow-primary/25' : 'border-border'}`}>
                <CardHeader className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="mx-auto mb-4"
                  >
                    <UserPlus className="text-primary text-4xl animate-glow" />
                  </motion.div>
                  <CardTitle className="text-2xl font-semibold neon-gradient-card">Join the Shadows</CardTitle>
                  <CardDescription className="text-muted-foreground">Create your mysterious identity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-6">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-muted-foreground uppercase tracking-wide">
                              <VenetianMask className="mr-2 h-4 w-4" />
                              Enter Your Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., Sarah, Michael, Alex"
                                className="bg-input border-border focus:border-primary focus:ring-primary/20"
                                data-testid="input-register-username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="codeword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-muted-foreground uppercase tracking-wide">
                              <Key className="mr-2 h-4 w-4" />
                              Secret Code Word
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="One word you'll never forget"
                                className="bg-input border-border focus:border-primary focus:ring-primary/20"
                                data-testid="input-register-codeword"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="submit" 
                          className="btn-primary w-full py-4 font-bold text-lg"
                          disabled={registerMutation.isPending}
                          data-testid="button-register"
                        >
                          {registerMutation.isPending ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Forging Identity...
                            </div>
                          ) : (
                            <>
                              <DoorOpen className="mr-2 h-5 w-5" />
                              Enter the Game
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                  
                  <p className="text-center text-muted-foreground text-sm mt-6">
                    No emails. No verification codes. Just your wit and cunning.
                  </p>
                  
                  <div className="text-center mt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setIsLogin(true)}
                      className="text-secondary hover:text-secondary/80"
                      data-testid="button-switch-to-login"
                    >
                      Already have an identity? Return to shadows
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Login Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Card className={`card-medieval border-2 transition-all duration-300 ${isLogin ? 'border-secondary shadow-lg shadow-secondary/25' : 'border-border'}`}>
                <CardHeader className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="mx-auto mb-4"
                  >
                    <LogIn className="text-secondary text-4xl" />
                  </motion.div>
                  <CardTitle className="text-2xl font-semibold neon-gradient-card">Return to Shadows</CardTitle>
                  <CardDescription className="text-muted-foreground">Welcome back, traitor</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-muted-foreground uppercase tracking-wide">
                              <VenetianMask className="mr-2 h-4 w-4" />
                              Your Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter your name"
                                className="bg-input border-border focus:border-secondary focus:ring-secondary/20"
                                data-testid="input-login-username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="codeword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-muted-foreground uppercase tracking-wide">
                              <Key className="mr-2 h-4 w-4" />
                              Code Word
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="Your secret phrase"
                                className="bg-input border-border focus:border-secondary focus:ring-secondary/20"
                                data-testid="input-login-codeword"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-secondary to-primary py-4 font-bold text-lg hover:scale-105 hover:shadow-lg hover:shadow-secondary/25 transition-all duration-300"
                          disabled={loginMutation.isPending}
                          data-testid="button-login"
                        >
                          {loginMutation.isPending ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Entering...
                            </div>
                          ) : (
                            <>
                              <DoorClosed className="mr-2 h-5 w-5" />
                              Return to Game
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                  
                  <div className="text-center mt-6 p-4 bg-muted/50 rounded-lg border border-border/50">
                    <p className="text-muted-foreground text-sm">
                      <span className="text-destructive mr-2">⚠</span>
                      Forgot your code word? Contact the Game Master for assistance.
                    </p>
                  </div>
                  
                  <div className="text-center mt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setIsLogin(false)}
                      className="text-primary hover:text-primary/80"
                      data-testid="button-switch-to-register"
                    >
                      Need an identity? Join the shadows
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Game Master Access */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-12"
          >
            <div className="max-w-md mx-auto p-6 bg-amber-900/20 border border-amber-500/30 rounded-lg backdrop-blur-sm">
              <Crown className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h3 className="text-amber-400 font-bold mb-2">Game Master Access</h3>
              <p className="text-amber-200/80 text-sm mb-4">
                Monitor and control the game from behind the shadows
              </p>
              <Link to="/gamemaster-auth">
                <Button 
                  variant="outline" 
                  className="border-amber-500/50 text-amber-300 hover:bg-amber-900/30"
                  data-testid="button-gamemaster-access"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Enter as Game Master
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
