import { lazy } from "react";
import { REQUIRE_AUTH_ROUTES } from "./routes";
const Dashboard = lazy(() => import("@/pages/require-auth/dashboard"));
const ProfilePage = lazy(() => import("@/pages/require-auth/profile"));
const StallPage = lazy(() => import("@/pages/require-auth/stall/index.tsx"));
const StallContentPage = lazy(
  () => import("@/pages/require-auth/stall-content/index.tsx"),
);
const SubscriptionPackagePage = lazy(
  () => import("@/pages/require-auth/subscription-package"),
);
const SubscriptionReturnPage = lazy(
  () => import("@/pages/require-auth/subscription-return"),
);

const ChangePasswordScreen = lazy(
  () => import("../pages/require-auth/change-password"),
);

export const REQUIRE_AUTH_SCREEN = {
  [REQUIRE_AUTH_ROUTES.CHANGE_PASSWORD]: <ChangePasswordScreen />,
  [REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD]: <Dashboard />,
  [REQUIRE_AUTH_ROUTES.OWNER_PROFILE]: <ProfilePage />,
  [REQUIRE_AUTH_ROUTES.OWNER_STALL]: <StallPage />,
  [REQUIRE_AUTH_ROUTES.OWNER_STALL_CONTENT]: <StallContentPage />,
  [REQUIRE_AUTH_ROUTES.OWNER_SUBSCRIPTION_PACKAGE]: <SubscriptionPackagePage />,
  [REQUIRE_AUTH_ROUTES.OWNER_SUBSCRIPTION_RETURN]: <SubscriptionReturnPage />,
  [REQUIRE_AUTH_ROUTES.OWNER_ANALYTICS_INTERACTION]: <Dashboard />,
};
