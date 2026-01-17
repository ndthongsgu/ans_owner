import {
  ArrowRightOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Divider, Typography } from "antd";
import { QRCodeCanvas } from "qrcode.react";

const { Text, Title } = Typography;

export default function TicketCard({ booking }: { booking: any }) {
  const seats = booking.bookingSeats
    ?.map((s: any) => s.seat?.seatNumber)
    .join(", ");

  const findCarBySeatId = (seatId: string) => {
    return booking.trip?.tripCars?.find((tripCar: any) =>
      tripCar.car?.carSeats?.some((seat: any) => seat.id === seatId)
    )?.car;
  };

  const customerCar = booking.bookingSeats?.[0]?.seat?.id
    ? findCarBySeatId(booking.bookingSeats[0].seat.id)
    : null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return {
      time: `${hours}:${minutes}`,
      date: `T${date.getDay() + 1}, ${day}/${month}/${year}`,
    };
  };

  const departureInfo = formatDateTime(booking.trip?.departureTime);

  const arrivalDate = new Date(booking.trip?.departureTime);
  arrivalDate.setMinutes(
    arrivalDate.getMinutes() + (booking.trip?.route?.estimatedDuration || 0)
  );
  const arrivalInfo = formatDateTime(arrivalDate.toISOString());

  return (
    <div
      id="ticket-image-area"
      style={{
        position: "relative",
        width: "750px",
        minHeight: "1200px",
        margin: "0 auto",
        background: "#0033CC",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "32px 40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title
            level={3}
            style={{
              color: "white",
              margin: 0,
              fontSize: "28px",
              fontWeight: 600,
            }}
          >
            Thông tin vé
          </Title>
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "24px 24px 0 0",
          padding: "32px 40px 48px",
          minHeight: "1000px",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <Text
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            Đã xác nhận
          </Text>
        </div>

        <div
          style={{
            background: "#f0f5ff",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "white",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "16px",
                color: "#0033CC",
              }}
            >
              VT
            </div>
            <div>
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  display: "block",
                  color: "#1a1a1a",
                }}
              >
                VietTravel Bus
              </Text>
              <Text style={{ fontSize: "15px", color: "#666" }}>
                Mã chuyến: {booking.trip?.id?.slice(0, 8).toUpperCase()}
              </Text>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  display: "block",
                  color: "#1a1a1a",
                }}
              >
                {booking.trip?.route?.startLocation}
              </Text>
              <Text
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  display: "block",
                  color: "#1a1a1a",
                  marginTop: "4px",
                }}
              >
                {departureInfo.time}
              </Text>
              <Text
                style={{
                  fontSize: "15px",
                  color: "#666",
                  display: "block",
                  marginTop: "4px",
                }}
              >
                {departureInfo.date}
              </Text>
            </div>

            <div
              style={{
                padding: "0 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <ArrowRightOutlined
                style={{ fontSize: "28px", color: "#0033CC" }}
              />
            </div>

            <div style={{ flex: 1, textAlign: "right" }}>
              <Text
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  display: "block",
                  color: "#1a1a1a",
                }}
              >
                {booking.trip?.route?.endLocation}
              </Text>
              <Text
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  display: "block",
                  color: "#1a1a1a",
                  marginTop: "4px",
                }}
              >
                {arrivalInfo.time}
              </Text>
              <Text
                style={{
                  fontSize: "15px",
                  color: "#666",
                  display: "block",
                  marginTop: "4px",
                }}
              >
                {arrivalInfo.date}
              </Text>
            </div>
          </div>

          <div
            style={{
              background: "#fff9e6",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ClockCircleOutlined
              style={{ color: "#d97706", fontSize: "16px" }}
            />
            <Text style={{ fontSize: "14px", color: "#92400e" }}>
              Thời gian hiển thị theo giờ địa phương
            </Text>
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Text
            style={{
              fontSize: "15px",
              color: "#666",
              display: "block",
              marginBottom: "12px",
            }}
          >
            Mã đặt chỗ
          </Text>
          <Text
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: "#0033CC",
              display: "block",
              letterSpacing: "4px",
              marginBottom: "16px",
            }}
          >
            {booking.code}
          </Text>
          <Text
            style={{
              fontSize: "14px",
              color: "#666",
              display: "block",
              marginTop: "16px",
              lineHeight: "1.6",
            }}
          >
            Dùng mã này để check-in tại quầy hoặc check-in online
          </Text>
        </div>

        <div style={{ padding: "24px 0", borderBottom: "1px solid #e5e7eb" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Text
              style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a" }}
            >
              Chi tiết giá
            </Text>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <Text style={{ fontSize: "16px", color: "#666" }}>
              Tổng số tiền
            </Text>
            <Text
              style={{ fontSize: "20px", fontWeight: 700, color: "#1a1a1a" }}
            >
              {booking.totalPrice?.toLocaleString("vi-VN")} đ
            </Text>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Text
            strong
            style={{ fontSize: 16, display: "block", marginBottom: 16 }}
          >
            Thông tin hành khách
          </Text>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            <div>
              <Text style={{ color: "#666", fontSize: 13 }}>Họ và tên</Text>
              <div style={{ marginTop: 4 }}>
                <Text strong style={{ fontSize: 15 }}>
                  {booking.customer?.name}
                </Text>
              </div>
            </div>

            <div>
              <Text style={{ color: "#666", fontSize: 13 }}>Số điện thoại</Text>
              <div style={{ marginTop: 4 }}>
                <Text strong style={{ fontSize: 15 }}>
                  {booking.customer?.phone}
                </Text>
              </div>
            </div>

            <div>
              <Text style={{ color: "#666", fontSize: 13 }}>Email</Text>
              <div style={{ marginTop: 4 }}>
                <Text strong style={{ fontSize: 15 }}>
                  {booking.customer?.email}
                </Text>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Text
            strong
            style={{ fontSize: 16, display: "block", marginBottom: 16 }}
          >
            Thông tin liên hệ
          </Text>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px 24px",
              alignItems: "start",
            }}
          >
            <div>
              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Điểm đón
              </Text>
              <Text strong style={{ fontSize: 14 }}>
                {booking.pickupStop?.location}
              </Text>
            </div>

            <div>
              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Điểm trả
              </Text>
              <Text strong style={{ fontSize: 14 }}>
                {booking.dropoffStop?.location}
              </Text>
            </div>

            <div>
              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Loại xe
              </Text>
              <Text strong style={{ fontSize: 14 }}>
                {customerCar?.carType?.name}
              </Text>
            </div>

            <div>
              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Biển số xe
              </Text>
              <Text strong style={{ fontSize: 14 }}>
                {customerCar?.licensePlate}
              </Text>
            </div>

            <div>
              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Ghế đã chọn ({booking.bookingSeats?.length} ghế)
              </Text>
              <Text strong style={{ fontSize: 14, color: "#0052CC" }}>
                {seats}
              </Text>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Trạng thái
              </Text>
              <div
                style={{
                  background:
                    booking.bookingStatus === "new" ? "#E3F2FD" : "#F1F8E9",
                  color:
                    booking.bookingStatus === "new" ? "#1976D2" : "#558B2F",
                  padding: "6px 16px",
                  borderRadius: "8px",
                  display: "inline-block",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {booking.bookingStatus === "new"
                  ? "Mới tạo"
                  : booking.bookingStatus}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Phương thức
              </Text>
              <Text strong style={{ fontSize: 14 }}>
                {booking.type === "CASH" ? "💵 Tiền mặt" : booking.type}
              </Text>
            </div>
          </div>

          <Divider style={{ margin: "16px 0" }} />

          <Text style={{ color: "#666", fontSize: 12 }}>
            Đặt vé lúc:{" "}
            {new Date(booking.createdDate).toLocaleString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <QRCodeCanvas
            value={booking.code}
            size={180}
            style={{
              padding: "16px",
              background: "white",
              borderRadius: "12px",
            }}
          />
          <Text
            style={{
              color: "#666",
              fontSize: 13,
              display: "block",
              marginTop: 16,
            }}
          >
            Quét mã để kiểm tra vé
          </Text>
        </div>

        <div
          style={{
            marginTop: 32,
            padding: "20px",
            background: "#FFF9E6",
            borderRadius: "12px",
            borderLeft: "4px solid #FFC107",
          }}
        >
          <Text
            strong
            style={{
              color: "#F57C00",
              fontSize: 14,
              display: "block",
              marginBottom: 8,
            }}
          >
            <WarningOutlined /> Lưu ý quan trọng
          </Text>
          <Text
            style={{
              color: "#666",
              fontSize: 13,
              display: "block",
              lineHeight: 1.6,
            }}
          >
            • Vui lòng có mặt tại điểm đón trước giờ khởi hành ít nhất 15 phút
            {"\n"}• Mang theo CMND/CCCD và mã đặt vé để lên xe{"\n"}• Liên hệ
            tổng đài 1900-xxxx nếu cần hỗ trợ
          </Text>
        </div>
      </div>
    </div>
  );
}
