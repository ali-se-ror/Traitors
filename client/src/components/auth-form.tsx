import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, loginSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { login, register } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { UserPlus, LogIn, VenetianMask, Key, DoorOpen, DoorClosed, AlertTriangle } from "lucide-react";
import type { LoginData, RegisterData } from "@shared/schema";

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const isRegister = type === "register";
  const schema = isRegister ? registerSchema : loginSchema;
  
  const form = useForm<LoginData | RegisterData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      codeword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: isRegister 
      ? (data: RegisterData) => register(data)
      : (data: LoginData) => login(data),
    onSuccess: (data) => {
      toast({
        title: isRegister ? "Account created" : "Welcome back",
        description: `Welcome ${data.user.username}! Entering the shadows...`,
      });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: isRegister ? "Registration failed" : "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData | RegisterData) => {
    mutation.mutate(data);
  };

  const animationDelay = isRegister ? 0.1 : 0.2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: animationDelay }}
    >
      <Card className="card-medieval rounded-2xl">
        <CardHeader className="text-center">
          <motion.div 
            className="flex justify-center mb-4"
            animate={{ 
              rotate: isRegister ? [0, 5, -5, 0] : [0, -5, 5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {isRegister ? (
              <UserPlus className="text-ember text-4xl animate-glow" />
            ) : (
              <LogIn className="text-gold text-4xl" />
            )}
          </motion.div>
          <CardTitle className="font-serif text-2xl font-semibold text-white">
            {isRegister ? "Join the Shadows" : "Return to Shadows"}
          </CardTitle>
          <CardDescription className="text-mist">
            {isRegister ? "Create your mysterious identity" : "Welcome back, traitor"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-mist uppercase tracking-wide flex items-center">
                      <VenetianMask className="mr-2 h-4 w-4" />
                      {isRegister ? "Choose Your Alias" : "Your Alias"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={isRegister ? "e.g., MoonRaven, ShadowWhisper" : "Enter your chosen name"}
                        className="bg-obsidian border-shadow text-white placeholder-mist focus:border-ember focus:ring-ember/20"
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="codeword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-mist uppercase tracking-wide flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      {isRegister ? "Secret Code Word" : "Code Word"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={isRegister ? "One word you'll never forget" : "Your secret phrase"}
                        className={`bg-obsidian border-shadow text-white placeholder-mist transition-all duration-300 ${
                          isRegister 
                            ? "focus:border-ember focus:ring-ember/20" 
                            : "focus:border-gold focus:ring-gold/20"
                        }`}
                        data-testid="input-codeword"
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
                  disabled={mutation.isPending}
                  className={`w-full py-4 rounded-xl font-bold text-parchment-beige text-lg transition-all duration-300 ${
                    isRegister 
                      ? "btn-primary hover:shadow-lg hover:shadow-purple-500/25" 
                      : "btn-primary hover:shadow-lg hover:shadow-purple-500/25"
                  }`}
                  data-testid={`button-${type}`}
                >
                  {mutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      ⚡
                    </motion.div>
                  ) : isRegister ? (
                    <DoorOpen className="mr-2 h-5 w-5" />
                  ) : (
                    <DoorClosed className="mr-2 h-5 w-5" />
                  )}
                  {mutation.isPending 
                    ? "Processing..." 
                    : isRegister 
                      ? "Enter the Game" 
                      : "Return to Game"
                  }
                </Button>
              </motion.div>
            </form>
          </Form>
          
          {isRegister ? (
            <p className="text-center text-mist text-sm mt-6">
              No emails. No verification codes. Just your wit and cunning.
            </p>
          ) : (
            <div className="text-center mt-6 p-4 bg-obsidian/50 rounded-lg border border-shadow/50">
              <p className="text-mist text-sm flex items-center justify-center">
                <AlertTriangle className="text-ember mr-2 h-4 w-4" />
                Forgot your code word? Contact the Game Master for assistance.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
