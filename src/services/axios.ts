import axios from "axios";
import API_ENDPOINTS, { API_ROUTES } from "./api-route";
import { useAuthStore } from "@/hooks/auth/useAuthStore";

const axiosInstance = axios.create({
  baseURL: API_ROUTES.BASE_URL,
  timeout: API_ROUTES.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Request interceptor: attach access token
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getAccessToken();
  const skipAuth = config.headers?.["x-skip-auth"] === "true";

  if (token && !skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Remove the custom header after reading it
  delete config.headers?.["x-skip-auth"];
  return config;
});

// Response interceptor: handle 401 and refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore.getState();

    // Don't try to refresh token for these cases:
    // 1. Auth-related endpoints (login, refresh, password reset)
    // 2. Requests that explicitly skip auth
    // 3. Already retried requests
    const isAuthEndpoint = originalRequest.url?.includes("/auth/");
    const skipAuth = originalRequest.headers?.["x-skip-auth"] === "true";

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      !skipAuth
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = authStore.refreshToken;
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const { data } = await axios.post(
            `${API_ROUTES.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          authStore.setTokens(data.accessToken, data.refreshToken);
          onRefreshed(data.accessToken);
          return axiosInstance(originalRequest);
        } catch (err) {
          authStore.clearTokens();
          // Only redirect if not already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = `/login?message=${encodeURIComponent(
              "Session expired. Please login again."
            )}`;
          }
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    // For auth endpoints or other 401 errors, just reject with the original error
    return Promise.reject(error);
  }
);

export default axiosInstance;
