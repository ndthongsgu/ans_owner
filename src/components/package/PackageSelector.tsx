import {
  CheckCircleFilled,
  CrownFilled,
  FieldTimeOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  List,
  Modal,
  Space,
  Tag,
  Spin,
  Typography,
} from "antd";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/layout/useToast";
import {
  useListPackages,
  useMySubscription,
  useRegisterPackage,
  useMyPurchases,
  useActivatePurchase,
} from "@/hooks/subscription";
import type { PackageDto } from "@/dto/subscription.dto";
import { formatUnixTimestamp } from "@/utils/date.utils";
import "./PackageSelector.css";

const { Text, Title } = Typography;

interface PackageSelectorProps {
  open: boolean;
  onClose: () => void;
}

export default function PackageSelector({
  open,
  onClose,
}: PackageSelectorProps) {
  const { data: packages, isLoading } = useListPackages();
  const { data: currentSubscription } = useMySubscription();
  const { data: myPurchases } = useMyPurchases();
  const activatePurchaseMutation = useActivatePurchase();
  const registerMutation = useRegisterPackage();
  const [current, setCurrent] = useState<PackageDto | null>(null);

  const purchasedPackageIds = useMemo(() => {
    return new Set(myPurchases?.map((pkg) => pkg.id) || []);
  }, [myPurchases]);

  const activePackage = currentSubscription?.package;
  const activePackageName =
    activePackage?.name || currentSubscription?.packageName || "Gói hiện tại";

  const hasActiveSubscription = Boolean(
    currentSubscription?.is_active || currentSubscription?.active,
  );

  const showToast = useToast();

  const handleOpenPayment = async (pkg: PackageDto) => {
    setCurrent(pkg);

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
          message:
            "Trình duyệt đang chặn popup. Vui lòng cho phép popup để mở trang thanh toán ở tab mới.",
        });
      } else {
        showToast({
          type: "success",
          title: "Thành công",
          message: "Đã mở VNPay. Hoàn tất thanh toán trên cổng VNPay.",
        });
      }
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
      setCurrent(null);
    }
  };

  const handleActivatePurchase = async (pkg: PackageDto) => {
    setCurrent(pkg);
    try {
      const purchasedPkg = myPurchases?.find((p) => p.id === pkg.id);
      const transactionId = (purchasedPkg as any)?.transaction_id || purchasedPkg?.id;
      if (!transactionId) {
        throw new Error("Không tìm thấy mã giao dịch để kích hoạt");
      }

      await activatePurchaseMutation.mutateAsync(transactionId as string);
      showToast({
        type: "success",
        title: "Thành công",
        message: "Kích hoạt gói thành công!",
      });
      onClose();
    } catch (err) {
      showToast({
        type: "error",
        title: "Lỗi",
        message: `Kích hoạt lại gói thất bại! ${err}`,
      });
    } finally {
      setCurrent(null);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      title="Chọn gói dịch vụ"
      destroyOnHidden
    >
      {isLoading ? (
        <div className="package-selector-loading">
          <Spin />
        </div>
      ) : hasActiveSubscription ? (
        <Card className="package-active-card">
          <div className="package-active-head">
            <Space>
              <CrownFilled className="package-active-icon" />
              <div>
                <Title level={4} className="package-active-title">
                  Bạn đang sử dụng gói {activePackageName}
                </Title>
                <Text className="package-active-subtitle">
                  Tài khoản hiện đã được kích hoạt đầy đủ theo gói đăng ký.
                </Text>
              </div>
            </Space>
            <Tag color="success" icon={<CheckCircleFilled />}>
              Đang hoạt động
            </Tag>
          </div>

          <div className="package-active-metrics">
            <div className="metric-item">
              <ShopOutlined />
              <div>
                <Text className="metric-label">Tối đa số quán</Text>
                <Text className="metric-value">
                  {activePackage?.max_stalls
                    ? `${activePackage.max_stalls} quán`
                    : "Theo cấu hình"}
                </Text>
              </div>
            </div>
            <div className="metric-item">
              <FieldTimeOutlined />
             
            </div>
          </div>

          <div className="package-active-actions">
            <Button type="primary" onClick={onClose}>
              Đã hiểu
            </Button>
          </div>
        </Card>
      ) : (
        <List
          dataSource={(packages as PackageDto[]) || []}
          renderItem={(pkg) => {
            const createdAtText = formatUnixTimestamp(
              pkg.created_at,
              "",
              "DD/MM/YYYY",
            );
            const updatedAtText = formatUnixTimestamp(
              pkg.updated_at,
              "",
              "DD/MM/YYYY",
            );

            return (
              <List.Item>
                <Card className="package-selector-card">
                  <div className="package-selector-row">
                    <div className="package-selector-content">
                      <Text strong className="package-selector-name">
                        {pkg.name}
                      </Text>
                      <div className="package-selector-tags">
                        <Tag color="blue">{pkg.code}</Tag>
                        <Tag color="geekblue">Tối đa {pkg.max_stalls} quán</Tag>
                        <Tag color={pkg.is_deleted ? "red" : "green"}>
                          {pkg.is_deleted ? "Đã ẩn" : "Khả dụng"}
                        </Tag>
                      </div>
                      <Text className="package-selector-description">
                        {pkg.description ||
                          "Gói dịch vụ dành cho cửa hàng cần tối ưu vận hành."}
                      </Text>
                    </div>
                    <div className="package-selector-action">
                      <Text strong className="package-selector-price">
                        {pkg.price === 0
                          ? "Miễn phí"
                          : `${pkg.price.toLocaleString("vi-VN")}đ`}
                      </Text>
                      {activePackage?.id === pkg.id ? (
                        <Button type="default" disabled>
                          Đang hoạt động
                        </Button>
                      ) : purchasedPackageIds.has(pkg.id) ? (
                        <Button
                          type="primary"
                          className="package-btn-use"
                          loading={activatePurchaseMutation.isPending && current?.id === pkg.id}
                          onClick={() => void handleActivatePurchase(pkg)}
                        >
                          Sử dụng gói này
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          loading={
                            registerMutation.isPending && current?.id === pkg.id
                          }
                          onClick={() => void handleOpenPayment(pkg)}
                        >
                          Đăng ký gói này
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      )}
    </Modal>
  );
}
