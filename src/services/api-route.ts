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
    STALLS: {
      LIST: "/owner/stalls",
      CREATE: "/owner/stalls",
      UPDATE: (id: string) => `/owner/stalls/${id}`,
      DELETE: (id: string) => `/owner/stalls/${id}`,
      LIMIT: "/owner/stalls/limit",
    },
    STALL_CONTENT: {
      LIST: `/owner/stall-contents/all`,
      AVAILABLE_STALLS: `/owner/stall-contents/available-stalls`,
      CREATE: `/owner/stall-contents`,
      DETAIL: (stallId: string, contentId: string) =>
        `/owner/stall-contents/${stallId}/${contentId}`,
      UPDATE: (stallId: string, contentId: string) =>
        `/owner/stall-contents/${stallId}/${contentId}`,
      DELETE: (stallId: string, contentId: string) =>
        `/owner/stall-contents/${stallId}/${contentId}`,
      AVAILABLE_LANGUAGES: (stallId: string) =>
        `/owner/stall-contents/${stallId}/available-languages`,
      BY_LANGUAGE: (stallId: string, languageCode: string) =>
        `/owner/stall-contents/${stallId}/language/${languageCode}`,
      TOGGLE: (stallId: string, contentId: string) =>
        `/owner/stall-contents/${stallId}/${contentId}/toggle`,
    },
  },
  SUBSCRIPTION: {
    LIST: "/owner/subscription-packages",
    REGISTER: `/owner/subscription-packages/register`,
    MY: "/owner/subscription-packages/my-subscription",
  },
  PAYMENTS: {
    VNPAY_CREATE: "/user/payments/vnpay/create",
  },
  ROUTE: {
    ALL: "/user/routes/all",
    PAGED: "/user/routes/paged",
    DETAIL: "/user/routes/detail",
    START_LOCATIONS: "/user/routes/start-locations",
    END_LOCATIONS: "/user/routes/end-locations",
    END_LOCATIONS_BY_START: "/user/routes/end-locations/by-start",
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
