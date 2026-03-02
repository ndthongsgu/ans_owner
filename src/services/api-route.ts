export const API_ROUTES: ApiRoutes = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/bookvexe-be-j2e",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/me",
    PASSWORD_CHANGE: "/auth/change-password",
    PASSWORD_RESET_REQUEST: "/auth/password-reset/request",
    PASSWORD_RESET_CONFIRM: "/auth/password-reset/confirm",
    REGISTER: "/auth/register",
  },
  USER: {
    GET_ME: "/user/me",
    UPDATE_PROFILE: "/user/profile",
    SETUP_CREDENTIALS: "/user/setup-credentials",
  },
  SUBSCRIPTION: {
    LIST: "/subscription-packages",
    PURCHASE: (id: string) => `/subscription-packages/${id}/purchase`,
    MY: "/subscription-packages/my-subscription",
  },
  OAUTH: {
    GOOGLE: "/oauth2/authorization/google",
    CALLBACK: "/oauth/callback",
  },
  TRIP: {
    SEARCH_BY_ROUTE: "/user/trips/by-route",
  },
  ROUTE: {
    ALL: "/user/routes/all",
    PAGED: "/user/routes/paged",
    DETAIL: "/user/routes/detail",
    START_LOCATIONS: "/user/routes/start-locations",
    END_LOCATIONS: "/user/routes/end-locations",
    END_LOCATIONS_BY_START: "/user/routes/end-locations/by-start",
  },
  BOOKING: {
    CREATE: "/user/bookings",
    SEARCH: "/user/bookings/search",
    MY_BOOKINGS: "/user/bookings/my-bookings",
    MY_BOOKINGS_PAGED: "/user/bookings/my-bookings/pagination",
    BY_ID: "/user/bookings",
    CANCEL: "/user/bookings/cancel",
    CONFIRM_PAYMENT: "/user/bookings/confirm-payment",
    CONFIRM_PAYMENT_GUEST: (id: string) => `/user/bookings/confirm/${id}`,
  },
  USER_PAYMENTS: "/user/payments",
};

interface ApiRoutes {
  BASE_URL: string;
  TIMEOUT: number;
  HEADERS: {
    "Content-Type": string;
    Accept: string;
    Authorization?: string;
  };
}

export default API_ENDPOINTS;
