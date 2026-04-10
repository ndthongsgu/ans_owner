import {
  CrownFilled,
  FireFilled,
  HistoryOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import type { PackageDto } from "@/dto/subscription.dto";
import {
  useListPackages,
  useMySubscription,
  useRegisterPackage,
  useMyPurchases,
  useActivatePurchase,
} from "@/hooks/subscription";
import {
  Button,
  Card,
  Col,
  Empty,
  Modal,
  Row,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useToast } from "@/hooks/layout/useToast";
import { useState, useMemo } from "react";
import "./index.css";
import { useProfile } from "@/hooks/owner";
import { formatUnixTimestamp } from "@/utils/date.utils";

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
  const showToast = useToast();

  const { data: packages, isLoading } = useListPackages();
  const { data: currentSubscription } = useMySubscription();
  const { data: profile } = useProfile();
  const { data: myPurchases, isLoading: isLoadingPurchases } = useMyPurchases();

  const registerMutation = useRegisterPackage();
  const activatePurchaseMutation = useActivatePurchase();

  const [selectedPackage, setSelectedPackage] = useState<PackageDto | null>(
    null,
  );
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // ==========================================
  // Xử lý dữ liệu Profile & Trạng thái gói
  // ==========================================
  const ownerName = profile?.owner?.full_name || "chủ quán";
  const ownerPackageId = profile?.owner?.subscription_package_id || null;

  const hasOwnerActiveSubscription = Boolean(ownerPackageId);

  const activePackageId =
    currentSubscription?.subscription_package_id ||
    currentSubscription?.package?.id ||
    currentSubscription?.packageId ||
    ownerPackageId;

  const hasActiveSubscription = Boolean(
    currentSubscription?.is_active ||
    currentSubscription?.active ||
    hasOwnerActiveSubscription,
  );

  const purchasedPackageIds = useMemo(() => {
    return new Set(myPurchases?.map((pkg) => pkg.id) || []);
  }, [myPurchases]);

  const activePackage = useMemo(() => {
    return (
      packages?.find((p) => p.id === activePackageId) ||
      myPurchases?.find((p) => p.id === activePackageId)
    );
  }, [packages, myPurchases, activePackageId]);

  const currentPackageName = activePackage?.name || "Chưa đăng ký gói";

  // ==========================================
  // Hàm xử lý tương tác
  // ==========================================
  
  const handleOpenPayment = async (pkg: PackageDto) => {
    setSelectedPackage(pkg);

    try {
      const session = await registerMutation.mutateAsync(pkg.id);
      const paymentUrl = session?.payment_url;

      if (!paymentUrl) {
        throw new Error("Backend chưa trả về đường dẫn thanh toán VNPay");
      }

      const paymentWindow = window.open(
        paymentUrl,
        "_blank",
        "noopener,noreferrer",
      );
      if (!paymentWindow) {
          showToast({
        type: "warning",
        title: "Cảnh báo",
        message: "Trình duyệt đang chặn popup. Vui lòng cho phép popup để mở trang thanh toán ở tab mới.",
      });
      }

      showToast({
        type: "success",
        title: "Thành công",
        message: "Đã mở VNPay. Hoàn tất thanh toán trên cổng VNPay.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không tạo được giao dịch VNPay";
      showToast({
        type: "error",
        title: "Lỗi", 
        message: errorMessage,
      });
      setSelectedPackage(null);
    }
  };

  const handleActivatePurchase = async (transactionId: string) => {
    try {
      await activatePurchaseMutation.mutateAsync(transactionId);
      showToast({
        type: "success",
        title: "Thành công",
        message: "Kích hoạt gói thành công!",
      });
      setIsHistoryModalOpen(false);
    } catch (err) {
      showToast({
        type: "error",
        title: "Lỗi",
        message: `Kích hoạt lại gói thất bại! ${err}`,
      });
    }
  };

  const renderPackageButton = (pkg: PackageDto, isActive: boolean) => {
    const isPurchased = purchasedPackageIds.has(pkg.id);
    const isLoadingAction =
      registerMutation.isPending && selectedPackage?.id === pkg.id;

    if (isActive) {
      return (
        <Button type="default" size="large" block disabled>
          Đang hoạt động
        </Button>
      );
    }

    if (isPurchased) {
      const purchasedPkg = myPurchases?.find(p => p.id === pkg.id);
      const transactionId = (purchasedPkg as any)?.transaction_id || purchasedPkg?.id;
      
      return (
        <Button
          type="primary"
          size="large"
          block
          className="subscription-btn-use"
          loading={activatePurchaseMutation.isPending && selectedPackage?.id === pkg.id}
          onClick={() => {
            setSelectedPackage(pkg);
            void handleActivatePurchase(transactionId as string);
          }}
        >
          Sử dụng gói này
        </Button>
      );
    }

    return (
      <Button
        type="primary"
        size="large"
        block
        loading={isLoadingAction}
        onClick={() => void handleOpenPayment(pkg)}
      >
        Đăng ký gói này
      </Button>
    );
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="subscription-page">
      <section className="subscription-hero">
        <div>
          <Title level={2} className="subscription-title">
            Gói đăng ký dành cho {ownerName}
          </Title>
          <Paragraph className="subscription-subtitle">
            {hasActiveSubscription
              ? "Gói của bạn đang hoạt động. Cảm ơn bạn đã tin dùng dịch vụ của chúng tôi! Hãy tiếp tục khám phá và tận dụng tối đa các tính năng để nâng cao trải nghiệm khách hàng tại quán ăn của bạn."
              : "Chọn gói phù hợp để mở rộng trải nghiệm thuyết minh, tăng tương tác khách hàng và quản lý quán ăn hiệu quả hơn."}
          </Paragraph>

          <Button
            icon={<HistoryOutlined />}
            className="subscription-history-btn"
            onClick={() => setIsHistoryModalOpen(true)}
            style={{ marginTop: 16 }}
          >
            Xem lịch sử gói đã mua
            {myPurchases && myPurchases.length > 0 && (
              <span className="subscription-history-badge">
                {myPurchases.length}
              </span>
            )}
          </Button>
        </div>

        <Card className="subscription-current-card">
          <Text className="subscription-current-label">Gói đang sử dụng</Text>
          <Title level={4} className="subscription-current-name">
            {currentPackageName}
          </Title>
          <Title level={5}>
            Sử dụng không giới hạn thời gian
          </Title>
        </Card>
      </section>

      {hasActiveSubscription && (
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
      )}

      {!hasActiveSubscription && (
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
      )}

      {/* Danh sách gói dịch vụ */}
      <Card className="subscription-list-card" style={{ marginTop: 24 }}>
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
          <div
            className="subscription-loading"
            style={{ textAlign: "center", padding: 40 }}
          >
            <Spin size="large" />
          </div>
        ) : !packages || packages.length === 0 ? (
          <Empty description="Chưa có gói dịch vụ nào" />
        ) : (
          <Row gutter={[16, 16]}>
            {packages.map((pkg) => {
              const isActive = activePackageId === pkg.id;
              const isPurchased = purchasedPackageIds.has(pkg.id);

              return (
                <Col xs={24} lg={12} xl={8} key={pkg.id}>
                  <Card
                    className={`subscription-package-card${
                      isActive ? " is-active" : ""
                    }${isPurchased && !isActive ? " is-purchased" : ""}`}
                  >
                    <div className="subscription-package-top">
                      <div>
                        <Title level={4} className="subscription-package-name">
                          {pkg.name}
                        </Title>
                        <div
                          className="subscription-package-meta"
                          style={{ marginBottom: 12 }}
                        >
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
                        <Tag color="gold" style={{ marginTop: 8 }}>
                          Đang sử dụng
                        </Tag>
                      ) : isPurchased ? (
                        <Tag color="cyan" style={{ marginTop: 8 }}>
                          Đã mua
                        </Tag>
                      ) : null}
                    </div>

                    <div
                      className="subscription-package-price"
                      style={{ margin: "16px 0" }}
                    >
                      <span
                        className="subscription-package-amount"
                        style={{ fontSize: 24, fontWeight: "bold" }}
                      >
                        {formatPrice(pkg.price)}
                      </span>
                    </div>

                    {renderPackageButton(pkg, isActive)}
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* Modal lịch sử gói đã mua */}
      <Modal
        title={
          <div
            className="subscription-history-modal-title"
            style={{ display: "flex", alignItems: "center" }}
          >
            <HistoryOutlined style={{ marginRight: 10, color: "#6366f1" }} />
            Lịch sử gói đã mua
          </div>
        }
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={null}
        width={820}
        className="subscription-history-modal"
      >
        {isLoadingPurchases ? (
          <div
            className="subscription-loading"
            style={{ textAlign: "center", padding: 40 }}
          >
            <Spin size="large" />
          </div>
        ) : !myPurchases || myPurchases.length === 0 ? (
          <Empty
            description="Bạn chưa mua gói nào"
            style={{ padding: "40px 0" }}
          />
        ) : (
          <Row gutter={[16, 16]} style={{ padding: "8px 0" }}>
            {myPurchases.map((pkg) => {
              const isActive = activePackageId === pkg.id;
              const transactionId = (pkg as any).transaction_id || pkg.id; // Dựa vào comment giả định của bạn

              return (
                <Col xs={24} md={12} key={pkg.id}>
                  <Card
                    className={`subscription-history-item-card${
                      isActive ? " is-active" : ""
                    }`}
                  >
                    <div
                      className="subscription-history-item-top"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div className="subscription-history-item-info">
                        <Title level={5} style={{ margin: "0 0 4px" }}>
                          {pkg.name}
                        </Title>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                            marginBottom: 6,
                          }}
                        >
                          <Tag color="blue">Mã: {pkg.code}</Tag>
                          <Tag color="geekblue">
                            Tối đa {pkg.max_stalls} quán
                          </Tag>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {pkg.description || "Không có mô tả"}
                        </Text>
                      </div>
                      {isActive && (
                        <Tag color="gold" style={{ flexShrink: 0 }}>
                          Đang dùng
                        </Tag>
                      )}
                    </div>

                    <div
                      className="subscription-history-item-footer"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        marginTop: 16,
                      }}
                    >
                      <div>
                        <Text strong style={{ fontSize: 18, color: "#1e293b" }}>
                          {formatPrice(pkg.price)}
                        </Text>
                        {pkg.created_at && (
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Ngày mua:{" "}
                              {formatUnixTimestamp(
                                pkg.created_at,
                                "",
                                "DD/MM/YYYY",
                              )}
                            </Text>
                          </div>
                        )}
                      </div>

                      {isActive ? (
                        <Button type="default" disabled size="small">
                          Đang hoạt động
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          size="small"
                          className="subscription-btn-use"
                          loading={activatePurchaseMutation.isPending}
                          onClick={() => handleActivatePurchase(transactionId)}
                        >
                          Kích hoạt lại
                        </Button>
                      )}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Modal>
    </div>
  );
}
