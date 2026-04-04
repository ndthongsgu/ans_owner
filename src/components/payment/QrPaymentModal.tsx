import { Modal, Button, Space, Tag, Typography, Divider } from "antd";
import { CheckCircleFilled, CloseCircleOutlined } from "@ant-design/icons";
import { ZaloPay, VNPay, ATM, cash as CashIcon } from "@/assets/icons";
import "./QrPaymentModal.css";

const { Title, Text } = Typography;

export type PaymentMethodId =
  | "zalopay"
  | "vnpay"
  | "banking"
  | "cash"
  | (string & {});

type PaymentStatus = "success" | "pending" | "failed" | "refunded";

interface QrPaymentModalProps {
  open: boolean;
  method: string;
  amount: number;
  onClose: () => void;
  onConfirmPaid: () => void | Promise<void>;
  paymentUrl?: string;
  qrCodeUrl?: string;
  orderId?: string;
  loading?: boolean;
  status?: PaymentStatus;
  methodLabel?: string;
  confirmText?: string;
}

const METHOD_META: Record<
  PaymentMethodId,
  { label: string; color: string; icon: string }
> = {
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
  paymentUrl,
  qrCodeUrl,
  orderId,
  loading,
  status = "pending",
  methodLabel,
  confirmText,
}: QrPaymentModalProps) {
  const baseMeta = METHOD_META[method as PaymentMethodId] || {
    label: (method || "").toUpperCase(),
    color: "#52c41a",
    icon: ATM,
  };
  const meta = {
    ...baseMeta,
    label: methodLabel || baseMeta.label,
  };
  const isVNPay = (method || "").toLowerCase() === "vnpay";

  const qrImageUrl = qrCodeUrl || "";
  const canOpenPaymentPage =
    typeof paymentUrl === "string" && paymentUrl.length > 0;
  const canShowQr =
    !isVNPay && typeof qrImageUrl === "string" && qrImageUrl.length > 0;

  if (!meta) return null;
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      destroyOnHidden
      title={
        <div className="payment-modal-title">
          <img
            src={meta.icon}
            alt={meta.label}
            className="payment-modal-icon"
          />
          <span>
            {isVNPay ? "Thanh toán" : "Quét QR thanh toán"} - {meta.label}
          </span>
        </div>
      }
    >
      <div className="payment-modal-body">
        <Tag color={STATUS_META[status].color} className="payment-modal-status">
          {STATUS_META[status].label}
        </Tag>
        <Title level={4} className="payment-modal-amount">
          Số tiền: {amount.toLocaleString()}đ
        </Title>
        <Text type="secondary" className="payment-modal-description">
          {isVNPay
            ? "Nhấn 'Đến trang thanh toán' để đi tới VNPay và hoàn tất thanh toán."
            : "Mở ứng dụng để quét mã QR và xác nhận thanh toán."}
        </Text>
        {orderId ? (
          <Text type="secondary" className="payment-modal-order">
            Mã giao dịch: {orderId}
          </Text>
        ) : null}
        {canShowQr ? (
          <div className="payment-modal-qr">
            <img src={qrImageUrl} alt="QR Code" width={240} height={240} />
          </div>
        ) : null}
        <Divider className="payment-modal-divider" />
        <Space>
          <Button icon={<CloseCircleOutlined />} onClick={onClose}>
            Hủy
          </Button>
          {canOpenPaymentPage ? (
            <Button
              onClick={() =>
                window.open(paymentUrl, "_blank", "noopener,noreferrer")
              }
            >
              Mở trang VNPay
            </Button>
          ) : null}
          <Button
            type="primary"
            icon={<CheckCircleFilled />}
            onClick={onConfirmPaid}
            loading={loading}
          >
            {confirmText ||
              (isVNPay ? "Đến trang thanh toán" : "Tôi đã thanh toán")}
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
