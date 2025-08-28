import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { InstallPrompt } from "@/components/InstallPrompt";

import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Voting from "@/pages/voting";
import Profile from "@/pages/profile";
import GameMaster from "@/pages/game-master";
import GameMasterAuth from "@/pages/gamemaster-auth";
import SecretMessages from "@/pages/secret-messages";
import SuspicionMeter from "@/pages/suspicion-meter";
import FateCards from "@/pages/fate-cards";
import InstallPage from "@/pages/install";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`${response.status}: ${error}`);
        }
        return response.json();
      },
    },
  },
});

function Router() {
  const { user, isLoading } = useAuth();

  // Check if app is installed (running in standalone mode)
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center atmospheric-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-red-300 text-lg">Entering the shadows...</p>
        </div>
      </div>
    );
  }

  // Show install page if not installed and not authenticated (unless explicitly navigated to other routes)
  if (!isInstalled && !user) {
    return (
      <Switch>
        <Route path="/install" component={InstallPage} />
        <Route path="/gamemaster-auth" component={GameMasterAuth} />
        <Route path="/auth" component={Auth} />
        <Route component={InstallPage} />
      </Switch>
    );
  }

  // If not authenticated but app is installed, show auth
  if (!user) {
    return (
      <Switch>
        <Route path="/install" component={InstallPage} />
        <Route path="/gamemaster-auth" component={GameMasterAuth} />
        <Route component={Auth} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/install" component={InstallPage} />
      <Route path="/voting" component={Voting} />
      <Route path="/profile" component={Profile} />
      <Route path="/game-master" component={GameMaster} />
      <Route path="/secret-messages" component={SecretMessages} />
      <Route path="/suspicion-meter" component={SuspicionMeter} />
      <Route path="/fate-cards" component={FateCards} />

      <Route component={Dashboard} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <InstallPrompt />
      <Toaster />
    </QueryClientProvider>
  );
}