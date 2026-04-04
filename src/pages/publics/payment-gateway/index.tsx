import { Button, Card, Space, Spin, Typography } from "antd";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";

const { Title, Text } = Typography;

export default function PaymentGatewayPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { redirectUrl?: string } | null;

  const redirectUrl = useMemo(() => {
    const fromState = state?.redirectUrl?.trim();
    if (fromState) {
      return fromState;
    }

    const params = new URLSearchParams(location.search);
    const value = params.get("redirect") || "";
    if (!value) {
      return "";
    }

    return value;
  }, [location.search, state?.redirectUrl]);

  const isValidHttpUrl =
    /^https?:\/\//i.test(redirectUrl) || /^zalopay:|^vnpay:/i.test(redirectUrl);

  useEffect(() => {
    if (!isValidHttpUrl) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.location.replace(redirectUrl);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isValidHttpUrl, redirectUrl]);

  return (
    <div className="payment-gateway-page">
      <Card className="payment-gateway-card">
        <Space
          direction="vertical"
          size={12}
          className="payment-gateway-content"
        >
          <Title level={4} className="payment-gateway-title">
            Đang chuyển sang cổng thanh toán VNPay
          </Title>

          {isValidHttpUrl ? (
            <>
              <Spin />
              <Text type="secondary">
                Hệ thống đang điều hướng đến trang thanh toán. Nếu không tự động
                chuyển trang, bấm nút bên dưới.
              </Text>
              <Button
                type="primary"
                onClick={() => window.location.replace(redirectUrl)}
              >
                Đi tới trang thanh toán
              </Button>
            </>
          ) : (
            <>
              <Text type="danger">
                Không tìm thấy liên kết thanh toán hợp lệ. Vui lòng quay lại và
                thử lại.
              </Text>
              <Button onClick={() => navigate(-1)}>Quay lại</Button>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
}
