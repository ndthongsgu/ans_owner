import { lazy } from "react";
import { REQUIRE_AUTH_ROUTES } from "./routes";
import NotificationDetailPage from "@/pages/notification/NotificationDetailPage";
import NotificationListPage from "@/pages/notification/NotificationListPage";
import Dashboard from "@/pages/require-auth/dashboard";
import ProfilePage from "@/pages/require-auth/profile";
import StallPage from "@/pages/stall/index.tsx";
import StallContentPage from "@/pages/stallContent";
import SubscriptionPackagePage from "@/pages/require-auth/subscription-package";

const ChangePasswordScreen = lazy(
  () => import("../pages/require-auth/change-password"),
);

export const REQUIRE_AUTH_SCREEN = {
  [REQUIRE_AUTH_ROUTES.CHANGE_PASSWORD]: <ChangePasswordScreen />,
  [REQUIRE_AUTH_ROUTES.NOTIFICATION_LIST]: <NotificationListPage />,
  [REQUIRE_AUTH_ROUTES.NOTIFICATION_DETAIL]: <NotificationDetailPage />,
  [REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD]: <Dashboard />,
  [REQUIRE_AUTH_ROUTES.OWNER_PROFILE]: <ProfilePage />,
  [REQUIRE_AUTH_ROUTES.OWNER_STALL]: <StallPage />,
  [REQUIRE_AUTH_ROUTES.OWNER_STALL_CONTENT]: <StallContentPage />,
  [REQUIRE_AUTH_ROUTES.OWNER_SUBSCRIPTION_PACKAGE]: <SubscriptionPackagePage />,
  [REQUIRE_AUTH_ROUTES.OWNER_ANALYTICS_INTERACTION]: <NotificationListPage />,
};
