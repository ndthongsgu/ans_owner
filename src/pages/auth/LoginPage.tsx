import { useEffect, useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Spin, Alert } from "antd";
import { useProfile } from "@/hooks/auth/auth";
import { useAuthHydrationStore, useAuthStore } from "@/hooks/auth/useAuthStore";
import { useNavigate } from "react-router-dom";
import { REQUIRE_AUTH_ROUTES } from "@/routes/routes";

export default function LoginPage() {
  const { isAuthenticated } = useAuthStore();
  const { _hasHydrated } = useAuthHydrationStore();
  const profileQuery = useProfile();
  const navigate = useNavigate();
  // NEW STATE: Track when we should show the redirecting UI
  const [showRedirecting, setShowRedirecting] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    // If we have tokens and profile query is successful, initiate delayed redirect
    if (isAuthenticated && profileQuery.isSuccess) {
      // 1. Show the redirect message immediately
      setShowRedirecting(true);

      // 2. Set the 2-second delay before navigating
      timeoutId = window.setTimeout(() => {
        navigate(REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD);
      }, 2000); // 2000 milliseconds = 2 seconds
    }

    // Cleanup function: Clear the timeout and reset state if the component unmounts
    // or if dependencies change before the timeout fires
    return () => {
      clearTimeout(timeoutId);
      setShowRedirecting(false);
    };
  }, [isAuthenticated, profileQuery.isSuccess, navigate]);

  // --- 1. Hydration Loading ---
  // Show loading while checking hydration
  if (!_hasHydrated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  // --- 2. Delayed Redirect UI (NEW BLOCK) ---
  // If we are authenticated AND the profile is loaded, show the message while waiting for the timeout
  if (showRedirecting) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column", // Stack Alert and Spin vertically
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
        }}
      >
        {/* The Alert component for the "Already Logged In" message */}
        <Alert
          message="Đã đăng nhập"
          description="Bạn đã đăng nhập. Đang chuyển hướng về trang quản lý quán sau 2 giây..."
          type="success"
          showIcon
          style={{ marginBottom: "20px", width: 400 }}
        />
        {/* The Spin component below the alert */}
        <Spin size="large" tip="Đang chuyển hướng..." />
      </div>
    );
  }

  // --- 3. Profile Loading ---
  // Show loading while checking authentication (before profile is retrieved)
  if (isAuthenticated && profileQuery.isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
        }}
      >
        <Spin size="large" tip="Đang kiểm tra phiên đăng nhập..." />
      </div>
    );
  }

  // NOTE: The previous condition `if (isAuthenticated && profileQuery.isSuccess)` is replaced
  // by the new `if (showRedirecting)` block to handle the 2s delay.

  // --- 4. Login Form (Default) ---
  // Show login form if not authenticated or token is invalid
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        // Flex end and padding right are removed for customer mode to center the form
        justifyContent: "flex-end", // Kept for consistency if needed, but form placement changes below
      }}
    >
      <div
        // FIX: Replicating the old LoginScreen's specific positioning for the form container
        style={{
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          width: "400px",
          maxWidth: "90vw",
          position: "absolute",
          right: "150px", // Old position right
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {/* Pass adminMode=false for customer page */}
        <LoginForm />
      </div>
    </div>
  );
}
