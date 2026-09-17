import { trpc } from "@/lib/trpc";
import { useCallback } from "react";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();
  
  // Use TRPC to fetch the current user
  const { data: user, isLoading: loading } = trpc.auth.me.useQuery();
  
  // Setup the logout mutation
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // Clear the current location and reload to reset state
      setLocation("/");
      window.location.reload();
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    user,
    loading,
    logout,
  };
}
