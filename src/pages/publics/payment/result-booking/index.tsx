import type { BookingResponse } from "@/dto/booking.dto";
import { useSearchBooking } from "@/hooks/booking";
import { useToast } from "@/hooks/layout/useToast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useRouter } from "@/routes/hooks";
import rootApiService from "@/services/api.service";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  PictureOutlined,
  PrinterOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Result,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;

export default function BookingSuccessPage() {
  const location = useLocation();
  const router = useRouter();
  const showToast = useToast();

  const bookingCode = location.state?.bookingCode;
  const bookingFromNav = location.state?.booking as BookingResponse | undefined;

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const { mutateAsync: searchBooking, isPending, error } = useSearchBooking();

  const [paymentMethods, setPaymentMethods] = useState<
    Array<{ id: string; code: string; name: string }>
  >([]);

  const [allowWebSocketUpdates, setAllowWebSocketUpdates] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const findCarBySeatId = useCallback(
    (seatId: string) => {
      return booking?.trip?.tripCars?.find((tripCar: any) =>
        tripCar.car?.carSeats?.some((seat: any) => seat.id === seatId)
      )?.car;
    },
    [booking?.trip?.tripCars]
  );

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const methods = await rootApiService.get<
          Array<{ id: string; code: string; name: string }>
        >("/admin/payment-methods/select");

        if (Array.isArray(methods)) {
          setPaymentMethods(methods);
        }
      } catch (_error) {
        console.log("Failed to fetch payment methods");
      }
    };

    fetchMethods();
  }, []);

  useEffect(() => {
    if (!bookingCode) {
      router.push("/");
      return;
    }
    if (bookingFromNav) {
      setBooking(bookingFromNav);

      if (
        bookingFromNav.bookingStatus === "AWAIT_GO" ||
        bookingFromNav.bookingStatus === "COMPLETED"
      ) {
        setBookingConfirmed(true);
        setAllowWebSocketUpdates(false);
        console.log(
          "[ResultBooking] Booking from navigation is confirmed - disabling WebSocket updates"
        );
      } else {
        setAllowWebSocketUpdates(true);
      }
      return;
    }

    let isComponentMounted = true;
    const fetchBooking = async (retryCount = 0) => {
      try {
        const result = await searchBooking({
          bookingCode,
          customerName: "",
          customerPhone: "",
        });

        console.log("[ResultBooking] Fetched booking:", {
          status: result.bookingStatus,
          retryCount,
          hasSeats: result.bookingSeats?.length || 0,
        });

        if (!isComponentMounted) return;

        if (result.bookingStatus === "AWAIT_PAYMENT" && retryCount < 3) {
          console.log(
            `[ResultBooking] Booking still in AWAIT_PAYMENT, retrying immediately (attempt ${
              retryCount + 1
            })...`
          );
          if (isComponentMounted) {
            fetchBooking(retryCount + 1);
          }
          return;
        }

        setBooking(result);

        if (
          result.bookingStatus === "AWAIT_GO" ||
          result.bookingStatus === "COMPLETED"
        ) {
          setBookingConfirmed(true);
          setAllowWebSocketUpdates(false);
          console.log(
            "[ResultBooking] Booking confirmed - disabling WebSocket updates"
          );
        } else {
          setAllowWebSocketUpdates(true);
        }
      } catch (err) {
        console.error("[ResultBooking] Error fetching booking:", err);
        if (retryCount < 2 && isComponentMounted) {
          console.log(
            "[ResultBooking] Retrying fetch immediately after error..."
          );
          if (isComponentMounted) {
            fetchBooking(retryCount + 1);
          }
        } else {
          message.error(
            "Không thể tải thông tin đặt vé. Vui lòng thử lại sau."
          );
        }
      }
    };

    fetchBooking();

    return () => {
      isComponentMounted = false;
    };
  }, [bookingCode, bookingFromNav, router, searchBooking]);

  const customerCar = booking?.bookingSeats?.[0]?.seat?.id
    ? findCarBySeatId(booking?.bookingSeats[0].seat.id)
    : null;

  const tripCarId = booking?.bookingSeats?.[0]?.seat?.id
    ? findCarBySeatId(booking.bookingSeats[0].seat.id)?.id
    : undefined;

  const { connected } = useWebSocket({
    tripId: booking?.trip?.id || "global",
    carId: tripCarId || "bookings",
    onSeatUpdate: (update: any) => {
      if (bookingConfirmed) {
        console.log(
          "[ResultBooking] Booking is confirmed - ignoring all WebSocket updates to prevent reloads"
        );
        return;
      }

      if (!allowWebSocketUpdates || !booking) {
        console.log(
          "[ResultBooking] WebSocket updates disabled or no booking, ignoring update"
        );
        return;
      }

      console.log("[ResultBooking] WebSocket update received:", update);

      if (update.action === "refresh" || update.by === "booking_confirmed") {
        console.log(
          "[ResultBooking] Booking confirmation update received - refreshing for unconfirmed booking"
        );

        if (bookingCode && !bookingFromNav) {
          console.log("[ResultBooking] Refreshing unconfirmed booking data");
          searchBooking({
            bookingCode,
            customerName: "",
            customerPhone: "",
          })
            .then((result) => {
              console.log("[ResultBooking] Booking refreshed:", result);
              setBooking(result);

              if (
                result.bookingStatus === "AWAIT_GO" ||
                result.bookingStatus === "COMPLETED"
              ) {
                setBookingConfirmed(true);
                setAllowWebSocketUpdates(false);
                console.log(
                  "[ResultBooking] Booking now confirmed - disabling further updates"
                );
              }
            })
            .catch((err: any) => {
              console.error("[ResultBooking] Error refreshing booking:", err);
            });
        }
      }
    },
    onError: (error: any) => {
      console.error("[ResultBooking] WebSocket error:", error);
    },
  });

  console.log(
    "[ResultBooking] WebSocket connected:",
    connected,
    "Updates allowed:",
    allowWebSocketUpdates,
    "Booking confirmed:",
    bookingConfirmed
  );

  if (!bookingCode) return null;

  if (isPending) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f5f5f5",
        }}
      >
        <Spin size="large" tip="Đang tải thông tin đặt vé..." />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div
        style={{ background: "#f5f5f5", minHeight: "100vh", padding: "24px" }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Result
            status="error"
            title="Không thể tải thông tin đặt vé"
            subTitle="Vui lòng kiểm tra lại thông tin hoặc liên hệ bộ phận hỗ trợ"
            extra={
              <Button type="primary" onClick={() => router.push("/")}>
                Về trang chủ
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "blue";
      case "await_payment":
        return "orange";
      case "await_go":
        return "cyan";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "Mới tạo";
      case "await_payment":
        return "Chờ thanh toán";
      case "await_go":
        return "Chờ khởi hành";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (type: string) => {
    const upper = type?.toUpperCase();

    switch (upper) {
      case "MOMO":
        return "Ví MoMo";
      case "ZALOPAY":
        return "ZaloPay";
      case "VNPAY":
        return "VNPay";
      case "BANKING":
        return "Chuyển khoản ngân hàng";
      case "CASH":
        return "Tiền mặt";
      default:
        break;
    }

    const method =
      paymentMethods.find(
        (m) =>
          m.code?.toUpperCase() === upper || m.name?.toUpperCase() === upper
      ) || null;

    if (method?.name) {
      return method.name;
    }

    return type;
  };

  //  In vé
  const handlePrint = () => {
    const printContents = document.getElementById("ticket-area")?.innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow && printContents) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Vé xe ${booking.code}</title>
            <style>
              @page { size: A4; margin: 10mm; }
              body { font-family: Arial; color: #000; }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  //  Tải PDF
  const handleDownloadPDF = async () => {
    const element = document.getElementById("ticket-area");
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`VeXe_${booking.code}.pdf`);
  };

  // Tải ảnh
  const handleDownloadImage = async () => {
    if (!booking) return;

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    import("@/components/ticket/Ticket").then(
      async ({ default: TicketCard }) => {
        const ReactDOM = await import("react-dom/client");
        const root = ReactDOM.createRoot(container);
        root.render(<TicketCard booking={booking} />);

        await new Promise((resolve) => setTimeout(resolve, 300));
        const canvas = await html2canvas(container, { scale: 3 });
        const link = document.createElement("a");
        link.download = `VeXe_${booking.code}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        message.success("Đã tải ảnh vé!");
        root.unmount();
        document.body.removeChild(container);
      }
    );
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast({
      title: "Sao chép mã đặt vé",
      message: "Mã đặt vé đã được sao chép vào bộ nhớ tạm thời.",
      type: "success",
    });
  };

  return (
    <div style={{ minHeight: "100vh", padding: "24px 0" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          title={
            <Title level={2} style={{ color: "#52c41a" }}>
              Đặt vé thành công!
            </Title>
          }
          subTitle={
            <Space direction="vertical" size={4}>
              <Space align="center">
                <Text style={{ fontSize: 16 }}>
                  Mã đặt vé:{" "}
                  <Text strong style={{ fontSize: 18 }}>
                    {booking.code}
                  </Text>
                </Text>
                <Button
                  icon={<CopyOutlined />}
                  size="small"
                  onClick={() => handleCopy(booking.code)}
                  style={{
                    background: "transparent",
                    border: "none",
                  }}
                />
              </Space>
              <Text type="secondary">
                Thông tin chi tiết đã được gửi đến email và số điện thoại của
                bạn
              </Text>
            </Space>
          }
        />

        {/* Nút hành động */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Space size="middle">
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => router.push("/")}
            >
              Về trang chủ
            </Button>
            <Button
              size="large"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
            >
              In vé
            </Button>
            <Button
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleDownloadPDF}
            >
              Tải PDF
            </Button>
            <Button
              size="large"
              icon={<PictureOutlined />}
              onClick={handleDownloadImage}
            >
              Tải ảnh vé
            </Button>
          </Space>
        </div>

        <div id="ticket-area">
          {/* Important Notice */}
          <Alert
            message="Lưu ý quan trọng"
            description={
              <Space direction="vertical" size={8}>
                <Text>
                  • Vui lòng có mặt tại điểm đón trước giờ khởi hành ít nhất 15
                  phút
                </Text>
                <Text>• Mang theo CMND/CCCD và mã đặt vé để lên xe</Text>
                <Text>• Liên hệ tổng đài 1900-xxxx nếu cần hỗ trợ</Text>
              </Space>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} lg={14}>
              {/* Trip Information */}
              <Card
                title={
                  <Space>
                    <CalendarOutlined style={{ color: "#1890ff" }} />
                    <span>Thông tin chuyến đi</span>
                  </Space>
                }
                style={{ marginBottom: 24 }}
              >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  {/* Route */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Tuyến đường
                    </Text>
                    <div style={{ marginTop: 4, width: "100%" }}>
                      <Title
                        level={4}
                        style={{
                          margin: 0,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {booking.trip?.route?.startLocation}
                        <span style={{ margin: "0 8px" }}>→</span>
                        {booking.trip?.route?.endLocation}
                      </Title>
                    </div>
                  </div>
                  <Divider style={{ margin: 0 }} /> {/* Departure Time */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      <CalendarOutlined /> Thời gian khởi hành
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                        {new Date(
                          booking.trip?.departureTime || ""
                        ).toLocaleString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </div>
                  </div>
                  {/* Vehicle Info: Đã sửa để hiển thị thông tin xe chính xác */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Thông tin xe
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong style={{ fontSize: 15, display: "block" }}>
                        Biển số: {customerCar?.licensePlate} -{" "}
                        {customerCar?.carType?.name || "Chưa xác định"}
                      </Text>
                    </div>
                  </div>
                  <Divider style={{ margin: 0 }} />
                  {/* Pickup & Dropoff Timeline */}
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        display: "block",
                        marginBottom: 12,
                      }}
                    >
                      Điểm đón và điểm trả
                    </Text>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Điểm đón */}
                      <div style={{ textAlign: "center" }}>
                        <EnvironmentOutlined
                          style={{ color: "#1890ff", fontSize: 18 }}
                        />
                        <div>
                          <Text
                            strong
                            style={{ fontSize: 15, color: "#1890ff" }}
                          >
                            Điểm đón
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            <Text style={{ fontSize: 14 }}>
                              {booking.pickupStop?.location || "N/A"}
                            </Text>
                          </div>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            <ClockCircleOutlined />{" "}
                            {booking.trip?.departureTime
                              ? new Date(
                                  booking.trip.departureTime
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </Text>
                        </div>
                      </div>

                      {/* Đường nối */}
                      <div
                        style={{
                          flex: 1,
                          height: 2,
                          background: "#d9d9d9",
                          margin: "20px 8px",
                        }}
                      />

                      {/* Điểm trả */}
                      <div style={{ textAlign: "center" }}>
                        <EnvironmentOutlined
                          style={{ color: "#52c41a", fontSize: 18 }}
                        />
                        <div>
                          <Text
                            strong
                            style={{ fontSize: 15, color: "#52c41a" }}
                          >
                            Điểm trả
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            <Text style={{ fontSize: 14 }}>
                              {booking.dropoffStop?.location || "N/A"}
                            </Text>
                          </div>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            <ClockCircleOutlined />{" "}
                            {booking.trip?.departureTime &&
                            booking.trip?.route?.estimatedDuration
                              ? new Date(
                                  new Date(
                                    booking.trip.departureTime
                                  ).getTime() +
                                    booking.trip.route.estimatedDuration *
                                      60 *
                                      1000 // phút → ms
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Seats */}
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Ghế đã đặt ({booking.bookingSeats?.length || 0} ghế)
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      {booking.bookingSeats?.map((bookingSeat) => (
                        <Tag
                          key={bookingSeat.id}
                          color="blue"
                          style={{
                            fontSize: 15,
                            padding: "6px 14px",
                            margin: "4px 4px 4px 0",
                            fontWeight: 600,
                          }}
                        >
                          {bookingSeat.seat?.seatNumber ||
                            bookingSeat.seat?.name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Space>
              </Card>
              {/* Customer Information */}
              <Card
                title={
                  <Space>
                    <UserOutlined style={{ color: "#1890ff" }} />
                    <span>Thông tin khách hàng</span>
                  </Space>
                }
                style={{ marginBottom: 24 }}
              >
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <UserOutlined style={{ fontSize: 18, color: "#666" }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Họ và tên
                      </Text>
                      <div>
                        <Text strong style={{ fontSize: 15 }}>
                          {booking.customer?.name}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <Divider style={{ margin: 0 }} />
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <PhoneOutlined style={{ fontSize: 18, color: "#666" }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Số điện thoại
                      </Text>
                      <div>
                        <Text strong style={{ fontSize: 15 }}>
                          {booking.customer?.phone}
                        </Text>
                      </div>
                    </div>
                  </div>
                  {booking.customer?.email && (
                    <>
                      <Divider style={{ margin: 0 }} />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <MailOutlined style={{ fontSize: 18, color: "#666" }} />
                        <div>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Email
                          </Text>
                          <div>
                            <Text strong style={{ fontSize: 15 }}>
                              {booking.customer.email}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Space>
              </Card>
            </Col>
            {/* Right Column */}
            <Col xs={24} lg={10}>
              {/* Booking Summary */}
              <Card title="Thông tin đặt vé" style={{ marginBottom: 24 }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text type="secondary">Mã đặt vé</Text>
                    <Text strong style={{ fontSize: 15 }}>
                      {booking.code}
                    </Text>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text type="secondary">Trạng thái</Text>
                    <Tag color={getStatusColor(booking.bookingStatus)}>
                      {getStatusText(booking.bookingStatus)}
                    </Tag>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text type="secondary">Phương thức thanh toán</Text>
                    <Text strong>{getPaymentMethodText(booking.type)}</Text>
                  </div>
                  <Divider style={{ margin: "8px 0" }} />
                  {/* Price Breakdown */}
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text type="secondary">Giá vé</Text>
                    <Text>{booking.totalPrice.toLocaleString()}đ</Text>
                  </div>
                  <Divider style={{ margin: "8px 0" }} />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      background: "#f0f5ff",
                      borderRadius: 8,
                    }}
                  >
                    <Text strong style={{ fontSize: 16 }}>
                      Tổng cộng
                    </Text>
                    <Title level={3} style={{ margin: 0, color: "#ff4d4f" }}>
                      {booking.totalPrice.toLocaleString()}đ
                    </Title>
                  </div>
                  {booking.createdDate && (
                    <>
                      <Divider style={{ margin: "8px 0" }} />
                      <div style={{ textAlign: "center" }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Đặt vé lúc:
                          {new Date(booking.createdDate).toLocaleString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Text>
                      </div>
                    </>
                  )}
                </Space>
              </Card>
              {/* Support Card */}
              <Card title="Hỗ trợ khách hàng" style={{ marginBottom: 24 }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <div style={{ marginBottom: 0 }}>
                    <PhoneOutlined
                      style={{ color: "#1890ff", marginRight: 8 }}
                    />
                    <Text strong>Hotline: </Text>
                    <a href="tel:1900xxxx">1900-xxxx</a>
                  </div>
                  <div style={{ marginBottom: 0 }}>
                    <MailOutlined
                      style={{ color: "#1890ff", marginRight: 8 }}
                    />
                    <Text strong>Email: </Text>
                    <a href="mailto:support@example.com">support@example.com</a>
                  </div>
                  <Divider style={{ margin: "12px 0" }} />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Thời gian hỗ trợ: 24/7
                  </Text>
                </Space>
              </Card>
              {/* Policies */}
              <Card size="small" title="Chính sách">
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <Text style={{ fontSize: 13 }}>
                    • Hoàn tiền 100% nếu hủy trước 24h
                  </Text>
                  <Text style={{ fontSize: 13 }}>
                    • Hoàn 70% nếu hủy trước 12h
                  </Text>
                  <Text style={{ fontSize: 13 }}>
                    • Hoàn 50% nếu hủy trước 6h
                  </Text>
                  <Text style={{ fontSize: 13 }}>
                    • Không hoàn tiền nếu hủy trong vòng 6h
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      <div id="ticket-image-area" style={{ display: "none" }}></div>

      {/* In chỉ 1 trang */}
      <style>
        {`
          @media print {
            .ant-btn,
            .ant-alert {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 10mm;
            }
          }
        `}
      </style>
    </div>
  );
}
