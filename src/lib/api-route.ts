export const API_ROUTES = {
  BASE_URL: import.meta.env.VITE_API_CHAT_URL,
  TIMEOUT: 100000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    PROFILE: "/api/auth/profile",
  },
  CHAT: {
    PROMPT: "/api/chat/prompt",
  }
};

export default API_ENDPOINTS;
