import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import SuspicionMeter from "@/pages/suspicion-meter";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import GameMasterAuth from "@/pages/gamemaster-auth";
import GameMaster from "@/pages/game-master";
import Communications from "@/pages/communications";
import Voting from "@/pages/voting";
import Logout from "@/pages/logout";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen atmospheric-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Auth />;
  }
  
  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function GameMasterRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen atmospheric-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }
  
  if (!user) {
    return <GameMasterAuth />;
  }
  
  if (!user.isGameMaster) {
    return <GameMasterAuth />;
  }
  
  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen atmospheric-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    if (user.isGameMaster) {
      window.location.href = "/game-master";
    } else {
      window.location.href = "/dashboard";
    }
    return null;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PublicRoute component={Auth} />} />
      <Route path="/auth" component={() => <PublicRoute component={Auth} />} />
      <Route path="/gamemaster-auth" component={GameMasterAuth} />
      <Route path="/game-master" component={() => <GameMasterRoute component={GameMaster} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/suspicion" component={() => <ProtectedRoute component={SuspicionMeter} />} />
      <Route path="/communications" component={() => <ProtectedRoute component={Communications} />} />
      <Route path="/voting" component={() => <ProtectedRoute component={Voting} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/logout" component={Logout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
