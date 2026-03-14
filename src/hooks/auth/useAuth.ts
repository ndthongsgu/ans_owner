import { useEffect, useMemo } from "react";
import { useProfile } from "./auth";
import { useAuthStore } from "./useAuthStore";

/**
 * Custom hook to provide authentication status and user data
 * This hook combines Zustand auth store with React Query profile data
 */
export const useAuth = () => {
  const {
    isAuthenticated,
    user,
    clearTokens,
    isTokenValid,
    getAccessToken,
    clearExpiredTokens,
  } = useAuthStore();

  // Memoize token validity check to prevent unnecessary recalculations
  const hasValidToken = useMemo(() => isTokenValid(), [isTokenValid]);

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile();

  // Use useEffect to handle side effects (clearing tokens) outside of render
  useEffect(() => {
    // If we think we're authenticated but token is invalid, clear auth state
    if (isAuthenticated && !hasValidToken) {
      const wasCleared = clearExpiredTokens();
      if (wasCleared) {
        console.log("Cleared expired tokens");
      }
    }
  }, [isAuthenticated, hasValidToken, clearExpiredTokens]);

  // Handle profile fetch errors
  useEffect(() => {
    if (
      isAuthenticated &&
      profileError &&
      (profileError as any)?.status === 401
    ) {
      console.log("Profile fetch failed with 401, clearing tokens");
      clearTokens();
    }
  }, [isAuthenticated, profileError, clearTokens]);

  // Calculate authentication status
  const actuallyAuthenticated = isAuthenticated && hasValidToken;
  const ownerDisplayName =
    (profile as any)?.owner?.full_name || (user as any)?.owner?.full_name;

  return {
    // Authentication state
    isAuthenticated: actuallyAuthenticated,
    isLoading: actuallyAuthenticated && isProfileLoading,

    // User data - prefer profile data over stored user data
    user: profile || user,
    profile,

    // Auth utilities
    hasToken: !!getAccessToken(),
    clearAuth: clearTokens,

    // User display helpers
    displayName:
      ownerDisplayName || profile?.username || user?.username || "Người dùng",
    displayEmail: profile?.email || user?.email,
    displayInitial: (
      ownerDisplayName ||
      profile?.username ||
      user?.username ||
      "U"
    )
      .charAt(0)
      .toUpperCase(),
  };
};
