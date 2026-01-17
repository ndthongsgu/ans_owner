import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Spin } from "antd";
import { useAuthStore } from "@/hooks/auth/useAuthStore";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokens } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      navigate('/');
    } else {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate, setTokens]);

  if (error) {
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
        <Alert
          message="Lỗi đăng nhập"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

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
      <Spin size="large" tip="Đang xử lý đăng nhập..." />
    </div>
  );
}