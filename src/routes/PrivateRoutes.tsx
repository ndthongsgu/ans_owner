import { useProfile } from "@/hooks/auth/auth";
import { useAuthHydrationStore, useAuthStore } from "@/hooks/auth/useAuthStore";
import { Spin } from "antd";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute() {
  const { isAuthenticated } = useAuthStore();
  const { _hasHydrated } = useAuthHydrationStore();
  const profileQuery = useProfile();
  const location = useLocation();

  if (!_hasHydrated) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (isAuthenticated && profileQuery.isError) {
    useAuthStore.getState().clearTokens();
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated) {
    // Show loading while profile is being fetched
    if (profileQuery.isLoading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" tip="Đang xác thực..." />
        </div>
      );
    }

    // Check if user needs to complete profile setup
    if (profileQuery.isSuccess && profileQuery.data) {
      const user = profileQuery.data;

      // Check if this is a customer who needs to setup credentials
      const isCustomer = user.customer && !user.isAdmin;
      const needsProfileSetup =
        isCustomer && (!user.username || !user.hasPassword);

      // Don't redirect if we're already on the profile setup page
      const isOnProfileSetup = location.pathname === "/profile-setup";

      if (needsProfileSetup && !isOnProfileSetup) {
        return (
          <Navigate
            to="/profile-setup"
            replace
            state={{
              from: location,
              message:
                "You need to enter a phone number and a password for the OAuth account",
            }}
          />
        );
      }

      // If on profile setup but doesn't need it anymore, redirect to home
      if (isOnProfileSetup && !needsProfileSetup) {
        return <Navigate to="/" replace />;
      }
    }

    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
}
