import type { Bus } from "@/dto/trip.dto";
import {
  DownCircleOutlined,
  EnvironmentOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Tabs, Typography } from "antd";
import { useMemo, useState } from "react";
import BookingProcess from "./BookingProcess";

const { Text, Title } = Typography;

interface BusCardProps {
  bus: Bus;
}

export default function BusCard({ bus }: BusCardProps) {
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [isBookingActive, setIsBookingActive] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);

  const pickupPoints = useMemo(() => {
    return bus.tripStops
      .filter((stop) => stop.stopType === "PICKUP")
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [bus.tripStops]);

  const dropoffPoints = useMemo(() => {
    return bus.tripStops
      .filter((stop) => stop.stopType === "DROPOFF")
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [bus.tripStops]);

  const departureTime = useMemo(() => {
    const date = new Date(bus.departureTime);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [bus.departureTime]);

  const arrivalTime = useMemo(() => {
    const departure = new Date(bus.departureTime);
    const durationInMinutes = bus.route?.estimatedDuration || 0;
    if (durationInMinutes === 0) return "N/A";

    const arrival = new Date(
      departure.getTime() + durationInMinutes * 60 * 1000
    );
    return arrival.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [bus]);

  const duration = useMemo(() => {
    const minutes = bus.route?.estimatedDuration || 0;
    if (minutes === 0) return "N/A";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}p` : ""}`;
  }, [bus]);

  const selectedCar = bus.tripCars[selectedCarIndex];

  const availableSeatsCount = useMemo(() => {
    if (!selectedCar?.car?.carSeats) return 0;
    return selectedCar.car.carSeats.filter((seat) => !seat.isBooked).length;
  }, [selectedCar]);

  const totalSeatsCount = useMemo(() => {
    return selectedCar?.car?.carSeats?.length || 0;
  }, [selectedCar]);

  const tabItems = [
    {
      key: "discount",
      label: "Giảm giá",
      children: (
        <div style={{ padding: "16px 0" }}>
          <Text style={{ color: "#666" }}>
            Hiện tại chưa có chương trình giảm giá cho tuyến này.
          </Text>
        </div>
      ),
    },
    {
      key: "pickup-dropoff",
      label: "Đón/trả",
      children: (
        <div style={{ padding: "16px 0" }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ fontSize: 15, marginBottom: 12 }}>
              Lưu ý
            </Title>
            <Text style={{ color: "#666", fontSize: 14 }}>
              Các mốc thời gian đón, trả bên dưới là thời gian dự kiến. Lịch này
              có thể thay đổi tùy tình hình thực tế.
            </Text>
          </div>

          <Row gutter={48}>
            <Col span={12}>
              <Title
                level={5}
                style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}
              >
                Điểm đón ({pickupPoints.length})
              </Title>
              {pickupPoints.length > 0 ? (
                pickupPoints.map((point, index) => (
                  <div
                    key={point.id}
                    style={{
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <Text style={{ color: "#1890ff", fontWeight: 500 }}>
                      {index + 1}.
                    </Text>
                    <Text style={{ color: "#666" }}>{point.location}</Text>
                  </div>
                ))
              ) : (
                <Text style={{ color: "#999" }}>
                  Chưa có thông tin điểm đón
                </Text>
              )}
            </Col>

            <Col span={12}>
              <Title
                level={5}
                style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}
              >
                Điểm trả ({dropoffPoints.length})
              </Title>
              {dropoffPoints.length > 0 ? (
                dropoffPoints.map((point, index) => (
                  <div
                    key={point.id}
                    style={{
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}
                  >
                    <Text style={{ color: "#52c41a", fontWeight: 500 }}>
                      {index + 1}.
                    </Text>
                    <Text style={{ color: "#666" }}>{point.location}</Text>
                  </div>
                ))
              ) : (
                <Text style={{ color: "#999" }}>
                  Chưa có thông tin điểm trả
                </Text>
              )}
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "cars",
      label: "Danh sách xe",
      children: (
        <div style={{ padding: "16px 0" }}>
          <Title level={5} style={{ fontSize: 15, marginBottom: 16 }}>
            Chuyến này có {bus.tripCars.length} xe
          </Title>
          {bus.tripCars.map((tripCar, index) => {
            const availableSeats = tripCar.car.carSeats.filter(
              (seat) => !seat.isBooked
            ).length;
            const totalSeats = tripCar.car.carSeats.length;

            return (
              <div
                key={tripCar.id}
                style={{
                  marginBottom: 16,
                  padding: 16,
                  background: "#f5f5f5",
                  borderRadius: 8,
                  border:
                    selectedCarIndex === index
                      ? "2px solid #1890ff"
                      : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onClick={() => setSelectedCarIndex(index)}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                      Xe {index + 1}: {tripCar.car?.carType?.name || "N/A"}
                    </Title>
                    <Text style={{ color: "#666", display: "block" }}>
                      Biển số: {tripCar.car?.licensePlate || "N/A"}
                    </Text>
                    <Text style={{ color: "#666", display: "block" }}>
                      Tổng số ghế: {totalSeats}
                    </Text>
                    {tripCar.car?.carType?.description && (
                      <Text style={{ color: "#666", display: "block" }}>
                        Mô tả: {tripCar.car.carType.description}
                      </Text>
                    )}
                  </Col>
                  <Col>
                    <Title level={4} style={{ margin: 0, color: "#ff4d4f" }}>
                      {tripCar.price.toLocaleString()}₫
                    </Title>
                    <Text
                      style={{
                        color: availableSeats > 0 ? "#52c41a" : "#ff4d4f",
                        display: "block",
                        fontWeight: 500,
                      }}
                    >
                      {availableSeats > 0
                        ? `Còn ${availableSeats}/${totalSeats} chỗ`
                        : "Hết chỗ"}
                    </Text>
                    {selectedCarIndex === index && (
                      <Text
                        style={{
                          color: "#1890ff",
                          display: "block",
                          marginTop: 4,
                          fontWeight: 500,
                        }}
                      >
                        ✓ Đang chọn
                      </Text>
                    )}
                  </Col>
                </Row>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      key: "policy",
      label: "Chính sách",
      children: (
        <div style={{ padding: "16px 0" }}>
          <div style={{ marginBottom: 16 }}>
            <Title level={5} style={{ fontSize: 15, marginBottom: 8 }}>
              Chính sách hủy vé
            </Title>
            <Text style={{ color: "#666", display: "block", lineHeight: 1.8 }}>
              • Hủy vé trước 24h: Hoàn 80% giá trị vé
              <br />
              • Hủy vé trước 12h: Hoàn 50% giá trị vé
              <br />
              • Hủy vé trong vòng 12h: Không hoàn tiền
              <br />• Không xuất hiện: Không hoàn tiền
            </Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Title level={5} style={{ fontSize: 15, marginBottom: 8 }}>
              Chính sách đổi vé
            </Title>
            <Text style={{ color: "#666", display: "block", lineHeight: 1.8 }}>
              • Cho phép đổi vé trước 24h khi khởi hành
              <br />
              • Phí đổi vé: 10% giá trị vé
              <br />• Chỉ được đổi 1 lần duy nhất
            </Text>
          </div>

          <div>
            <Title level={5} style={{ fontSize: 15, marginBottom: 8 }}>
              Quy định hành lý
            </Title>
            <Text style={{ color: "#666", display: "block", lineHeight: 1.8 }}>
              • Hành lý xách tay: Tối đa 7kg
              <br />
              • Hành lý ký gửi: Tối đa 20kg
              <br />• Vượt quá 20kg sẽ tính phí thêm 10,000đ/kg
            </Text>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 12,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <Row wrap={false} gutter={24}>
        <Col>
          <div
            style={{
              width: 220,
              height: 160,
              background: "#f0f0f0",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            Hình ảnh xe
          </div>
        </Col>

        <Col flex="auto">
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Row justify="space-between" align="top">
              <Col>
                <Title level={4} style={{ margin: 0, fontSize: 22 }}>
                  {selectedCar?.car?.carType?.name || "N/A"}
                </Title>
                <Text style={{ color: "#666" }}>
                  {selectedCar?.car?.licensePlate || "N/A"}
                </Text>
                {bus.tripCars.length > 1 && (
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: "#1890ff" }}>
                      +{bus.tripCars.length - 1} xe khác
                    </Text>
                  </div>
                )}
              </Col>
              <Col style={{ textAlign: "right" }}>
                <Title level={3} style={{ margin: 0, color: "#ff4d4f" }}>
                  {selectedCar?.price?.toLocaleString() || "0"}₫
                </Title>
                <Text
                  style={{
                    color: availableSeatsCount > 0 ? "#52c41a" : "#ff4d4f",
                    fontWeight: 500,
                  }}
                >
                  {availableSeatsCount > 0
                    ? `Còn ${availableSeatsCount}/${totalSeatsCount} chỗ`
                    : "Hết chỗ"}
                </Text>
              </Col>
            </Row>

            <div style={{ margin: "16px 0", flex: 1 }}>
              <Row align="middle" gutter={12}>
                <Col>
                  <Text strong style={{ fontSize: 16 }}>
                    {departureTime}
                  </Text>
                </Col>
                <Col>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#d9d9d9",
                    }}
                  />
                </Col>
                <Col>
                  <Text>{bus.route.startLocation}</Text>
                </Col>
              </Row>
              <Row align="middle" gutter={12}>
                <Col style={{ padding: "4px 0 4px 8px" }}>
                  <div
                    style={{
                      borderLeft: "2px dotted #d9d9d9",
                      height: 24,
                      width: 0,
                    }}
                  />
                </Col>
                <Col>
                  <Text type="secondary">
                    {duration} • {bus.route.distanceKm}km
                  </Text>
                </Col>
              </Row>
              <Row align="middle" gutter={12}>
                <Col>
                  <Text strong style={{ fontSize: 16 }}>
                    {arrivalTime}
                  </Text>
                </Col>
                <Col>
                  <EnvironmentOutlined style={{ color: "#1890ff" }} />
                </Col>
                <Col>
                  <Text>{bus.route.endLocation}</Text>
                </Col>
              </Row>
            </div>

            <Row justify="space-between" align="middle">
              <Col>
                <Button
                  type="link"
                  onClick={() => setDetailsVisible(!detailsVisible)}
                  style={{ padding: 0 }}
                >
                  Thông tin chi tiết{" "}
                  {detailsVisible ? (
                    <UpCircleOutlined />
                  ) : (
                    <DownCircleOutlined />
                  )}
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  size="large"
                  disabled={availableSeatsCount === 0}
                  onClick={() => {
                    setDetailsVisible(true);
                    setIsBookingActive(true);
                  }}
                >
                  {availableSeatsCount === 0 ? "Hết chỗ" : "Chọn chuyến"}
                </Button>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {detailsVisible && (
        <div
          style={{
            marginTop: 24,
            borderTop: "1px solid #f0f0f0",
            paddingTop: 16,
          }}
        >
          {isBookingActive ? (
            <BookingProcess
              bus={bus}
              selectedCarIndex={selectedCarIndex}
              onClose={() => setIsBookingActive(false)}
            />
          ) : (
            <Tabs defaultActiveKey="pickup-dropoff" items={tabItems} />
          )}
        </div>
      )}
    </Card>
  );
}
