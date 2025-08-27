import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Voting from "@/pages/voting";
import Profile from "@/pages/profile";
import GameMaster from "@/pages/game-master";
import SecretMessages from "@/pages/secret-messages";
import SuspicionMeter from "@/pages/suspicion-meter";
import FateCards from "@/pages/fate-cards";
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

  if (!user) {
    return (
      <Switch>
        <Route component={Auth} />
      </Switch>
    );
  }

  return (
    <Switch>
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
      <Toaster />
    </QueryClientProvider>
  );
}