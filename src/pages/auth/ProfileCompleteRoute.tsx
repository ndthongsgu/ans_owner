import { useGetCurrentUser } from "@/hooks/user";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spin } from "antd";

export default function ProfileCompleteRoute() {
  const { data: user, isLoading } = useGetCurrentUser();
  const location = useLocation();

  // Don't check if we're already on the profile setup page
  if (location.pathname === "/profile-setup") {
    return <Outlet />;
  }

  if (isLoading) {
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

  // Check if user needs to complete profile
  // For OAuth users: if username is null or password is not set
  // For regular customers: if phone is not set (username should be phone)
  const needsProfileSetup =
    user && user.customer?.phone && (!user.username || !user.hasPassword);

  if (needsProfileSetup) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <Outlet />;
}
