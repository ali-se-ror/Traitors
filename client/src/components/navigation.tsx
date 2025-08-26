import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Skull, Home, BarChart3, UserCheck, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Navigation() {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => getCurrentUser(),
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate("/");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/suspicion-meter", label: "Suspicion Meter", icon: BarChart3 },
    { href: "/profile", label: "My Profile", icon: UserCheck },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}>
          <motion.a
            className={`nav-link flex items-center space-x-2 text-white hover:text-ember font-medium transition-colors ${
              mobile ? "py-2 px-3 rounded-lg hover:bg-ember/10" : ""
            } ${location === href ? "text-ember" : ""}`}
            data-testid={`nav-${href.substring(1)}`}
            onClick={() => mobile && setMobileOpen(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </motion.a>
        </Link>
      ))}
    </>
  );

  if (!authData) {
    return null;
  }

  return (
    <nav className="relative z-20 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Skull className="text-ember text-2xl" />
          </motion.div>
          <h1 className="font-serif text-2xl font-bold bg-gradient-to-r from-ember to-gold bg-clip-text text-transparent">
            The Traitors: A Game of Shadows
          </h1>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div 
          className="hidden md:flex items-center space-x-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <NavLinks />
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </motion.div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="atmospheric-bg border-shadow">
              <div className="flex flex-col space-y-4 mt-8">
                <NavLinks mobile />
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start"
                  data-testid="button-logout-mobile"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
