import {
  BankOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  DollarOutlined,
  FileTextOutlined,
  KeyOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Divider, Row, Space, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { REQUIRE_AUTH_ROUTES } from "@/routes/routes";
import "./index.css";

const { Text, Title } = Typography;

const decodeOrderInfo = (value: string | null) => {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value.replace(/\+/g, "%20"));
  } catch {
    return value.replace(/\+/g, " ");
  }
};

const formatAmount = (rawAmount: string | null) => {
  const amount = Number(rawAmount || "0");
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return (amount / 100).toLocaleString("vi-VN") + "đ";
};

const formatPayDate = (rawDate: string | null) => {
  if (!rawDate || rawDate.length !== 14) {
    return null;
  }

  const year = rawDate.slice(0, 4);
  const month = rawDate.slice(4, 6);
  const day = rawDate.slice(6, 8);
  const hour = rawDate.slice(8, 10);
  const minute = rawDate.slice(10, 12);
  const second = rawDate.slice(12, 14);

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};

export default function SubscriptionReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const result = useMemo(() => {
    const getParam = (...keys: string[]) => {
      for (const key of keys) {
        const value = searchParams.get(key);
        if (typeof value === "string" && value.length > 0) {
          return value.trim();
        }
      }

      return null;
    };

    const responseCode = getParam("vnp_ResponseCode", "responseCode");
    const txnStatus = getParam("vnp_TransactionStatus", "transactionStatus");
    const normalizedResponseCode = (responseCode || "").toUpperCase();
    const normalizedTxnStatus = (txnStatus || "").toUpperCase();

    const isSuccess =
      normalizedTxnStatus === "00" ||
      (normalizedResponseCode === "00" &&
        (!normalizedTxnStatus || normalizedTxnStatus === "00"));

    return {
      isSuccess,
      responseCode,
      txnStatus,
      txnRef: getParam("vnp_TxnRef", "txnRef"),
      amount: formatAmount(getParam("vnp_Amount", "amount")),
      bankCode: getParam("vnp_BankCode", "bankCode"),
      payDate: formatPayDate(getParam("vnp_PayDate", "payDate")),
      orderInfo: decodeOrderInfo(getParam("vnp_OrderInfo", "orderInfo")),
    };
  }, [searchParams]);

  return (
    <div className="subscription-return-page">
      <Card className="subscription-return-card">
        <div
          className={`subscription-return-hero ${
            result.isSuccess ? "is-success" : "is-error"
          }`}
        >
          <div className="subscription-return-hero-icon" aria-hidden>
            {result.isSuccess ? <CheckCircleFilled /> : <CloseCircleFilled />}
          </div>

          <div className="subscription-return-hero-content">
            <Tag color={result.isSuccess ? "success" : "error"}>
              {result.isSuccess ? "GIAO DỊCH THÀNH CÔNG" : "GIAO DỊCH THẤT BẠI"}
            </Tag>
            <Title level={2} className="subscription-return-title">
              {result.isSuccess
                ? "Thanh toán gói thành công"
                : "Thanh toán chưa thành công"}
            </Title>
            <Text className="subscription-return-subtitle">
              {result.isSuccess
                ? "Hệ thống đang cập nhật gói đăng ký của bạn."
                : "Giao dịch chưa hoàn tất hoặc bị từ chối. Vui lòng thử lại."}
            </Text>
          </div>

          <div className="subscription-return-amount-block">
            <Text className="label">Số tiền</Text>
            <div className="value">{result.amount || "-"}</div>
          </div>
        </div>

        <Divider className="subscription-return-divider" />

        <div className="subscription-return-details">
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <div className="detail-item">
                <KeyOutlined />
                <div>
                  <Text className="detail-label">Mã đơn hàng</Text>
                  <Text className="detail-value">{result.txnRef || "-"}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="detail-item">
                <DollarOutlined />
                <div>
                  <Text className="detail-label">Số tiền</Text>
                  <Text className="detail-value">{result.amount || "-"}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="detail-item">
                <BankOutlined />
                <div>
                  <Text className="detail-label">Ngân hàng</Text>
                  <Text className="detail-value">{result.bankCode || "-"}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="detail-item">
                <CalendarOutlined />
                <div>
                  <Text className="detail-label">Thời gian thanh toán</Text>
                  <Text className="detail-value">{result.payDate || "-"}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="detail-item">
                <FileTextOutlined />
                <div>
                  <Text className="detail-label">Nội dung</Text>
                  <Text className="detail-value">
                    {result.orderInfo || "-"}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="detail-item">
                <InfoCircleOutlined />
                <div>
                  <Text className="detail-label">Mã phản hồi</Text>
                  <Text className="detail-value">
                    {result.responseCode || "-"}
                    {result.txnStatus
                      ? ` | Trạng thái giao dịch: ${result.txnStatus}`
                      : ""}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div className="subscription-return-actions">
          <Space wrap>
            <Button
              type="primary"
              size="large"
              onClick={() =>
                navigate(REQUIRE_AUTH_ROUTES.OWNER_SUBSCRIPTION_PACKAGE)
              }
            >
              Về trang gói đăng ký
            </Button>
            <Button
              size="large"
              onClick={() => navigate(REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD)}
            >
              Về trang chủ
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}
