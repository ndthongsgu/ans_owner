import { ATM, VNPay } from "@/assets/icons";
import BookingDrawer from "@/components/payment/Payment";
import QrPaymentModal from "@/components/payment/QrPaymentModal";
import type { BookingSeatCreate, BookingUserCreate } from "@/dto/booking.dto";
import { useProfile } from "@/hooks/auth/auth";
import { useAuthStore } from "@/hooks/auth/useAuthStore";
import { useCreateBooking } from "@/hooks/booking";
import { useBookingSelectionStore } from "@/hooks/booking/useBookingSelection";
import { useToast } from "@/hooks/layout/useToast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useRouter } from "@/routes/hooks";
import API_ENDPOINTS from "@/services/api-route";
import rootApiService from "@/services/api.service";

import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CreditCardOutlined,
  EditOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Input,
  message,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export default function PaymentPage() {
  const location = useLocation();
  const router = useRouter();
  const persisted = useBookingSelectionStore((s) => s.selection);
  const clearSelection = useBookingSelectionStore((s) => s.clearSelection);
  const setSelection = useBookingSelectionStore((s) => s.setSelection);
  const [bookingData, setBookingData] = useState<any>(
    (location.state as any) || persisted
  );
  const showToast = useToast();
  const { mutateAsync: createBooking, isPending } = useCreateBooking();
  const { isAuthenticated } = useAuthStore();
  const { data: profile } = useProfile();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
    insurance: false,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});

  const [paymentMethod, setPaymentMethod] = useState<string>("vnpay");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPriceDetail, setShowPriceDetail] = useState(false);
  const [openDrawer, setOpenDrawer] = useState<
    "detail" | "pickup" | "dropoff" | null
  >(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  const [dbMethods, setDbMethods] = useState<
    Array<{ id: string; code: string; name: string }>
  >([]);

  const seatIds = (bookingData?.selectedSeats || [])
    .map((seatNumber: string) => {
      const seatsArray = bookingData?.selectedCar?.car?.carSeats || [];
      const seat = seatsArray.find((s: any) => s.seatNumber === seatNumber);
      return seat?.id;
    })
    .filter(Boolean);

  const { reserveSeats } = useWebSocket({
    tripId: bookingData?.tripId || bookingData?.bus?.id,
    carId: bookingData?.selectedCar?.car?.id,
  });

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const methods = await rootApiService.get<
          Array<{ id: string; code: string; name: string }>
        >("/admin/payment-methods/select");
        if (Array.isArray(methods)) setDbMethods(methods);
      } catch (_) {
        /* empty */
      }
    };
    fetchMethods();
  }, []);

  const toLocalDateTime = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  useEffect(() => {
    if (!bookingData) {
      message.error("Không tìm thấy thông tin đặt vé!");
      router.push("/");
    }
  }, [bookingData, router]);

  useEffect(() => {
    if (!isAuthenticated || !profile) return;
    const nameRaw = profile.customer?.name || "";
    const phoneRaw = profile.customer?.phone || "";
    const emailRaw = profile.customer?.email || profile.email || "";
    const sanitizedName = nameRaw
      .replace(/[^A-Za-zÀ-ỹà-ỹ\s'.-]/g, "")
      .slice(0, 60);
    const digits = phoneRaw.replace(/\D/g, "");
    const emailSanitized = emailRaw.trim();
    setForm((prev) => ({
      ...prev,
      name: prev.name || sanitizedName,
      phone: prev.phone || (digits ? digits.slice(0, 10) : phoneRaw),
      email: prev.email || emailSanitized,
    }));
  }, [isAuthenticated, profile]);

  if (!bookingData) return null;

  const basePrice = bookingData.totalPrice || 0;
  const insurancePrice = form.insurance
    ? 20000 * bookingData.selectedSeats.length
    : 0;
  const serviceFee = 0;
  const discount = 0;
  const totalPrice = basePrice + insurancePrice + serviceFee - discount;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const paymentMethods: PaymentMethod[] = useMemo(() => {
    const defaultPaymentMethods: PaymentMethod[] = [
      {
        id: "vnpay",
        name: "VNPay",
        icon: (
          <img
            src={VNPay}
            alt="VNPay"
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        ),
        color: "#0066cc",
        description: "Thanh toán qua cổng VNPay",
      },
    ];

    const dynamicPaymentMethods: PaymentMethod[] = (dbMethods || [])
      .filter(
        (m) => m && m.code && !["VNPAY", "CASH"].includes(m.code.toUpperCase())
      )
      .map((m) => ({
        id: (m.code || m.name || "").toLowerCase(),
        name: m.name || m.code,
        icon: (
          <img
            src={ATM}
            alt={m.name || m.code}
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        ),
        color: "#52c41a",
        description: `Thanh toán qua ${m.name || m.code}`,
      }));

    return [...defaultPaymentMethods, ...dynamicPaymentMethods];
  }, [dbMethods]);

  const validate = () => {
    const newErrors: { name?: string; phone?: string; email?: string } = {};

    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(form.phone)) {
      newErrors.phone = "Số điện thoại phải có 10 chữ số";
    }

    if (!form.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleApplyLocationChanges = useCallback(
    ({
      pickupId,
      dropoffId,
    }: {
      pickupId: string | number | null;
      dropoffId: string | number | null;
    }) => {
      if (!bookingData?.bus?.tripStops) return;
      const stops = bookingData.bus.tripStops;
      const newPickup = pickupId
        ? stops.find((s: any) => s.id === pickupId)
        : bookingData.pickupLocation;
      const newDropoff = dropoffId
        ? stops.find((s: any) => s.id === dropoffId)
        : bookingData.dropoffLocation;
      const updated = {
        ...bookingData,
        pickupLocation: newPickup || bookingData.pickupLocation,
        dropoffLocation: newDropoff || bookingData.dropoffLocation,
      };
      setBookingData(updated);
      setSelection(updated);
    },
    [bookingData, setBookingData, setSelection]
  );

  const buildBookingPayload = () => {
    const seatsArray = bookingData.selectedCar?.car?.carSeats || [];
    const bookingSeats: BookingSeatCreate[] = bookingData.selectedSeats.map(
      (seatNumber: string) => {
        const seat = seatsArray.find((s: any) => s.seatNumber === seatNumber);
        return {
          seatId: seat?.id || "",
          status: "BOOKED",
          price: basePrice / bookingData.selectedSeats.length,
        };
      }
    );
    const tripId = bookingData.tripId || bookingData.bus?.id || "";
    const bookingPayload: BookingUserCreate = {
      tripId: tripId,
      pickupStopId: bookingData.pickupLocation?.id || "",
      dropoffStopId: bookingData.dropoffLocation?.id || "",
      customerName: form.name.trim(),
      customerEmail: form.email.trim(),
      customerPhone: form.phone.trim(),
      type: paymentMethod.toUpperCase(),
      totalPrice: totalPrice,
      bookingSeats: bookingSeats,
    };
    return bookingPayload;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      message.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    if (!agreeTerms) {
      message.warning("Vui lòng đồng ý với điều khoản và điều kiện");
      return;
    }

    if (paymentMethod === "cash") {
      try {
        const response = await createBooking({
          ...buildBookingPayload(),
          type: "CASH",
        });

        showToast({
          title: "Thành công",
          message: "Đặt vé thành công!",
          type: "success",
        });

        clearSelection();
        router.push("/payment/result-booking", {
          bookingCode: response.code,
          customerName: form.name.trim(),
          customerPhone: form.phone.trim(),
          booking: response,
        });

        if (response?.id) {
          try {
            await rootApiService.post(
              API_ENDPOINTS.BOOKING.CONFIRM_PAYMENT_GUEST(response.id)
            );
            console.log("Cash payment confirmed successfully");
          } catch (error) {
            console.error("Error while confirming CASH payment:", error);
          }
          rootApiService
            .post(API_ENDPOINTS.USER_PAYMENTS, {
              bookingId: response.id,
              methodCode: "CASH",
              amount: totalPrice,
              status: "PENDING",
              transactionCode: `TX-${Date.now()}`,
              paidAt: toLocalDateTime(),
            })
            .catch((error) => {
              console.error("Error while creating CASH user payment:", error);
            });
        }
      } catch (error: any) {
        console.error("Booking error:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi đặt vé. Vui lòng thử lại!";
        showToast({ title: "Thất bại", message: errorMessage, type: "error" });
      }
      return;
    }

    setQrOpen(true);
  };

  const handleQrConfirmPaid = async () => {
    try {
      setQrLoading(true);
      if (paymentMethod === "vnpay") {
        const orderId = `ORDER-${Date.now()}`;
        try {
          const bookingPayload = buildBookingPayload();

          if (reserveSeats && seatIds.length > 0) {
            reserveSeats(seatIds, undefined, undefined, 15);
          }

          const bookingResponse = await createBooking(bookingPayload);

          if (!bookingResponse?.id) {
            throw new Error(
              "Không tạo được booking trước khi chuyển sang VNPay"
            );
          }

          const bookingMeta = {
            bookingId: bookingResponse.id,
            bookingCode: bookingResponse.code,
            customerName: bookingPayload.customerName,
            customerPhone: bookingPayload.customerPhone,
          };
          localStorage.setItem(
            `vn_booking_${orderId}`,
            JSON.stringify(bookingMeta)
          );

          try {
            await rootApiService.post(API_ENDPOINTS.USER_PAYMENTS, {
              bookingId: bookingResponse.id,
              methodCode: "VNPAY",
              amount: totalPrice,
              status: "PENDING",
              transactionCode: orderId,
              paidAt: null,
            });
          } catch (paymentError: any) {
            console.error(
              "Error while creating VNPay pending payment:",
              paymentError
            );
          }

          // 5. Gọi sang payment-service để lấy URL thanh toán VNPay
          const PAYMENT_BASE = import.meta.env.VITE_API_PAYMENT_URL; // Force localhost for payment service

          const url = `${PAYMENT_BASE}/api/create-payment?amount=${totalPrice}&orderId=${encodeURIComponent(
            orderId
          )}`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[VNPay] Error response:", errorText);
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${errorText}`
            );
          }

          const responseText = await response.text();

          const result = JSON.parse(responseText);

          if (result?.paymentUrl) {
            window.location.href = result.paymentUrl;
            return;
          } else {
            console.error("[VNPay] No paymentUrl in response:", result);
            throw new Error("Không nhận được paymentUrl từ máy chủ");
          }
        } catch (error: any) {
          console.error("[VNPay] Error while calling create-payment:", error);

          message.error(
            `VNPay Error: ${
              error?.message ||
              "Không thể chuyển đến cổng VNPay. Vui lòng thử lại hoặc chọn phương thức khác."
            }`
          );
        }
      } else {
        const response = await createBooking(buildBookingPayload());

        showToast({
          title: "Thành công",
          message: "Thanh toán thành công!",
          type: "success",
        });

        if (response?.id) {
          try {
            await rootApiService.post(
              API_ENDPOINTS.BOOKING.CONFIRM_PAYMENT_GUEST(response.id)
            );
            console.log("QR payment confirmed successfully");
          } catch (error) {
            console.error("Error while confirming QR payment:", error);
          }

          try {
            const methodCode = (paymentMethod || "momo").toUpperCase();

            await rootApiService.post(API_ENDPOINTS.USER_PAYMENTS, {
              bookingId: response.id,
              methodCode,
              amount: totalPrice,
              status: paymentMethod === "vnpay" ? "SUCCESS" : "PENDING",
              transactionCode: `TX-${Date.now()}`,
              paidAt: toLocalDateTime(),
            });
          } catch (error) {
            console.error("Error while creating QR user payment:", error);
          }
        }

        setQrOpen(false);
        clearSelection();
        router.push("/payment/result-booking", {
          bookingCode: response.code,
          customerName: form.name.trim(),
          customerPhone: form.phone.trim(),
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!";
      showToast({ title: "Thất bại", message: errorMessage, type: "error" });
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div
      style={{ background: "#f5f5f5", minHeight: "100vh", padding: "24px 0" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            Thanh toán
          </Title>
          <Text type="secondary">Hoàn tất thông tin để đặt vé của bạn</Text>
        </div>

        <Row gutter={24}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            {/* Contact Information */}
            <Card
              title={
                <Space>
                  <EnvironmentOutlined style={{ color: "#1890ff" }} />
                  <span>Thông tin liên hệ</span>
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Alert
                message="Thông tin đặt vé sẽ được gửi qua Email và SMS"
                type="info"
                showIcon
                style={{ marginBottom: 20 }}
              />

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    Họ và tên <span style={{ color: "#ff4d4f" }}>*</span>
                  </Text>
                  <Input
                    placeholder="Nguyễn Văn A"
                    size="large"
                    value={form.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((prev) => ({ ...prev, name: value }));
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    status={errors.name ? "error" : ""}
                  />
                  {errors.name && (
                    <Text type="danger" style={{ fontSize: 13, marginTop: 4 }}>
                      {errors.name}
                    </Text>
                  )}
                </div>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Số điện thoại <span style={{ color: "#ff4d4f" }}>*</span>
                    </Text>
                    <Input
                      placeholder="0912345678"
                      size="large"
                      value={form.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((prev) => ({ ...prev, phone: value }));
                        if (errors.phone)
                          setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      status={errors.phone ? "error" : ""}
                    />
                    {errors.phone && (
                      <Text
                        type="danger"
                        style={{ fontSize: 13, marginTop: 4 }}
                      >
                        {errors.phone}
                      </Text>
                    )}
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      Email <span style={{ color: "#ff4d4f" }}>*</span>
                    </Text>
                    <Input
                      placeholder="example@email.com"
                      size="large"
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((prev) => ({ ...prev, email: value }));
                        if (errors.email)
                          setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      status={errors.email ? "error" : ""}
                    />
                    {errors.email && (
                      <Text
                        type="danger"
                        style={{ fontSize: 13, marginTop: 4 }}
                      >
                        {errors.email}
                      </Text>
                    )}
                  </Col>
                </Row>

                <div>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>
                    Ghi chú (không bắt buộc)
                  </Text>
                  <Input.TextArea
                    placeholder="Ví dụ: Cần hỗ trợ hành lý thêm, dị ứng thực phẩm..."
                    rows={3}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
              </div>
            </Card>
            {/* Insurance */}
            <Card
              title={
                <Space>
                  <SafetyOutlined style={{ color: "#1890ff" }} />
                  <span>Tiện ích</span>
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <div
                style={{
                  border: "1px solid #d9d9d9",
                  borderRadius: 8,
                  padding: 16,
                  background: form.insurance ? "#e6f7ff" : "#fff",
                }}
              >
                <Checkbox
                  checked={form.insurance}
                  onChange={(e) =>
                    setForm({ ...form, insurance: e.target.checked })
                  }
                  style={{ fontSize: 15 }}
                >
                  <Text strong>
                    Bảo hiểm chuyến đi (+{(20000).toLocaleString()}đ/ghế)
                  </Text>
                </Checkbox>

                {form.insurance && (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid #e6f7ff",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size={8}
                      style={{ width: "100%" }}
                    >
                      <div>
                        <Text strong style={{ color: "#1890ff" }}>
                          ✓ Bảo hiểm tai nạn
                        </Text>
                        <br />
                        <Text style={{ fontSize: 13, color: "#666" }}>
                          Hỗ trợ viện phí lên đến 25 triệu đồng khi xảy ra tai
                          nạn
                        </Text>
                      </div>
                      <div>
                        <Text strong style={{ color: "#1890ff" }}>
                          ✓ Chính sách Hoàn Hủy
                        </Text>
                        <br />
                        <Text style={{ fontSize: 13, color: "#666" }}>
                          Hoàn 100% tiền vé nếu chuyến đi bị hủy bởi nhà xe hoặc
                          lý do bất khả kháng
                        </Text>
                      </div>
                    </Space>
                  </div>
                )}
              </div>
            </Card>
            {/* Payment Method */}
            <Card
              title={
                <Space>
                  <CreditCardOutlined style={{ color: "#1890ff" }} />
                  <span>Phương thức thanh toán</span>
                </Space>
              }
            >
              <Row gutter={[12, 12]}>
                {paymentMethods.map((method) => (
                  <Col xs={24} sm={12} key={method.id}>
                    <Button
                      size="large"
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        height: "100%",
                        width: "100%",
                        minHeight: 100,
                        padding: 16,
                        textAlign: "left",
                        border:
                          paymentMethod === method.id
                            ? `2px solid ${method.color}`
                            : "1px solid #d9d9d9",
                        background:
                          paymentMethod === method.id
                            ? `${method.color}10`
                            : "#fff",
                        transition: "all 0.3s",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          textAlign: "center",
                        }}
                      >
                        {method.icon}
                        <div>
                          <Text
                            strong
                            style={{ display: "block", color: "#000" }}
                          >
                            {method.name}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {method.description}
                          </Text>
                        </div>
                        {paymentMethod === method.id && (
                          <CheckCircleFilled
                            style={{
                              color: method.color,
                              fontSize: 18,
                              position: "absolute",
                              top: 12,
                              right: 12,
                            }}
                          />
                        )}
                      </div>
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          {/* Right Column - Summary */}
          <Col xs={24} lg={8}>
            <div style={{ position: "sticky", top: 24 }}>
              {/* Trip Summary */}
              <Card
                title="Chi tiết chuyến đi"
                style={{ marginBottom: 16, maxWidth: 600 }}
                extra={
                  <Tag color="blue">{bookingData.selectedSeats.length} ghế</Tag>
                }
              >
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {/* Tuyến đường */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Tuyến đường
                    </Text>
                    <div>
                      <Text strong style={{ fontSize: 15 }}>
                        {bookingData.bus.route.startLocation} →{" "}
                        {bookingData.bus.route.endLocation}
                      </Text>
                    </div>
                  </div>

                  <Divider style={{ margin: 0 }} />

                  {/* Giờ khởi hành */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      <CalendarOutlined /> Giờ khởi hành
                    </Text>
                    <div>
                      <Text strong style={{ fontSize: 14 }}>
                        {new Date(bookingData.bus.departureTime).toLocaleString(
                          "vi-VN",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>
                    </div>
                  </div>

                  {/* Thời gian di chuyển */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      <ClockCircleOutlined /> Thời gian di chuyển
                    </Text>
                    <div>
                      <Text strong>
                        {Math.floor(
                          bookingData.bus.route.estimatedDuration / 60
                        )}{" "}
                        giờ {bookingData.bus.route.estimatedDuration % 60} phút
                      </Text>
                      <Text style={{ marginLeft: 8, color: "#666" }}>
                        (Quãng đường: {bookingData.bus.route.distanceKm} km)
                      </Text>
                    </div>
                  </div>

                  <Divider style={{ margin: 0 }} />

                  {/* Loại xe */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Loại xe
                    </Text>
                    <div>
                      <Text strong>
                        {bookingData.selectedCar.car.carType.name}
                      </Text>
                      <Text style={{ marginLeft: 8, color: "#666" }}>
                        ({bookingData.selectedCar.car.licensePlate})
                      </Text>
                    </div>
                  </div>

                  {/* Ghế đã chọn */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Ghế đã chọn
                    </Text>
                    <div>
                      {bookingData.selectedSeats.map((seat: any) => (
                        <Tag
                          key={seat}
                          color="blue"
                          style={{
                            fontSize: 14,
                            padding: "4px 12px",
                            margin: "4px 4px 4px 0",
                          }}
                        >
                          {seat}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  <Divider style={{ margin: 0 }} />

                  {/* Điểm đón và trả với nút chỉnh sửa */}
                  <div>
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Text strong style={{ color: "#1890ff", fontSize: 13 }}>
                          <EnvironmentOutlined /> Điểm đón
                        </Text>
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => setOpenDrawer("pickup")}
                        >
                          Thay đổi
                        </Button>
                      </div>
                      <Text style={{ fontSize: 13 }}>
                        {bookingData.pickupLocation?.location || "Chưa chọn"}
                      </Text>
                    </div>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Text strong style={{ color: "#52c41a", fontSize: 13 }}>
                          <EnvironmentOutlined /> Điểm trả
                        </Text>
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => setOpenDrawer("dropoff")}
                        >
                          Thay đổi
                        </Button>
                      </div>
                      <Text style={{ fontSize: 13 }}>
                        {bookingData.dropoffLocation?.location || "Chưa chọn"}
                      </Text>
                    </div>
                  </div>
                </Space>
              </Card>

              {/* Price Summary */}
              <Card
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Tóm tắt giá</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<InfoCircleOutlined />}
                      onClick={() => setShowPriceDetail(!showPriceDetail)}
                    >
                      {showPriceDetail ? "Ẩn" : "Chi tiết"}
                    </Button>
                  </div>
                }
                style={{ marginBottom: 16 }}
              >
                {showPriceDetail && (
                  <>
                    <Space
                      direction="vertical"
                      size={8}
                      style={{ width: "100%", marginBottom: 12 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>
                          Giá vé ({bookingData.selectedSeats.length} ghế)
                        </Text>
                        <Text>{basePrice.toLocaleString()}đ</Text>
                      </div>
                      {form.insurance && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text>Bảo hiểm</Text>
                          <Text>+{insurancePrice.toLocaleString()}đ</Text>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary">Phí dịch vụ</Text>
                        <Text type="secondary">
                          {serviceFee.toLocaleString()}đ
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary">Giảm giá</Text>
                        <Text type="secondary">
                          -{discount.toLocaleString()}đ
                        </Text>
                      </div>
                    </Space>
                    <Divider style={{ margin: "12px 0" }} />
                  </>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text strong style={{ fontSize: 16 }}>
                    Tổng cộng
                  </Text>
                  <Title level={3} style={{ margin: 0, color: "#ff4d4f" }}>
                    {totalPrice.toLocaleString()}đ
                  </Title>
                </div>

                <Alert
                  message={
                    <Space>
                      <SafetyOutlined />
                      <Text style={{ fontSize: 13 }}>
                        Thanh toán an toàn & bảo mật
                      </Text>
                    </Space>
                  }
                  type="success"
                  style={{ marginBottom: 16 }}
                />

                <Checkbox
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ marginBottom: 16 }}
                >
                  <Text style={{ fontSize: 13 }}>
                    Tôi đồng ý với{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      điều khoản
                    </a>{" "}
                    và{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      chính sách
                    </a>
                  </Text>
                </Checkbox>

                <Button
                  type="primary"
                  size="large"
                  block
                  disabled={!agreeTerms}
                  loading={isPending}
                  onClick={handleSubmit}
                  style={{
                    height: 50,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                  icon={<CheckCircleFilled />}
                >
                  {isPending ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </Button>
              </Card>

              {/* Trust Badges */}
              <Card size="small">
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <CheckCircleFilled style={{ color: "#52c41a" }} />
                    <Text style={{ fontSize: 13 }}>Hỗ trợ 24/7</Text>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <SafetyOutlined style={{ color: "#52c41a" }} />
                    <Text style={{ fontSize: 13 }}>Đảm bảo hoàn tiền 100%</Text>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <CheckCircleFilled style={{ color: "#52c41a" }} />
                    <Text style={{ fontSize: 13 }}>
                      Xác nhận vé ngay lập tức
                    </Text>
                  </div>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            size="large"
            style={{ marginBottom: 16 }}
          >
            Quay lại
          </Button>
        </div>
      </div>

      {/* Booking Drawer */}
      <BookingDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        bookingData={bookingData}
        onApplyChanges={handleApplyLocationChanges}
      />
      {qrOpen && paymentMethod !== "cash" && (
        <QrPaymentModal
          open={qrOpen}
          method={paymentMethod as any}
          methodLabel={
            paymentMethods.find((m) => m.id === paymentMethod)?.name ||
            undefined
          }
          amount={totalPrice}
          onClose={() => setQrOpen(false)}
          onConfirmPaid={handleQrConfirmPaid}
          loading={qrLoading}
          status="pending"
        />
      )}
    </div>
  );
}
