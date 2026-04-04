import {
  Button,
  Card,
  List,
  Modal,
  Tag,
  message,
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import {
  useCheckVnpayPaymentStatus,
  useListPackages,
  useRegisterPackage,
} from "@/hooks/subscription";
import type { PackageDto } from "@/dto/subscription.dto";
import "./PackageSelector.css";

const { Text } = Typography;

interface PackageSelectorProps {
  open: boolean;
  onClose: () => void;
}

function formatDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("vi-VN");
}

export default function PackageSelector({
  open,
  onClose,
}: PackageSelectorProps) {
  const { data: packages, isLoading } = useListPackages();
  const registerMutation = useRegisterPackage();
  const { mutateAsync: checkPaymentStatus } = useCheckVnpayPaymentStatus();
  const [current, setCurrent] = useState<PackageDto | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

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
          setCurrent(null);
          onClose();
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
  }, [checkPaymentStatus, onClose, pendingOrderId]);

  const handleOpenPayment = async (pkg: PackageDto) => {
    setCurrent(pkg);

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
      ) : (
        <List
          dataSource={(packages as PackageDto[]) || []}
          renderItem={(pkg) => (
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
                    <div className="package-selector-meta">
                      {formatDate(pkg.created_at) ? (
                        <Text type="secondary">
                          Tạo ngày: {formatDate(pkg.created_at)}
                        </Text>
                      ) : null}
                      {formatDate(pkg.updated_at) ? (
                        <Text type="secondary">
                          Cập nhật: {formatDate(pkg.updated_at)}
                        </Text>
                      ) : null}
                    </div>
                  </div>
                  <div className="package-selector-action">
                    <Text strong className="package-selector-price">
                      {pkg.price === 0
                        ? "Miễn phí"
                        : `${pkg.price.toLocaleString("vi-VN")}đ`}
                    </Text>
                    <Button
                      type="primary"
                      loading={
                        registerMutation.isPending && current?.id === pkg.id
                      }
                      onClick={() => void handleOpenPayment(pkg)}
                    >
                      Đăng ký
                    </Button>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}
