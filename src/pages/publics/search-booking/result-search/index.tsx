import { Steering_Wheel } from "@/assets/icons";
import { useRouter } from "@/routes/hooks";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  QrcodeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Tag, Typography } from "antd";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;

type SeatStatus = "X" | "O" | "S";

const Seat = ({ status }: { status: SeatStatus }) => {
  const style: React.CSSProperties = {
    width: 25,
    height: 30,
    border: "2px solid #ccc",
    borderRadius: 8,
    margin: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
  };

  if (status === "X") {
    style.background = "#e6e6e6";
    style.borderColor = "#d9d9d9";
    style.color = "#999";
  }
  if (status === "S") {
    style.background = "#52c41a";
    style.borderColor = "#389e0d";
    style.color = "#fff";
    style.fontWeight = "bold";
  }

  return <div style={style}></div>;
};

const BookingResultPage: React.FC = () => {
  const location = useLocation();
  const router = useRouter();
  const bookingData = location.state?.bookingData;

  useEffect(() => {
    if (!bookingData) {
      router.replace("/search-booking");
    }
  }, [bookingData, router]);

  if (!bookingData) {
    return null;
  }

  const {
    code,
    customer,
    trip,
    bookingSeats,
    pickupStop,
    dropoffStop,
    totalPrice,
    bookingStatus,
    type: paymentType,
  } = bookingData;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const bookedSeatNumbers = bookingSeats
    .map((bs: any) => bs.seat.seatNumber)
    .join(", ");

  const firstBookedSeatId = bookingSeats[0]?.seat?.id;
  const bookedCar = trip.tripCars.find((tc: any) =>
    tc.car.carSeats.some((seat: any) => seat.id === firstBookedSeatId)
  )?.car;

  const createSeatMap = () => {
    if (!bookedCar || !bookedCar.carSeats) return { lower: [], upper: [] };

    const bookedSeatIds = new Set(bookingSeats.map((bs: any) => bs.seat.id));
    const seats = bookedCar.carSeats;
    const sortedSeats = [...seats].sort((a, b) => {
      const aRow = a.seatNumber.charAt(0);
      const bRow = b.seatNumber.charAt(0);
      if (aRow !== bRow) return aRow.localeCompare(bRow);
      const aNum = parseInt(a.seatNumber.slice(1));
      const bNum = parseInt(b.seatNumber.slice(1));
      return aNum - bNum;
    });

    const rows: SeatStatus[][] = [];
    for (let i = 0; i < sortedSeats.length; i += 3) {
      const row: SeatStatus[] = [];
      for (let j = 0; j < 3 && i + j < sortedSeats.length; j++) {
        const seat = sortedSeats[i + j];
        row.push(bookedSeatIds.has(seat.id) ? "S" : "O");
      }
      rows.push(row);
    }

    const mid = Math.ceil(rows.length / 2);
    return {
      lower: rows.slice(0, mid),
      upper: rows.slice(mid),
    };
  };

  const seatMap = createSeatMap();

  return (
    <div
      style={{
        margin: "0px auto",
        padding: 24,
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={24}>
          <Card
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              position: "relative",
              border: "none",
              marginBottom: 40,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background:
                  bookingStatus === "new"
                    ? "rgba(82, 196, 26, 0.95)"
                    : "#faad14",
                color: "#fff",
                fontWeight: "600",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                zIndex: 10,
              }}
            >
              {bookingStatus === "new" ? "Đã xác nhận" : "Đang xử lý"}
            </div>

            <div
              style={{
                background: "#fff",
                padding: "32px 28px",
                position: "relative",
              }}
            >
              {/* Header with booking code */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "24px",
                  paddingBottom: "20px",
                  borderBottom: "2px dashed #e0e0e0",
                }}
              >
                <div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Mã đặt vé
                  </Text>
                  <Text
                    strong
                    style={{
                      fontSize: "22px",
                      color: "#667eea",
                      letterSpacing: "1px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <QrcodeOutlined /> {code}
                  </Text>
                  <Tag
                    color={paymentType === "MOMO" ? "magenta" : "blue"}
                    style={{ marginTop: "8px" }}
                  >
                    {paymentType}
                  </Tag>
                </div>
              </div>

              {/* Route Info */}
              <div style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <EnvironmentOutlined
                        style={{ color: "#52c41a", fontSize: "16px" }}
                      />
                      <Text style={{ fontSize: "12px", color: "#999" }}>
                        Điểm đón
                      </Text>
                    </div>
                    <Text
                      strong
                      style={{
                        fontSize: "20px",
                        color: "#333",
                        display: "block",
                      }}
                    >
                      {pickupStop.location}
                    </Text>
                    <Text
                      style={{
                        fontSize: "15px",
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "6px",
                      }}
                    >
                      <ClockCircleOutlined /> {formatTime(trip.departureTime)}
                    </Text>
                  </div>

                  <div
                    style={{
                      padding: "0 32px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: "120px",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        marginBottom: "6px",
                      }}
                    >
                      {trip.route.distanceKm} km
                    </Text>
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "2px",
                        background:
                          "linear-gradient(to right, #667eea, #764ba2)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          right: "-8px",
                          top: "-5px",
                          width: "0",
                          height: "0",
                          borderLeft: "10px solid #764ba2",
                          borderTop: "6px solid transparent",
                          borderBottom: "6px solid transparent",
                        }}
                      />
                    </div>
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        marginTop: "6px",
                      }}
                    >
                      {Math.round(trip.route.estimatedDuration / 60)} giờ
                    </Text>
                  </div>

                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        justifyContent: "flex-end",
                        marginBottom: "6px",
                      }}
                    >
                      <Text style={{ fontSize: "12px", color: "#999" }}>
                        Điểm trả
                      </Text>
                      <EnvironmentOutlined
                        style={{ color: "#f5222d", fontSize: "16px" }}
                      />
                    </div>
                    <Text
                      strong
                      style={{
                        fontSize: "20px",
                        color: "#333",
                        display: "block",
                      }}
                    >
                      {dropoffStop.location}
                    </Text>
                    <Text
                      style={{
                        fontSize: "15px",
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "6px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <ClockCircleOutlined /> ~
                      {formatTime(
                        new Date(
                          new Date(trip.departureTime).getTime() +
                            trip.route.estimatedDuration * 60000
                        ).toISOString()
                      )}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Trip Details Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                  marginBottom: "24px",
                  background: "#fafafa",
                  padding: "16px",
                  borderRadius: "12px",
                }}
              >
                <div>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#999",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    <CalendarOutlined /> Ngày đi
                  </Text>
                  <Text strong style={{ fontSize: "14px", color: "#333" }}>
                    {formatDate(trip.departureTime)}
                  </Text>
                </div>

                <div>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#999",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Biển số xe
                  </Text>
                  <Text strong style={{ fontSize: "14px", color: "#333" }}>
                    {bookedCar?.licensePlate || "N/A"}
                  </Text>
                </div>
                <div>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#999",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Loại xe
                  </Text>
                  <Text strong style={{ fontSize: "14px", color: "#333" }}>
                    {bookedCar?.carType.name || "N/A"}
                  </Text>
                </div>
                <div>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Số ghế
                  </Text>
                  <Text strong style={{ fontSize: "16px", color: "#667eea" }}>
                    {bookedSeatNumbers}
                  </Text>
                </div>
              </div>

              {/* Passenger Info */}
              <div
                style={{
                  background: "#f0f5ff",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  border: "1px solid #d6e4ff",
                }}
              >
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  Thông tin hành khách
                </Text>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <UserOutlined style={{ color: "#667eea" }} />{" "}
                    {customer.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <PhoneOutlined style={{ color: "#667eea" }} />{" "}
                    {customer.phone}
                  </Text>
                </div>
              </div>

              {/* Total Price */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "16px",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: "12px",
                    display: "block",
                    marginBottom: "4px",
                    opacity: 0.9,
                  }}
                >
                  Tổng tiền
                </Text>
                <Text
                  strong
                  style={{
                    color: "#fff",
                    fontSize: "28px",
                    letterSpacing: "1px",
                  }}
                >
                  {formatPrice(totalPrice)}
                </Text>
              </div>
            </div>

            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                left: "-12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "24px",
                height: "24px",
                background: "#f5f5f5",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "-12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "24px",
                height: "24px",
                background: "#f5f5f5",
                borderRadius: "50%",
              }}
            />
          </Card>
          <Card
            style={{
              borderRadius: 20,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              border: "none",
            }}
          >
            <Title level={5} style={{ marginBottom: 16, textAlign: "center" }}>
              Sơ đồ ghế - {bookedCar?.carType.name || ""}
            </Title>

            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 20,
                justifyContent: "center",
                flexWrap: "wrap",
                padding: "12px",
                background: "#fafafa",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Seat status="S" />{" "}
                <span style={{ fontSize: "13px" }}>Ghế đã đặt</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Seat status="O" />{" "}
                <span style={{ fontSize: "13px" }}>Ghế trống</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Seat status="X" />{" "}
                <span style={{ fontSize: "13px" }}>Không khả dụng</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
              {/* Lower floor */}
              {seatMap.lower.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: 20,
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    border: "2px solid #e0e0e0",
                  }}
                >
                  <div
                    style={{
                      marginBottom: 12,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={Steering_Wheel}
                      alt="Steering"
                      width={32}
                      height={32}
                    />
                  </div>
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      textAlign: "center",
                      color: "#666",
                      fontSize: "13px",
                    }}
                  >
                    Tầng dưới
                  </h4>
                  {seatMap.lower.map((row, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      {row.map((s, j) => (
                        <Seat key={j} status={s as SeatStatus} />
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Upper floor */}
              {seatMap.upper.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: 20,
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    border: "2px solid #e0e0e0",
                  }}
                >
                  <div style={{ marginBottom: 12, height: 32 }}></div>
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      textAlign: "center",
                      color: "#666",
                      fontSize: "13px",
                    }}
                  >
                    Tầng trên
                  </h4>
                  {seatMap.upper.map((row, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      {row.map((s, j) => (
                        <Seat key={j} status={s as SeatStatus} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BookingResultPage;
