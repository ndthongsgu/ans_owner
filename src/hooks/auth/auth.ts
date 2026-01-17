import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RegisterRequest,
} from "@/dto/auth.dto";
import type { UserProfile } from "@/dto/user.dto";
import { API_ENDPOINTS } from "@/services/api-route";
import rootApiService from "@/services/api.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./useAuthStore";

export const useLogin = () => {
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await rootApiService.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials,
        {}, // headers
        { skipAuth: true } // This will prevent token refresh attempts
      );
      return response;
    },
    onSuccess: async (data) => {
      // Set tokens first
      setTokens(data.accessToken, data.refreshToken);

      // Try to fetch user profile immediately
      try {
        const profile = await rootApiService.get<UserProfile>(
          API_ENDPOINTS.AUTH.PROFILE
        );
        setUser(profile);
      } catch (error) {
        console.warn("Could not fetch user profile after login:", error);
      }

      queryClient.clear();
      navigate("/");
    },
    onError: (error: any) => {
      // The error message will now be the actual server message
      throw new Error(error.message || "Login failed");
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.AUTH.PROFILE],
    queryFn: () => rootApiService.get<UserProfile>(API_ENDPOINTS.AUTH.PROFILE),
    retry: false, // Don't retry on 401
    enabled: useAuthStore.getState().isAuthenticated, // Only run if we think we're authenticated
  });
};

export const useLogout = () => {
  const { clearTokens } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await rootApiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    },
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      navigate("/login");
    },
    onError: () => {
      // Even if API call fails, clear local state
      clearTokens();
      queryClient.clear();
      navigate("/login");
    },
  });
};

export const useChangePassword = () => {
  const { clearTokens } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      await rootApiService.post(API_ENDPOINTS.AUTH.PASSWORD_CHANGE, data);
    },
    onSuccess: () => {
      // Clear tokens and redirect to login since all sessions are revoked
      clearTokens();
      queryClient.clear();
      navigate(
        "/login?message=" +
          encodeURIComponent(
            "Password changed successfully. Please login again."
          )
      );
    },
    onError: (error: any) => {
      throw new Error(error.message || "Failed to change password");
    },
  });
};

export const usePasswordResetRequest = () => {
  return useMutation({
    mutationFn: async (data: PasswordResetRequest) => {
      await rootApiService.post(
        API_ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST,
        data
      );
    },
  });
};

export const usePasswordResetConfirm = () => {
  return useMutation({
    mutationFn: async (data: PasswordResetConfirmRequest) => {
      await rootApiService.post(
        API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM,
        data
      );
    },
  });
};

export const useRegister = () => {
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: RegisterRequest) => {
      const response = await rootApiService.post<AuthResponse>(
        "/auth/register",
        credentials,
        {}, // headers
        { skipAuth: true }
      );
      return response;
    },
    onSuccess: async (data) => {
      // Set tokens first
      setTokens(data.accessToken, data.refreshToken);

      // Try to fetch user profile immediately
      try {
        const profile = await rootApiService.get<UserProfile>(
          API_ENDPOINTS.AUTH.PROFILE
        );
        setUser(profile);
      } catch (error) {
        console.warn("Could not fetch user profile after registration:", error);
      }

      queryClient.clear();
      navigate("/");
    },
    onError: (error: any) => {
      throw new Error(error.message || "Registration failed");
    },
  });
};
