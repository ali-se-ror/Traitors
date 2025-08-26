import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  isGameMaster?: number;
  createdAt: string;
}

interface AuthData {
  user: User;
  currentVote?: { id: string; username: string } | null;
}

export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthData>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user: data?.user,
    currentVote: data?.currentVote,
    isLoading,
    error,
    isAuthenticated: !!data?.user,
  };
}
