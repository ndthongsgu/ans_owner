import { useProfile } from "@/hooks/auth/auth";
import { useAuthHydrationStore, useAuthStore } from "@/hooks/auth/useAuthStore";
import { Spin } from "antd";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const { isAuthenticated } = useAuthStore();
  const { _hasHydrated } = useAuthHydrationStore();
  const profileQuery = useProfile();

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

    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
}
