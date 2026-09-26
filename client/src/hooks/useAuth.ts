import { trpc } from "@/lib/trpc";
import { useCallback } from "react";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  // Use TRPC to fetch the current user
  const { data: user, isLoading: loading } = trpc.auth.me.useQuery();
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      utils.orders.myOrders.invalidate();
      setLocation("/");
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
