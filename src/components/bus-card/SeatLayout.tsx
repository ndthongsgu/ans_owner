import ConnectionStatus from "@/components/connection-status";
import {
  useWebSocket,
  type SeatAvailabilityUpdate,
} from "@/hooks/useWebSocket";
import { CloseOutlined } from "@ant-design/icons";
import { Col, Row, Typography, message } from "antd";
import { memo, useCallback, useEffect, useRef, useState } from "react";

const { Text, Title } = Typography;

interface CarSeat {
  id: string;
  seatNumber: string;
  seatPosition: string;
  isBooked: boolean;
  bookedStatuses?: string[];
}

interface SeatLayoutProps {
  seats: CarSeat[];
  selectedSeats: string[];
  onToggleSeat: (seatId: string, seatNumber: string) => void;
  tripId?: string;
  carId?: string;
  onNeedRefresh?: () => void;
}

export default memo(function SeatLayout({
  seats,
  selectedSeats,
  onToggleSeat,
  tripId,
  carId,
  onNeedRefresh,
}: SeatLayoutProps) {
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [newlyBookedSeats, setNewlyBookedSeats] = useState<string[]>([]);
  const [permanentlyBookedSeats, setPermanentlyBookedSeats] = useState<
    string[]
  >([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchedRef = useRef<string>("");

  const fetchHeldSeats = useCallback(async () => {
    if (!tripId || !carId) return;

    try {
      const apiBase =
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8080/bookvexe-be-j2e";
      const response = await fetch(
        `${apiBase}/api/seats/held/${tripId}/${carId}`
      );
      const data = await response.json();

      if (data.success) {
        setReservedSeats(data.heldSeats || []);
      }
    } catch (error) {
      console.error("Error fetching held seats:", error);
    }
  }, [tripId, carId]);

  const handleSeatUpdate = useCallback(
    (update: SeatAvailabilityUpdate) => {
      if (update.action === "hold") {
        setReservedSeats((prev) => {
          const newReserved = [...prev];
          let hasChanges = false;
          update.seatIds.forEach((seatId) => {
            if (!newReserved.includes(seatId)) {
              newReserved.push(seatId);
              hasChanges = true;
            }
          });
          return hasChanges ? newReserved : prev;
        });
      } else if (update.action === "release") {
        setReservedSeats((prev) => {
          const newReserved = prev.filter(
            (seatId) => !update.seatIds.includes(seatId)
          );
          return newReserved.length !== prev.length ? newReserved : prev;
        });
      } else if (update.action === "book" || update.action === "booked") {
        setReservedSeats((prev) => {
          const newReserved = prev.filter(
            (seatId) => !update.seatIds.includes(seatId)
          );
          return newReserved.length !== prev.length ? newReserved : prev;
        });

        setNewlyBookedSeats((prev) => {
          const updated = [...prev];
          update.seatIds.forEach((seatId: string) => {
            if (!updated.includes(seatId)) {
              updated.push(seatId);
            }
          });
          return updated;
        });

        setPermanentlyBookedSeats((prev) => {
          const updated = [...prev];
          update.seatIds.forEach((seatId: string) => {
            if (!updated.includes(seatId)) {
              updated.push(seatId);
            }
          });
          return updated;
        });

        setRefreshKey((prev) => prev + 1);
        fetchHeldSeats();
        onNeedRefresh?.();
        setTimeout(() => {
          setNewlyBookedSeats((prev) => {
            const filtered = prev.filter(
              (seatId) => !update.seatIds.includes(seatId)
            );
            return filtered;
          });
        }, 5000);
      } else if (update.action === "refresh") {
        setRefreshKey((prev) => prev + 1);
        fetchHeldSeats();
        onNeedRefresh?.();
      }
    },
    [fetchHeldSeats, onNeedRefresh]
  );

  const handleError = useCallback((error: string) => {
    message.error(`Real-time update error: ${error}`);
  }, []);

  const stableTripId = useRef(tripId);
  const stableCarId = useRef(carId);

  useEffect(() => {
    if (tripId && tripId !== stableTripId.current) {
      stableTripId.current = tripId;
    }
    if (carId && carId !== stableCarId.current) {
      stableCarId.current = carId;
    }
  }, [tripId, carId]);

  const { connected } = useWebSocket({
    tripId: stableTripId.current,
    carId: stableCarId.current,
    onSeatUpdate: handleSeatUpdate,
    onError: handleError,
  });

  useEffect(() => {
    if (!connected && tripId && carId) {
      const fallbackInterval = setInterval(() => {
        console.log("[SeatLayout] 🔄 WebSocket down - using fallback refresh");
        fetchHeldSeats();
        onNeedRefresh?.();
      }, 10000);

      return () => {
        clearInterval(fallbackInterval);
      };
    }
  }, [connected, tripId, carId, fetchHeldSeats, onNeedRefresh]);

  useEffect(() => {
    if (!tripId || !carId) return;

    const fetchKey = `${tripId}-${carId}-${refreshKey}`;
    if (fetchedRef.current === fetchKey && refreshKey === 0) return;

    fetchedRef.current = fetchKey;
    fetchHeldSeats();
  }, [tripId, carId, fetchHeldSeats, refreshKey]);

  const seatsRef = useRef(seats);
  useEffect(() => {
    seatsRef.current = seats;
  }, [seats]);

  if (!seats || seats.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Text style={{ color: "#999", fontSize: 16 }}>
          Không có thông tin ghế
        </Text>
      </div>
    );
  }

  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.seatNumber.charAt(0);
    if (!acc[row]) {
      acc[row] = [];
    }
    acc[row].push(seat);
    return acc;
  }, {} as Record<string, CarSeat[]>);

  const sortedRows = Object.keys(seatsByRow).sort();
  const midPoint = Math.ceil(sortedRows.length / 2);
  const lowerFloorRows = sortedRows.slice(0, midPoint);
  const upperFloorRows = sortedRows.slice(midPoint);

  const getSeatStatus = (seat: CarSeat) => {
    if (selectedSeats.includes(seat.seatNumber)) {
      return "selected";
    }

    if (seat.isBooked || seat.bookedStatuses?.includes("BOOKED")) {
      return "sold";
    }

    if (permanentlyBookedSeats.includes(seat.id)) {
      return "sold";
    }

    if (newlyBookedSeats.includes(seat.id)) {
      return "sold";
    }

    if (reservedSeats.includes(seat.id)) {
      return "reserved";
    }

    return "available";
  };

  const getSeatTooltip = (seat: CarSeat) => {
    const status = getSeatStatus(seat);

    let tooltip = `${seat.seatNumber} - ${seat.seatPosition}`;

    if (status === "sold") {
      tooltip += " (Đã bán)";
    } else if (status === "reserved") {
      tooltip += " (Đang được đặt)";
    }

    return tooltip;
  };

  const canSelectSeat = (seat: CarSeat) => {
    const status = getSeatStatus(seat);
    return status === "available" || status === "selected";
  };

  const Seat = ({ seat }: { seat: CarSeat }) => {
    const status = getSeatStatus(seat);

    const style: React.CSSProperties = {
      width: 50,
      height: 50,
      borderRadius: 8,
      margin: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
      fontSize: 14,
      cursor: canSelectSeat(seat) ? "pointer" : "not-allowed",
      opacity: status === "sold" || status === "reserved" ? 0.5 : 1,
      position: "relative",
      border: "2px solid #ccc",
      background: "#fff",
      color: "#595959",
      transition: "all 0.2s",
    };

    switch (status) {
      case "sold":
        style.background = "#e6e6e6";
        style.borderColor = "#d9d9d9";
        style.color = "#999";
        break;
      case "reserved":
        style.background = "#fff2e8";
        style.borderColor = "#fa8c16";
        style.color = "#fa8c16";
        break;
      case "selected":
        style.background = "#52c41a";
        style.borderColor = "#389e0d";
        style.color = "#fff";
        style.transform = "scale(1.05)";
        style.boxShadow = "0 2px 8px rgba(82, 196, 26, 0.3)";
        break;
      case "available":
        style.background = "#fff";
        style.borderColor = "#1890ff";
        style.color = "#1890ff";
        break;
    }

    return (
      <div
        style={style}
        onClick={() =>
          canSelectSeat(seat) && onToggleSeat(seat.id, seat.seatNumber)
        }
        title={getSeatTooltip(seat)}
      >
        {seat.seatNumber}
        {status === "sold" && (
          <CloseOutlined
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              fontSize: 12,
              color: "#8c8c8c",
            }}
          />
        )}
        {status === "reserved" && (
          <div
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              fontSize: 10,
              color: "#fa8c16",
            }}
          >
            ⏱️
          </div>
        )}
      </div>
    );
  };

  const renderFloor = (rows: string[], isLower: boolean) => {
    return (
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: 20,
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 280,
        }}
      >
        {isLower && <div style={{ marginBottom: 16, fontSize: 28 }}>🚗</div>}
        <Title level={5} style={{ marginBottom: 16, color: "#1890ff" }}>
          {isLower ? "🚌 Tầng dưới" : "🚌 Tầng trên"}
        </Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row) => (
            <div
              key={row}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text
                style={{
                  width: 30,
                  textAlign: "center",
                  fontWeight: 600,
                  color: "#666",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
                ellipsis={false}
              >
                {row}
              </Text>
              {seatsByRow[row]
                .sort((a, b) => {
                  const numA = parseInt(a.seatNumber.slice(1));
                  const numB = parseInt(b.seatNumber.slice(1));
                  return numA - numB;
                })
                .map((seat) => (
                  <Seat key={seat.id} seat={seat} />
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const selectedSeatIds = selectedSeats
    .map((seatNumber) => {
      const seat = seats.find((s) => s.seatNumber === seatNumber);
      return seat?.id;
    })
    .filter(Boolean) as string[];

  const reservedByOthersCount = reservedSeats.filter(
    (seatId) => !selectedSeatIds.includes(seatId)
  ).length;

  return (
    <div>
      <Row gutter={32}>
        <Col span={24}>
          <div
            style={{
              marginBottom: 24,
              padding: 16,
              background: "#fafafa",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Title level={5} style={{ fontSize: 16, margin: 0 }}>
                Chú thích
              </Title>
              {tripId && <ConnectionStatus connected={connected} />}
            </div>
            <Row gutter={[24, 12]}>
              <Col span={6}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      border: "2px solid #1890ff",
                      borderRadius: 6,
                      background: "#fff",
                    }}
                  />
                  <Text>Còn trống</Text>
                </div>
              </Col>
              <Col span={6}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: "#52c41a",
                      border: "2px solid #389e0d",
                    }}
                  />
                  <Text>Đang chọn</Text>
                </div>
              </Col>
              <Col span={6}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: "#fff2e8",
                      border: "2px solid #fa8c16",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: 12,
                      }}
                    >
                      ⏱️
                    </div>
                  </div>
                  <Text>Đang được đặt</Text>
                </div>
              </Col>
              <Col span={6}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: "#e6e6e6",
                      border: "2px solid #d9d9d9",
                      position: "relative",
                    }}
                  >
                    <CloseOutlined
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: 14,
                        color: "#8c8c8c",
                      }}
                    />
                  </div>
                  <Text>Đã bán</Text>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      <Row gutter={32} justify="center">
        {lowerFloorRows.length > 0 && (
          <Col>
            <div
              style={{
                minHeight: 400,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              {renderFloor(lowerFloorRows, true)}
            </div>
          </Col>
        )}

        {upperFloorRows.length > 0 && (
          <Col>
            <div
              style={{
                minHeight: 400,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                marginTop: lowerFloorRows.length > 0 ? 65 : 0,
              }}
            >
              {renderFloor(upperFloorRows, false)}
            </div>
          </Col>
        )}
      </Row>

      <Row justify="center" style={{ marginTop: 24 }}>
        <Col>
          <div
            style={{
              padding: 16,
              background: "#e6f7ff",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <Text strong style={{ fontSize: 16 }}>
              Đã chọn: {selectedSeats.length} ghế
            </Text>
            {selectedSeats.length > 0 && (
              <Text style={{ display: "block", marginTop: 8, color: "#666" }}>
                Ghế: {selectedSeats.join(", ")}
              </Text>
            )}
            {reservedByOthersCount > 0 && (
              <Text
                style={{
                  display: "block",
                  marginTop: 4,
                  color: "#fa8c16",
                  fontSize: 12,
                }}
              >
                {reservedByOthersCount} ghế đang được đặt bởi người khác
              </Text>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
});
