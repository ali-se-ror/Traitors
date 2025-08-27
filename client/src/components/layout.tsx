import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Skull, Home, BarChart3, User, LogOut, Menu, Vote } from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/voting", label: "Vote", icon: Vote },
    { href: "/suspicion", label: "Suspicion Meter", icon: BarChart3 },
    { href: "/profile", label: "My Profile", icon: User },
  ];

  return (
    <div className="min-h-screen atmospheric-bg">
      {/* Floating Particles Background */}
      <div className="floating-particles">
        <div className="particle w-2 h-2 animate-float" style={{ left: "10%", animationDelay: "0s", animationDuration: "6s" }}></div>
        <div className="particle w-1 h-1 animate-float" style={{ left: "20%", top: "20%", animationDelay: "2s", animationDuration: "8s" }}></div>
        <div className="particle w-3 h-3 animate-float" style={{ left: "30%", top: "60%", animationDelay: "1s", animationDuration: "7s" }}></div>
        <div className="particle w-2 h-2 animate-float" style={{ left: "70%", top: "30%", animationDelay: "3s", animationDuration: "9s" }}></div>
        <div className="particle w-1 h-1 animate-float" style={{ left: "80%", top: "70%", animationDelay: "4s", animationDuration: "6s" }}></div>
        <div className="particle w-2 h-2 animate-float" style={{ left: "90%", top: "10%", animationDelay: "5s", animationDuration: "8s" }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Skull className="text-primary text-3xl animate-pulse-ember" />
            <Link href="/dashboard">
              <h1 className="text-xl md:text-2xl font-bold neon-gradient-title cursor-pointer hover:scale-105 transition-transform">
                The Traitors: A Game of Shadows
              </h1>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div 
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <button 
                    className={`nav-link flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "text-primary bg-primary/10 border border-primary/20" 
                        : "text-foreground hover:text-primary"
                    }`}
                    data-testid={`nav-${item.href.replace('/', '')}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </Link>
              );
            })}
            <Link href="/logout">
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                data-testid="button-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Leave Castle
              </Button>
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-foreground hover:text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 pb-4 border-t border-border/50"
          >
            <div className="flex flex-col space-y-2 pt-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <button 
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                        isActive 
                          ? "text-primary bg-primary/10 border border-primary/20" 
                          : "text-foreground hover:text-primary hover:bg-primary/5"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      data-testid={`nav-mobile-${item.href.replace('/', '')}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </Link>
                );
              })}
              <Link href="/logout">
                <Button
                  variant="ghost"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full justify-start text-destructive hover:text-destructive/80 hover:bg-destructive/10 px-3 py-3"
                  data-testid="button-mobile-logout"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Leave Castle
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-muted-foreground text-sm">
              © 2024 The Traitors: A Game of Shadows. Where trust goes to die.
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Rules</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Support</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy</a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
