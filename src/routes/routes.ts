export const REQUIRE_AUTH_ROUTES = {
  // PROFILE: "/profile",
  CUSTOMER_PROFILE: "/profile",
  PROFILE_SETUP: "/profile-setup",
  CHANGE_PASSWORD: "/change-password",
  BOOKING_HISTORY: "/booking-history",
  NOTIFICATION_LIST: "/notifications",
  NOTIFICATION_DETAIL: "/notifications/:id",
};

export const PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  OAUTH_CALLBACK: "/oauth/callback",
  ABOUT: "/about",
  BOOKING: "/booking",
  CONTACT: "/contact",
  CAR: "/car",
  TRIP: "/trip",
  SEARCH_BOOKING: "/search-booking",
  BOOKING_RESULT: "/search-booking/result-search",
  PAYMENT: "/payment",
  RESULT_PAYMENT: "/payment/result-booking",
  VNPAY_RETURN: "/payment/vnpay-return",
};

export type RequireAuthRouteKeys = keyof typeof REQUIRE_AUTH_ROUTES;
export type PublicRouteKeys = keyof typeof PUBLIC_ROUTES;

export const getRouteWithParams = (
  route: string,
  params: Record<string, string>
): string => {
  let result = route;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value);
  });
  return result;
};

export const MAIN_NAVIGATION_ROUTES = {
  HOME: PUBLIC_ROUTES.HOME,
  // PROFILE: REQUIRE_AUTH_ROUTES.PROFILE,
  CUSTOMER_PROFILE: REQUIRE_AUTH_ROUTES.CUSTOMER_PROFILE,
  NOTIFICATION_LIST: REQUIRE_AUTH_ROUTES.NOTIFICATION_LIST,
  NOTIFICATION_DETAIL: REQUIRE_AUTH_ROUTES.NOTIFICATION_DETAIL,
  BOOKING_HISTORY: REQUIRE_AUTH_ROUTES.BOOKING_HISTORY,
  LOGIN: PUBLIC_ROUTES.LOGIN,
  REGISTER: PUBLIC_ROUTES.REGISTER,
  ABOUT: PUBLIC_ROUTES.ABOUT,
  BOOKING: PUBLIC_ROUTES.BOOKING,
  CONTACT: PUBLIC_ROUTES.CONTACT,
  CAR: PUBLIC_ROUTES.CAR,
  TRIP: PUBLIC_ROUTES.TRIP,
  SEARCH_BOOKING: PUBLIC_ROUTES.SEARCH_BOOKING,
  BOOKING_RESULT: PUBLIC_ROUTES.BOOKING_RESULT,
  PAYMENT: PUBLIC_ROUTES.PAYMENT,
  RESULT_PAYMENT: PUBLIC_ROUTES.RESULT_PAYMENT,
};
