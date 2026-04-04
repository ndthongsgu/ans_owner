import {
  CheckCircleFilled,
  CrownFilled,
  FireFilled,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import type { PackageDto } from "@/dto/subscription.dto";
import {
  useCheckVnpayPaymentStatus,
  useListPackages,
  useMySubscription,
  useRegisterPackage,
} from "@/hooks/subscription";
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import "./index.css";
import { useProfile } from "@/hooks/owner";

const { Title, Paragraph, Text } = Typography;

const benefitItems = [
  {
    icon: <CrownFilled />,
    title: "Tăng nhận diện quán",
    description:
      "Trang thuyết minh có trải nghiệm tốt hơn, tăng mức độ ghi nhớ thương hiệu.",
  },
  {
    icon: <FireFilled />,
    title: "Đẩy mạnh tương tác",
    description:
      "Theo dõi lượt nghe, lượt yêu thích và tối ưu nội dung theo hành vi khách hàng.",
  },
  {
    icon: <SafetyCertificateFilled />,
    title: "Quản trị tập trung",
    description: "Quản lý gói, thời hạn và thanh toán trong một nơi duy nhất.",
  },
];

function formatPrice(price: number) {
  return price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}đ`;
}

function formatDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("vi-VN");
}

function formatDateFromTimestamp(value?: number | null) {
  if (!value) return null;

  const timestamp = value > 1_000_000_000_000 ? value : value * 1000;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("vi-VN");
}

export default function SubscriptionPackagePage() {
  const { data: packages, isLoading } = useListPackages();
  const { data: currentSubscription } = useMySubscription();
  const { data: profile } = useProfile();
  const registerMutation = useRegisterPackage();
  const { mutateAsync: checkPaymentStatus } = useCheckVnpayPaymentStatus();
  const [selectedPackage, setSelectedPackage] = useState<PackageDto | null>(
    null,
  );
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const ownerName = profile?.owner?.full_name || "chủ quán";
  const ownerPackageId = profile?.owner?.subscription_package_id || null;
  const ownerExpiryAt = profile?.owner?.subscription_expires_at;
  const ownerExpiryMs = ownerExpiryAt
    ? ownerExpiryAt > 1_000_000_000_000
      ? ownerExpiryAt
      : ownerExpiryAt * 1000
    : null;
  const hasOwnerActiveSubscription = Boolean(
    ownerPackageId && ownerExpiryMs && ownerExpiryMs > Date.now(),
  );
  const ownerPackageExpireText = formatDateFromTimestamp(ownerExpiryAt);
  const activePackageId = currentSubscription?.packageId || ownerPackageId;
  const hasActiveSubscription = Boolean(
    currentSubscription?.active || hasOwnerActiveSubscription,
  );
  const activePackage =
    packages?.find((pkg) => pkg.id === activePackageId) || null;
  const currentPackageName =
    currentSubscription?.packageName ||
    activePackage?.name ||
    (hasActiveSubscription ? "Gói đang hoạt động" : "Chưa đăng ký");
  const expirationText =
    (currentSubscription?.expiresAt
      ? new Date(currentSubscription.expiresAt).toLocaleDateString("vi-VN")
      : null) || ownerPackageExpireText;

  useEffect(() => {
    if (!pendingOrderId) return;

    let active = true;
    let timer: number | undefined;

    const pollStatus = async () => {
      try {
        const status = await checkPaymentStatus(pendingOrderId);

        if (!active) return;

        if (status.paid) {
          message.success(
            "Thanh toán thành công. Gói của bạn đã được cập nhật.",
          );
          setPendingOrderId(null);
          setSelectedPackage(null);
          return;
        }
      } catch {
        if (!active) return;
      }

      if (active) {
        timer = window.setTimeout(() => {
          void pollStatus();
        }, 5000);
      }
    };

    void pollStatus();

    return () => {
      active = false;
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [checkPaymentStatus, pendingOrderId]);

  const handleOpenPayment = async (pkg: PackageDto) => {
    setSelectedPackage(pkg);

    try {
      const session = await registerMutation.mutateAsync(pkg.id);
      const paymentUrl = session.payUrl || session.deeplink;

      if (!paymentUrl) {
        throw new Error("Backend chưa trả về đường dẫn thanh toán VNPay");
      }

      const opened = window.open(paymentUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        message.warning(
          "Trình duyệt đang chặn popup. Vui lòng cho phép popup để mở trang thanh toán ở tab mới.",
        );
      }

      if (session.orderId) {
        setPendingOrderId(session.orderId);
        message.info("Đã mở VNPay. Đang chờ xác nhận thanh toán...");
      } else {
        message.warning(
          "Không nhận được mã giao dịch để theo dõi tự động. Vui lòng kiểm tra lại lịch sử gói sau khi thanh toán.",
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không tạo được giao dịch VNPay";
      message.error(errorMessage);
      setPendingOrderId(null);
      setSelectedPackage(null);
    }
  };

  return (
    <div className="subscription-page">
      <section className="subscription-hero">
        <div>
          <Title level={2} className="subscription-title">
            Gói đăng ký dành cho {ownerName}
          </Title>
          <Paragraph className="subscription-subtitle">
            {hasActiveSubscription
              ? "Gói của bạn đang hoạt động. Hệ thống sẽ tự đồng bộ trạng thái và thời hạn sử dụng."
              : "Chọn gói phù hợp để mở rộng trải nghiệm thuyết minh, tăng tương tác khách hàng và quản lý quán ăn hiệu quả hơn."}
          </Paragraph>
        </div>

        <Card className="subscription-current-card">
          <Text className="subscription-current-label">Gói hiện tại</Text>
          <Title level={4} className="subscription-current-name">
            {currentPackageName}
          </Title>
          <Text className="subscription-current-expire">
            {expirationText
              ? `Hiệu lực đến ${expirationText}`
              : hasActiveSubscription
                ? "Gói đang hoạt động, chưa có thông tin ngày hết hạn"
                : "Bạn chưa có gói đang hoạt động"}
          </Text>
        </Card>
      </section>

      {hasActiveSubscription ? (
        <Card className="subscription-active-overview">
          <div className="subscription-active-head">
            <div>
              <Title level={3} className="subscription-active-title">
                Trạng thái gói của bạn
              </Title>
              <Text className="subscription-active-caption">
                Tài khoản của bạn đang trong trạng thái hoạt động và có thể sử
                dụng đầy đủ tính năng theo gói đã đăng ký.
              </Text>
            </div>
            <Tag color="success" className="subscription-active-tag">
              Đang hoạt động
            </Tag>
          </div>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={8}>
              <Card className="subscription-active-metric">
                <Text className="subscription-active-metric-label">
                  Tên gói
                </Text>
                <Title level={4} className="subscription-active-metric-value">
                  {currentPackageName}
                </Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="subscription-active-metric">
                <Text className="subscription-active-metric-label">
                  Tối đa số quán
                </Text>
                <Title level={4} className="subscription-active-metric-value">
                  {activePackage?.max_stalls || "-"}
                </Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="subscription-active-metric">
                <Text className="subscription-active-metric-label">
                  Giá gói
                </Text>
                <Title level={4} className="subscription-active-metric-value">
                  {typeof activePackage?.price === "number"
                    ? formatPrice(activePackage.price)
                    : "Theo cấu hình"}
                </Title>
              </Card>
            </Col>
          </Row>
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]} className="subscription-benefits">
            {benefitItems.map((item) => (
              <Col xs={24} md={8} key={item.title}>
                <Card className="subscription-benefit-card">
                  <div className="subscription-benefit-icon">{item.icon}</div>
                  <Title level={5}>{item.title}</Title>
                  <Text>{item.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="subscription-list-card">
            <div className="subscription-list-head">
              <div>
                <Title level={3} className="subscription-list-title">
                  Danh sách gói dịch vụ
                </Title>
                <Text className="subscription-list-caption">
                  So sánh quyền lợi và chọn gói phù hợp với giai đoạn phát triển
                  của quán.
                </Text>
              </div>
            </div>

            {isLoading ? (
              <div className="subscription-loading">
                <Spin size="large" />
              </div>
            ) : !packages || packages.length === 0 ? (
              <Empty description="Chưa có gói dịch vụ nào" />
            ) : (
              <Row gutter={[16, 16]}>
                {packages.map((pkg) => {
                  const isActive = activePackageId === pkg.id;

                  return (
                    <Col xs={24} lg={12} xl={8} key={pkg.id}>
                      <Card
                        className={`subscription-package-card${isActive ? " is-active" : ""}`}
                      >
                        <div className="subscription-package-top">
                          <div>
                            <Title
                              level={4}
                              className="subscription-package-name"
                            >
                              {pkg.name}
                            </Title>
                            <div className="subscription-package-meta">
                              <Tag color="blue">Mã gói: {pkg.code}</Tag>
                              <Tag color="geekblue">
                                Tối đa {pkg.max_stalls} quán
                              </Tag>
                            </div>
                            <Text className="subscription-package-desc">
                              {pkg.description ||
                                "Gói dịch vụ dành cho cửa hàng cần tối ưu vận hành."}
                            </Text>
                          </div>
                          {isActive ? (
                            <Tag color="gold">Đang sử dụng</Tag>
                          ) : null}
                        </div>

                        <div className="subscription-package-price">
                          <span className="subscription-package-amount">
                            {formatPrice(pkg.price)}
                          </span>
                        </div>

                        <div className="subscription-package-footer">
                          <div className="subscription-package-info-row">
                            <CheckCircleFilled />
                            <span>
                              {pkg.is_deleted
                                ? "Gói này đang bị ẩn"
                                : "Gói đang khả dụng trên backend"}
                            </span>
                          </div>
                          {formatDate(pkg.created_at) ? (
                            <Text className="subscription-package-timestamp">
                              Tạo ngày: {formatDate(pkg.created_at)}
                            </Text>
                          ) : null}
                          {formatDate(pkg.updated_at) ? (
                            <Text className="subscription-package-timestamp">
                              Cập nhật: {formatDate(pkg.updated_at)}
                            </Text>
                          ) : null}
                        </div>

                        <Button
                          type={isActive ? "default" : "primary"}
                          size="large"
                          block
                          disabled={isActive}
                          loading={
                            registerMutation.isPending &&
                            selectedPackage?.id === pkg.id
                          }
                          onClick={() => void handleOpenPayment(pkg)}
                        >
                          {isActive ? "Gói đang hoạt động" : "Đăng ký gói này"}
                        </Button>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
