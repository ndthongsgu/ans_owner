import {
  CheckCircleFilled,
  CrownFilled,
  FireFilled,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import QrPaymentModal from "@/components/payment/QrPaymentModal";
import type { PackageDto } from "@/dto/subscription.dto";
import {
  useOwnerPackages,
  useOwnerProfile,
  useOwnerSubscription,
  usePurchaseOwnerPackage,
} from "@/hooks/owner";
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import "./index.css";

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

export default function SubscriptionPackagePage() {
  const { data: packages, isLoading } = useOwnerPackages();
  const { data: currentSubscription } = useOwnerSubscription();
  const { data: profile } = useOwnerProfile();
  const purchaseMutation = usePurchaseOwnerPackage();
  const [selectedPackage, setSelectedPackage] = useState<PackageDto | null>(
    null,
  );
  const [paymentOpen, setPaymentOpen] = useState(false);

  const ownerName = profile?.owner?.full_name || "chủ quán";
  const activePackageId = currentSubscription?.packageId || null;
  const currentPackageName = currentSubscription?.packageName || "Chưa đăng ký";
  const expirationText = currentSubscription?.expiresAt
    ? new Date(currentSubscription.expiresAt).toLocaleDateString("vi-VN")
    : null;

  const handleOpenPayment = (pkg: PackageDto) => {
    setSelectedPackage(pkg);
    setPaymentOpen(true);
  };

  const handleConfirmPaid = async () => {
    if (!selectedPackage) return;

    try {
      await purchaseMutation.mutateAsync(selectedPackage.id);
      message.success("Đăng ký gói thành công");
      setPaymentOpen(false);
      setSelectedPackage(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể đăng ký gói";
      message.error(errorMessage);
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
            Chọn gói phù hợp để mở rộng trải nghiệm thuyết minh, tăng tương tác
            khách hàng và quản lý quán ăn hiệu quả hơn.
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
              : "Bạn chưa có gói đang hoạt động"}
          </Text>
        </Card>
      </section>

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
              So sánh quyền lợi và chọn gói phù hợp với giai đoạn phát triển của
              quán.
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
                        <Title level={4} className="subscription-package-name">
                          {pkg.name}
                        </Title>
                        <Text className="subscription-package-desc">
                          {pkg.description ||
                            "Gói dịch vụ dành cho cửa hàng cần tối ưu vận hành."}
                        </Text>
                      </div>
                      {isActive ? <Tag color="gold">Đang sử dụng</Tag> : null}
                    </div>

                    <div className="subscription-package-price">
                      <span className="subscription-package-amount">
                        {formatPrice(pkg.price)}
                      </span>
                      <span className="subscription-package-duration">
                        /{pkg.duration} ngày
                      </span>
                    </div>

                    <Space
                      direction="vertical"
                      size={10}
                      className="subscription-feature-list"
                    >
                      {(pkg.features || []).map((feature) => (
                        <div
                          key={feature}
                          className="subscription-feature-item"
                        >
                          <CheckCircleFilled />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </Space>

                    <Button
                      type={isActive ? "default" : "primary"}
                      size="large"
                      block
                      disabled={isActive}
                      loading={
                        purchaseMutation.isPending &&
                        selectedPackage?.id === pkg.id
                      }
                      onClick={() => handleOpenPayment(pkg)}
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

      <QrPaymentModal
        open={paymentOpen}
        method="momo"
        amount={selectedPackage?.price || 0}
        onClose={() => {
          setPaymentOpen(false);
          setSelectedPackage(null);
        }}
        onConfirmPaid={handleConfirmPaid}
        loading={purchaseMutation.isPending}
      />
    </div>
  );
}
