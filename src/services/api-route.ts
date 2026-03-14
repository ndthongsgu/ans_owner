export const API_ROUTES: ApiRoutes = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": "vi",
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/owner/auth/login",
    LOGOUT: "/owner/auth/logout",
    REFRESH: "/owner/auth/refresh",
    PROFILE: "/owner/auth/me",
    PASSWORD_CHANGE: "/owner/auth/change-password",
    PASSWORD_RESET_REQUEST: "/owner/auth/password-reset/request",
    PASSWORD_RESET_CONFIRM: "/owner/auth/password-reset/confirm",
    REGISTER: "/owner/auth/register",
  },
  OWNER: {
    ME: "/owner/auth/me",
    UPDATE_PROFILE: "/owner/auth/me",
    SUBSCRIPTION: {
      LIST: "/owner/subscription-packages/",
      PURCHASE: (id: string) => `/owner/subscription-packages/${id}/purchase`,
      MY: "/owner/subscription-packages/my-subscription",
    },
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
    "Accept-Language": string;
    Authorization?: string;
  };
}

export default API_ENDPOINTS;
