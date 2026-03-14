export const REQUIRE_AUTH_ROUTES = {
  OWNER_DASHBOARD: "/dashboard",
  OWNER_PROFILE: "/owner/profile",
  OWNER_STALL: "/owner/stall",
  OWNER_STALL_CONTENT: "/owner/stall/content",
  OWNER_SUBSCRIPTION_PACKAGE: "/owner/subscription-package",
  OWNER_ANALYTICS_INTERACTION: "/owner/analytics-interaction",
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
  SEARCH_BOOKING: "/search-booking",
};

export type RequireAuthRouteKeys = keyof typeof REQUIRE_AUTH_ROUTES;
export type PublicRouteKeys = keyof typeof PUBLIC_ROUTES;

export const getRouteWithParams = (
  route: string,
  params: Record<string, string>,
): string => {
  let result = route;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value);
  });
  return result;
};

export const MAIN_NAVIGATION_ROUTES = {
  HOME: PUBLIC_ROUTES.HOME,
  OWNER_DASHBOARD: REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD,
  OWNER_PROFILE: REQUIRE_AUTH_ROUTES.OWNER_PROFILE,
  OWNER_STALL: REQUIRE_AUTH_ROUTES.OWNER_STALL,
  OWNER_STALL_CONTENT: REQUIRE_AUTH_ROUTES.OWNER_STALL_CONTENT,
  OWNER_SUBSCRIPTION_PACKAGE: REQUIRE_AUTH_ROUTES.OWNER_SUBSCRIPTION_PACKAGE,
  OWNER_ANALYTICS_INTERACTION: REQUIRE_AUTH_ROUTES.OWNER_ANALYTICS_INTERACTION,
  NOTIFICATION_LIST: REQUIRE_AUTH_ROUTES.NOTIFICATION_LIST,
  NOTIFICATION_DETAIL: REQUIRE_AUTH_ROUTES.NOTIFICATION_DETAIL,
  BOOKING_HISTORY: REQUIRE_AUTH_ROUTES.BOOKING_HISTORY,
  LOGIN: PUBLIC_ROUTES.LOGIN,
  REGISTER: PUBLIC_ROUTES.REGISTER,
};
