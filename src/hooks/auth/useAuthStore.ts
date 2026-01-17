import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: any | null;
  setTokens: (accessToken: string, refreshToken: string, user?: any) => void;
  clearTokens: () => void;
  getAccessToken: () => string | null;
  setUser: (user: any) => void;
  isTokenValid: () => boolean;
  // Add method to clear expired tokens safely
  clearExpiredTokens: () => boolean;
}

// Helper: check if JWT token is expired
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

// Hydration store (non-persistent)
interface AuthHydrationState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      user: null,

      setTokens: (accessToken: string, refreshToken: string, user?: any) => {
        const currentUser = user || get().user;
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
          user: currentUser,
        });
      },

      clearTokens: () =>
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          user: null,
        }),

      /** 
       * Safe getter: KHÔNG gọi set() bên trong.
       * Chỉ trả về token nếu còn hạn, nếu hết hạn thì trả null.
       * Không tự xóa trong render.
       */
      getAccessToken: () => {
        const token = get().accessToken;
        if (!token || isTokenExpired(token)) {
          return null;
        }
        return token;
      },

      setUser: (user: any) => set({ user }),

      isTokenValid: () => {
        const token = get().accessToken;
        return token != null && !isTokenExpired(token);
      },

      // Add separate method to clear expired tokens when needed
      clearExpiredTokens: () => {
        const state = get();
        if (isTokenExpired(state.accessToken)) {
          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            user: null,
          });
          return true;
        }
        return false;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export const useAuthHydrationStore = create<AuthHydrationState>((set) => ({
  _hasHydrated: false,
  setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
}));
