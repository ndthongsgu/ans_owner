import type { BookingQuery } from "@/dto/booking.dto";
import { useBookingList, useCancelBooking } from "@/hooks/booking";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button, Collapse } from "antd";
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle,
  CreditCard,
  Info,
  MapPin,
  Navigation,
  Route,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function BookingHistoryPage() {
  const [query] = useState<BookingQuery>({
    sortBy: "createdDate",
    sortDirection: "desc",
    page: 0,
    size: 10,
  });

  const { bookings, isLoading, refetch } = useBookingList(query);
  const cancelBooking = useCancelBooking();

  const { connected } = useWebSocket({
    tripId: "global",
    carId: "bookings",
    onSeatUpdate: (update) => {
      console.log("[BookingHistory] WebSocket update received:", update);
      if (update.action === "refresh" || update.by === "booking_confirmed") {
        console.log(
          "[BookingHistory] Booking status updated, refreshing list..."
        );
        refetch();
      }
    },
    onError: (error) => {
      console.error("[BookingHistory] Booking WebSocket error:", error);
    },
  });

  const handleCancelBooking = async (id: string, code: string) => {
    if (
      window.confirm(
        `Bạn có chắc muốn hủy vé ${code}?\n\nLưu ý: Hành động này không thể hoàn tác.`
      )
    ) {
      try {
        await cancelBooking.mutateAsync(id);
        alert("Hủy vé thành công!");
        refetch();
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Có lỗi xảy ra khi hủy vé";
        alert(message);
      }
    }
  };

  // Lọc bookings trước khi render
  const activeBookings = bookings.filter(
    (booking) =>
      !["CANCELLED", "CANCELED"].includes(booking.bookingStatus?.toUpperCase())
  );

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "await_payment":
      case "awaiting_payment":
        return {
          backgroundColor: "#fef3c7",
          color: "#92400e",
          borderColor: "#fcd34d",
        };
      case "completed":
        return {
          backgroundColor: "#d1fae5",
          color: "#065f46",
          borderColor: "#6ee7b7",
        };
      case "cancelled":
      case "canceled":
        return {
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          borderColor: "#fca5a5",
        };
      case "confirmed":
        return {
          backgroundColor: "#dbeafe",
          color: "#1e40af",
          borderColor: "#93c5fd",
        };
      case "departing":
        return {
          backgroundColor: "#e0e7ff",
          color: "#4338ca",
          borderColor: "#a5b4fc",
        };
      default:
        return {
          backgroundColor: "#f3f4f6",
          color: "#1f2937",
          borderColor: "#d1d5db",
        };
    }
  };

  const getStatusText = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "await_payment":
      case "awaiting_payment":
        return "Chờ thanh toán";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
      case "canceled":
        return "Đã hủy";
      case "confirmed":
        return "Đã xác nhận";
      case "departing":
        return "Đang khởi hành";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getPaymentTypeText = (type: string) => {
    switch (type?.toUpperCase()) {
      case "CASH":
        return "Tiền mặt";
      case "CARD":
        return "Thẻ";
      case "BANKING":
        return "Chuyển khoản";
      default:
        return type || "Chưa xác định";
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #eff6ff, #e0e7ff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                animation: "spin 1s linear infinite",
                borderRadius: "9999px",
                height: "64px",
                width: "64px",
                border: "4px solid #bfdbfe",
                borderTopColor: "#2563eb",
                margin: "0 auto",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar
                style={{ width: "24px", height: "24px", color: "#2563eb" }}
              />
            </div>
          </div>
          <p style={{ marginTop: "24px", color: "#4b5563", fontWeight: 500 }}>
            Đang tải lịch sử đặt vé...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #eff6ff, #e0e7ff)",
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: "8px",
                }}
              >
                Lịch sử đặt vé
              </h1>
              <p style={{ fontSize: "18px", color: "#4b5563" }}>
                Quản lý và theo dõi các vé xe của bạn
              </p>
            </div>
          </div>
        </div>

        {/* Booking List */}
        {activeBookings.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              padding: "64px 48px",
              textAlign: "center",
              border: "1px solid #f3f4f6",
            }}
          >
            <div style={{ color: "#d1d5db", marginBottom: "24px" }}>
              <Calendar
                style={{ width: "96px", height: "96px", margin: "0 auto" }}
              />
            </div>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "12px",
              }}
            >
              Chưa có vé nào
            </h3>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "32px",
                fontSize: "16px",
                lineHeight: 1.6,
              }}
            >
              Bạn chưa đặt vé nào. Hãy đặt vé để bắt đầu hành trình của mình!
            </p>
            <Button
              type="primary"
              size="large"
              onClick={() => (window.location.href = "/")}
            >
              Đặt vé ngay
            </Button>
          </div>
        ) : (
          <Collapse
            size="large"
            expandIcon={() => null} // ẨN ICON HOÀN TOÀN
            expandIconPosition="end" // (không cần thiết nếu ẩn, nhưng giữ cho an toàn)
            items={activeBookings.map((booking) => ({
              key: booking.id,
              label: (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#111827",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                        flexDirection: "column",
                      }}
                    >
                      {booking.code}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginLeft: "8px",
                      }}
                    >
                      Nhấn để xem chi tiết
                    </span>
                  </div>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "9999px",
                      fontSize: "13px",
                      fontWeight: 600,
                      border: "1px solid",
                      ...getStatusColor(booking.bookingStatus),
                    }}
                  >
                    {getStatusText(booking.bookingStatus)}
                  </span>
                </div>
              ),
              children: (
                <div style={{ padding: "16px 0" }}>
                  {/* Route Information */}
                  {/* Route Information - Redesigned with Arrow Flow */}
                  <div
                    style={{
                      background: "linear-gradient(to right, #f0f9ff, #e0f2fe)",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "20px",
                      overflow: "hidden",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#0369a1",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Route style={{ width: "16px", height: "16px" }} />
                      Thông tin tuyến đường
                    </h4>

                    {/* Arrow Flow Layout */}
                    <div style={{ position: "relative", marginBottom: "24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          position: "relative",
                        }}
                      >
                        {/* Start Point */}
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div
                            style={{
                              backgroundColor: "#22c55e",
                              color: "white",
                              width: "40px",
                              height: "40px",
                              borderRadius: "9999px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              margin: "0 auto 12px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          >
                            <MapPin style={{ width: "20px", height: "20px" }} />
                          </div>
                          <p
                            style={{
                              fontSize: "15px",
                              fontWeight: 600,
                              color: "#111827",
                              marginBottom: "8px",
                            }}
                          >
                            {booking.trip?.route?.startLocation || "N/A"}
                          </p>
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#4b5563",
                              backgroundColor: "#ecfdf5",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              display: "inline-block",
                            }}
                          >
                            Đón: {booking.pickupStop?.location || "N/A"}
                          </p>
                        </div>

                        {/* Arrow Line with Duration */}
                        <div
                          style={{
                            flex: 1,
                            position: "relative",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: 0,
                              right: 0,
                              height: "4px",
                              backgroundColor: "#0ea5e9",
                              transform: "translateY(-50%)",
                              zIndex: 1,
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              right: 0,
                              width: 0,
                              height: 0,
                              borderTop: "8px solid transparent",
                              borderBottom: "8px solid transparent",
                              borderLeft: "12px solid #0ea5e9",
                              transform: "translateY(-50%)",
                              zIndex: 2,
                            }}
                          />
                          <div
                            style={{
                              backgroundColor: "white",
                              padding: "4px 12px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#0369a1",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                              zIndex: 3,
                            }}
                          >
                            {booking.trip?.route?.estimatedDuration
                              ? `${Math.floor(
                                  booking.trip.route.estimatedDuration / 60
                                )}h ${
                                  booking.trip.route.estimatedDuration % 60
                                }m`
                              : "N/A"}
                          </div>
                        </div>

                        {/* End Point */}
                        <div style={{ textAlign: "center", flex: 1 }}>
                          <div
                            style={{
                              backgroundColor: "#ef4444",
                              color: "white",
                              width: "40px",
                              height: "40px",
                              borderRadius: "9999px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              margin: "0 auto 12px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          >
                            <MapPin style={{ width: "20px", height: "20px" }} />
                          </div>
                          <p
                            style={{
                              fontSize: "15px",
                              fontWeight: 600,
                              color: "#111827",
                              marginBottom: "8px",
                            }}
                          >
                            {booking.trip?.route?.endLocation || "N/A"}
                          </p>
                          <p
                            style={{
                              fontSize: "13px",
                              color: "#4b5563",
                              backgroundColor: "#fef2f2",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              display: "inline-block",
                            }}
                          >
                            Trả: {booking.dropoffStop?.location || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info Below */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        padding: "12px",
                        marginTop: "8px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "2px",
                          }}
                        >
                          Khoảng cách
                        </p>
                        <p style={{ fontWeight: 600, color: "#111827" }}>
                          {booking.trip?.route?.distanceKm
                            ? `${booking.trip.route.distanceKm} km`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "2px",
                          }}
                        >
                          Giờ xuất phát
                        </p>
                        <p style={{ fontWeight: 600, color: "#111827" }}>
                          {formatDate(booking.trip?.departureTime || "")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  {booking.trip?.tripCars &&
                    booking.trip.tripCars.length > 0 && (
                      <div
                        style={{
                          backgroundColor: "#f8fafc",
                          borderRadius: "8px",
                          padding: "16px",
                          marginBottom: "20px",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#374151",
                            marginBottom: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Car style={{ width: "16px", height: "16px" }} />
                          Thông tin phương tiện
                        </h4>
                        {booking.trip.tripCars.map((tripCar: any, idx: any) => (
                          <div
                            key={idx}
                            style={{
                              marginBottom:
                                idx < (booking.trip?.tripCars?.length || 0) - 1
                                  ? "16px"
                                  : "0",
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "16px",
                                backgroundColor: "white",
                                borderRadius: "6px",
                                padding: "12px",
                              }}
                            >
                              <div>
                                <p
                                  style={{
                                    fontSize: "12px",
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Mã xe
                                </p>
                                <p
                                  style={{ fontWeight: 500, color: "#111827" }}
                                >
                                  {tripCar.car?.code || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: "12px",
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Biển số xe
                                </p>
                                <p
                                  style={{ fontWeight: 500, color: "#111827" }}
                                >
                                  {tripCar.car?.licensePlate || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: "12px",
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Loại xe
                                </p>
                                <p
                                  style={{ fontWeight: 500, color: "#111827" }}
                                >
                                  {tripCar.car?.carType?.name || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: "12px",
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Số ghế
                                </p>
                                <p
                                  style={{ fontWeight: 500, color: "#111827" }}
                                >
                                  {tripCar.car?.carType?.seatCount || "N/A"} ghế
                                </p>
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: "12px",
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Giá vé
                                </p>
                                <p
                                  style={{ fontWeight: 500, color: "#111827" }}
                                >
                                  {formatCurrency(tripCar.price || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Seat Details */}
                  {booking.bookingSeats && booking.bookingSeats.length > 0 && (
                    <div
                      style={{
                        backgroundColor: "#fefbf3",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "20px",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#92400e",
                          marginBottom: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <CheckCircle
                          style={{ width: "16px", height: "16px" }}
                        />
                        Chi tiết ghế đã đặt
                      </h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(250px, 1fr))",
                          gap: "12px",
                        }}
                      >
                        {booking.bookingSeats.map((bs: any, idx: any) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: "white",
                              borderRadius: "6px",
                              padding: "12px",
                              border: "1px solid #fed7aa",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "8px",
                              }}
                            >
                              <span
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: "#fef3c7",
                                  color: "#92400e",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                }}
                              >
                                Ghế {bs.seat?.seatNumber}
                              </span>
                              <span
                                style={{
                                  fontSize: "12px",
                                  color:
                                    bs.status === "BOOKED"
                                      ? "#16a34a"
                                      : "#dc2626",
                                  fontWeight: 500,
                                }}
                              >
                                {bs.status}
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#4b5563",
                                marginBottom: "4px",
                              }}
                            >
                              Vị trí: {(bs.seat as any)?.seatPosition || "N/A"}
                            </p>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#4b5563",
                                marginBottom: "4px",
                              }}
                            >
                              Mã ghế: {bs.code || "N/A"}
                            </p>
                            <p style={{ fontSize: "12px", color: "#4b5563" }}>
                              Giá: {formatCurrency(bs.price || 0)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Info */}
                  <div
                    style={{
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Info style={{ width: "16px", height: "16px" }} />
                      Thông tin khách hàng
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "16px",
                        backgroundColor: "white",
                        borderRadius: "6px",
                        padding: "12px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#4b5563",
                            marginBottom: "4px",
                          }}
                        >
                          Mã khách hàng
                        </p>
                        <p style={{ fontWeight: 500, color: "#111827" }}>
                          {booking.customer?.code || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#4b5563",
                            marginBottom: "4px",
                          }}
                        >
                          Họ tên
                        </p>
                        <p style={{ fontWeight: 500, color: "#111827" }}>
                          {booking.customer?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#4b5563",
                            marginBottom: "4px",
                          }}
                        >
                          Số điện thoại
                        </p>
                        <p style={{ fontWeight: 500, color: "#111827" }}>
                          {booking.customer?.phone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#4b5563",
                            marginBottom: "4px",
                          }}
                        >
                          Email
                        </p>
                        <p style={{ fontWeight: 500, color: "#111827" }}>
                          {booking.customer?.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#4b5563",
                            marginBottom: "4px",
                          }}
                        >
                          Loại khách hàng
                        </p>
                        <p style={{ fontWeight: 500, color: "#111827" }}>
                          {booking.customer?.customerType || "Thường"}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#4b5563",
                            marginBottom: "4px",
                          }}
                        >
                          Ngày tạo tài khoản
                        </p>
                        <p style={{ fontWeight: 500, color: "#111827" }}>
                          {formatDate(booking.customer?.createdDate || "")}
                        </p>
                      </div>
                    </div>
                    {booking.customer?.description && (
                      <div
                        style={{
                          marginTop: "12px",
                          backgroundColor: "white",
                          borderRadius: "6px",
                          padding: "12px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#4b5563",
                            marginBottom: "4px",
                          }}
                        >
                          Ghi chú
                        </p>
                        <p style={{ fontWeight: 500, color: "#111827" }}>
                          {booking.customer.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Booking Timeline */}
                  <div
                    style={{
                      backgroundColor: "#f0fdf4",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#166534",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Navigation style={{ width: "16px", height: "16px" }} />
                      Lịch sử đặt vé
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "16px",
                        backgroundColor: "white",
                        borderRadius: "6px",
                        padding: "12px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#4b5563",
                            marginBottom: "4px",
                          }}
                        >
                          Ngày đặt vé
                        </p>
                        <p style={{ fontWeight: 500, color: "#111827" }}>
                          {formatDate(booking.createdDate)}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#4b5563",
                            marginBottom: "4px",
                          }}
                        >
                          Cập nhật lần cuối
                        </p>
                        <p style={{ fontWeight: 500, color: "#111827" }}>
                          {formatDate(booking.updatedDate)}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#4b5563",
                            marginBottom: "4px",
                          }}
                        >
                          Trạng thái hiện tại
                        </p>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                            ...getStatusColor(booking.bookingStatus),
                          }}
                        >
                          {getStatusText(booking.bookingStatus)}
                        </span>
                      </div>
                      {(booking as any).paymentId && (
                        <div>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#4b5563",
                              marginBottom: "4px",
                            }}
                          >
                            Mã thanh toán
                          </p>
                          <p style={{ fontWeight: 500, color: "#111827" }}>
                            {(booking as any).paymentId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: "8px",
                      padding: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CreditCard style={{ width: "16px", height: "16px" }} />
                      Chi tiết giá vé
                    </h4>
                    <div
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        padding: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            borderTop: "1px solid #e5e7eb",
                            paddingTop: "8px",
                            marginTop: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: 600,
                              color: "#111827",
                            }}
                          >
                            Tổng cộng
                          </span>
                          <span
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#2563eb",
                            }}
                          >
                            {formatCurrency(booking.totalPrice)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          <span>Phương thức thanh toán:</span>
                          <span style={{ fontWeight: 500 }}>
                            {getPaymentTypeText(booking.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "20px",
                      borderTop: "2px solid #e5e7eb",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          padding: "12px",
                          backgroundColor: getStatusColor(booking.bookingStatus)
                            .backgroundColor,
                          borderRadius: "8px",
                        }}
                      >
                        {booking.bookingStatus.toLowerCase() === "completed" ? (
                          <CheckCircle
                            style={{
                              width: "24px",
                              height: "24px",
                              color: getStatusColor(booking.bookingStatus)
                                .color,
                            }}
                          />
                        ) : booking.bookingStatus
                            .toLowerCase()
                            .includes("cancel") ? (
                          <XCircle
                            style={{
                              width: "24px",
                              height: "24px",
                              color: getStatusColor(booking.bookingStatus)
                                .color,
                            }}
                          />
                        ) : (
                          <AlertCircle
                            style={{
                              width: "24px",
                              height: "24px",
                              color: getStatusColor(booking.bookingStatus)
                                .color,
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#4b5563",
                            marginBottom: "4px",
                          }}
                        >
                          Trạng thái đặt vé
                        </p>
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: getStatusColor(booking.bookingStatus).color,
                          }}
                        >
                          {getStatusText(booking.bookingStatus)}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
                    >
                      {booking.bookingStatus.toUpperCase() ===
                        "AWAIT_PAYMENT" && (
                        <button
                          style={{
                            padding: "12px 24px",
                            backgroundColor: "#16a34a",
                            color: "white",
                            borderRadius: "8px",
                            border: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#15803d";
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#16a34a";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                          }}
                        >
                          <CreditCard
                            style={{ width: "16px", height: "16px" }}
                          />
                          Thanh toán ngay
                        </button>
                      )}

                      {(booking.bookingStatus.toUpperCase() ===
                        "AWAIT_PAYMENT" ||
                        booking.bookingStatus.toUpperCase() ===
                          "CONFIRMED") && (
                        <button
                          onClick={() =>
                            handleCancelBooking(booking.id, booking.code)
                          }
                          disabled={cancelBooking.isPending}
                          style={{
                            padding: "12px 24px",
                            backgroundColor: "#dc2626",
                            color: "white",
                            borderRadius: "8px",
                            border: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: cancelBooking.isPending
                              ? "not-allowed"
                              : "pointer",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            transition: "all 0.2s",
                            opacity: cancelBooking.isPending ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                          onMouseEnter={(e) => {
                            if (!cancelBooking.isPending) {
                              e.currentTarget.style.backgroundColor = "#b91c1c";
                              e.currentTarget.style.transform =
                                "translateY(-1px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 8px rgba(0,0,0,0.15)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!cancelBooking.isPending) {
                              e.currentTarget.style.backgroundColor = "#dc2626";
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 4px rgba(0,0,0,0.1)";
                            }
                          }}
                        >
                          <XCircle style={{ width: "16px", height: "16px" }} />
                          {cancelBooking.isPending ? "Đang hủy..." : "Hủy vé"}
                        </button>
                      )}

                      <button
                        style={{
                          padding: "12px 24px",
                          backgroundColor: "#6b7280",
                          color: "white",
                          borderRadius: "8px",
                          border: "none",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#4b5563";
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 8px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#6b7280";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 4px rgba(0,0,0,0.1)";
                        }}
                        onClick={() => window.print()}
                      >
                        <Info style={{ width: "16px", height: "16px" }} />
                        In vé
                      </button>
                    </div>
                  </div>
                </div>
              ),
            }))}
          />
        )}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
