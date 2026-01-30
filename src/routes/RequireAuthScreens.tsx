import NotificationDetailPage from "@/pages/notification/NotificationDetailPage";
import NotificationListPage from "@/pages/notification/NotificationListPage";
import CustomerProfilePage from "@/pages/user/CustomerProfilePage";
import ProfileSetupPage from "@/pages/user/ProfileSetupPage";
import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import OwnerProfilePage from "@/pages/owner/OwnerProfilePage";
import { lazy } from "react";
import { REQUIRE_AUTH_ROUTES } from "./routes";

// const ProfileScreen = lazy(() => import("../pages/require-auth/profile"));

const ChangePasswordScreen = lazy(
  () => import("../pages/require-auth/change-password")
);

const BookingHistoryScreen = lazy(
  () => import("../pages/require-auth/booking-history/index")
);

export const REQUIRE_AUTH_SCREEN = {
  [REQUIRE_AUTH_ROUTES.CUSTOMER_PROFILE]: <CustomerProfilePage />,
  [REQUIRE_AUTH_ROUTES.PROFILE_SETUP]: <ProfileSetupPage />,
  [REQUIRE_AUTH_ROUTES.CHANGE_PASSWORD]: <ChangePasswordScreen />,
  [REQUIRE_AUTH_ROUTES.NOTIFICATION_LIST]: <NotificationListPage />,
  [REQUIRE_AUTH_ROUTES.NOTIFICATION_DETAIL]: <NotificationDetailPage />,
  [REQUIRE_AUTH_ROUTES.BOOKING_HISTORY]: <BookingHistoryScreen />,
  // Owner screens
  [REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD]: <OwnerDashboard />,
  [REQUIRE_AUTH_ROUTES.OWNER_PROFILE]: <OwnerProfilePage />,
};
