import { Modal, Button, Space, Tag, Typography, Divider } from "antd";
import { CheckCircleFilled, CloseCircleOutlined } from "@ant-design/icons";
import { Momo, ZaloPay, VNPay, ATM, cash as CashIcon } from "@/assets/icons";
import { useMemo } from "react";

const { Title, Text } = Typography;

export type PaymentMethodId = "momo" | "zalopay" | "vnpay" | "banking" | "cash" | (string & {});

type PaymentStatus = "success" | "pending" | "failed" | "refunded";

interface QrPaymentModalProps {
  open: boolean;
  method: string;
  amount: number;
  onClose: () => void;
  onConfirmPaid: () => void | Promise<void>;
  loading?: boolean;
  status?: PaymentStatus;
  methodLabel?: string;
}

const METHOD_META: Record<PaymentMethodId, { label: string; color: string; icon: string }> = {
  momo: { label: "Ví MoMo", color: "#a50064", icon: Momo },
  zalopay: { label: "ZaloPay", color: "#0068ff", icon: ZaloPay },
  vnpay: { label: "VNPay", color: "#0066cc", icon: VNPay },
  banking: { label: "Chuyển khoản ngân hàng", color: "#52c41a", icon: ATM },
  cash: { label: "Tiền mặt", color: "#faad14", icon: CashIcon },
};

const STATUS_META: Record<PaymentStatus, { label: string; color: string }> = {
  success: { label: "Thành công", color: "green" },
  pending: { label: "Chờ xử lý", color: "orange" },
  failed: { label: "Thất bại", color: "red" },
  refunded: { label: "Đã hoàn tiền", color: "default" },
};

export default function QrPaymentModal({
  open,
  method,
  amount,
  onClose,
  onConfirmPaid,
  loading,
  status = "pending",
  methodLabel,
}: QrPaymentModalProps) {
  const baseMeta =
    METHOD_META[method as PaymentMethodId] || {
      label: (method || "").toUpperCase(),
      color: "#52c41a",
      icon: ATM,
    };
  const meta = {
    ...baseMeta,
    label: methodLabel || baseMeta.label,
  };
  const isVNPay = (method || "").toLowerCase() === "vnpay";

  const qrImageUrl = useMemo(() => {
    const url = `https://www.youtube.com/watch?v=dQw4w9WgXcQ&method=${method}&amount=${amount}`;
    const encoded = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encoded}`;
  }, [method, amount]);

  if (!meta) return null;
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      destroyOnClose
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={meta.icon} alt={meta.label} style={{ width: 32, height: 32, borderRadius: 8 }} />
          <span>{isVNPay ? "Thanh toán" : "Quét QR thanh toán"} - {meta.label}</span>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Tag color={STATUS_META[status].color} style={{ marginBottom: 8 }}>
          {STATUS_META[status].label}
        </Tag>
        <Title level={4} style={{ marginTop: 0 }}>Số tiền: {amount.toLocaleString()}đ</Title>
        <Text type="secondary" style={{ marginBottom: 12 }}>
          {isVNPay
            ? "Nhấn 'Đến trang thanh toán' để đi tới VNPay và hoàn tất thanh toán."
            : "Mở ứng dụng để quét mã QR và xác nhận thanh toán."}
        </Text>
        {!isVNPay && (
          <div style={{ padding: 16, borderRadius: 12, border: "1px solid #f0f0f0", background: "#fff" }}>
            <img src={qrImageUrl} alt="QR Code" width={240} height={240} />
          </div>
        )}
        <Divider style={{ margin: "16px 0" }} />
        <Space>
          <Button icon={<CloseCircleOutlined />} onClick={onClose}>Hủy</Button>
          <Button type="primary" icon={<CheckCircleFilled />} onClick={onConfirmPaid} loading={loading}>
            {isVNPay ? "Đến trang thanh toán" : "Tôi đã quét xong"}
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
