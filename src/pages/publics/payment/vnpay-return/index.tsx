import { useBookingSelectionStore } from "@/hooks/booking/useBookingSelection";
import { useRouter } from "@/routes/hooks";
import API_ENDPOINTS from "@/services/api-route";
import rootApiService from "@/services/api.service";
import { Spin, Typography, message } from "antd";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;

export default function VNPayReturnPage() {
  const location = useLocation();
  const router = useRouter();
  const clearSelection = useBookingSelectionStore((s) => s.clearSelection);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Parse VNPay parameters correctly
    const vnp_TxnRef = params.get("vnp_TxnRef") || params.get("orderId") || "";
    const vnp_ResponseCode =
      params.get("vnp_ResponseCode") || params.get("code") || "";
    const status = params.get("status") || "";

    // Determine if payment was successful
    const isSuccess =
      vnp_ResponseCode === "00" && (status === "success" || status === "");

    console.log("[VNPay Return] Parameters:", {
      vnp_TxnRef,
      vnp_ResponseCode,
      status,
      isSuccess,
    });

    const process = async () => {
      if (!vnp_TxnRef) {
        message.error("Thiếu mã đơn hàng từ VNPay");
        router.push("/payment");
        return;
      }

      try {
        const key = `vn_booking_${vnp_TxnRef}`;
        const payloadRaw = localStorage.getItem(key);
        if (!payloadRaw) {
          message.error("Không tìm thấy thông tin đặt vé. Vui lòng đặt lại.");
          router.push("/payment");
          return;
        }
        const bookingMeta = JSON.parse(payloadRaw) as {
          bookingId: string;
          bookingCode: string;
          customerName: string;
          customerPhone: string;
        };

        // Xử lý theo kết quả VNPay
        if (!isSuccess) {
          // Các trường hợp thanh toán không thành công
          try {
            if (vnp_ResponseCode === "11") {
              // Hết thời gian thanh toán: xóa booking (soft-delete) để giải phóng dữ liệu
              await rootApiService.delete(
                `/admin/bookings/${bookingMeta.bookingId}`,
                undefined,
                {
                  skipAuth: true,
                } as any
              );
              message.warning(
                "Đã hết thời gian thanh toán. Đặt vé của bạn đã bị hủy."
              );
            } else {
              // Mặc định: hủy booking bằng endpoint guest (không cần auth)
              await rootApiService.post<unknown>(
                `/user/bookings/cancel-guest/${bookingMeta.bookingId}`
              );
              const reason =
                vnp_ResponseCode === "24"
                  ? "Bạn đã hủy giao dịch tại VNPay."
                  : `Thanh toán không thành công (mã: ${
                      vnp_ResponseCode || "N/A"
                    }).`;
              message.error(reason + " Vé đã được hủy.");
            }
          } catch (err) {
            console.error(
              "Error while updating booking after VNPay failure:",
              err
            );
          }

          localStorage.removeItem(key);
          clearSelection();
          router.push("/payment");
          return;
        }

        // Thành công: xác nhận booking đã được tạo trước đó
        try {
          await rootApiService.post<unknown>(
            API_ENDPOINTS.BOOKING.CONFIRM_PAYMENT_GUEST(bookingMeta.bookingId)
          );
        } catch (err) {
          console.error(
            "Error while confirming booking after VNPay success:",
            err
          );
        }

        localStorage.removeItem(key);
        clearSelection();

        router.push("/payment/result-booking", {
          bookingCode: bookingMeta.bookingCode,
          customerName: bookingMeta.customerName,
          customerPhone: bookingMeta.customerPhone,
        });
      } catch (err: any) {
        message.error(
          err?.message ||
            "Có lỗi khi xử lý đơn hàng sau thanh toán VNPay. Vui lòng thử lại."
        );
        router.push("/payment");
      }
    };

    process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Spin size="large" />
      <Title level={4} style={{ margin: 0 }}>
        Đang xử lý thanh toán VNPay...
      </Title>
      <Text type="secondary">Vui lòng không đóng trang này.</Text>
    </div>
  );
}
