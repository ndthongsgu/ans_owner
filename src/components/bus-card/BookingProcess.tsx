import type { Bus } from "@/dto/trip.dto";
import { useBookingSelectionStore } from "@/hooks/booking/useBookingSelection";
import { useRouter } from "@/routes/hooks";
import { CloseOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Badge, Button, Col, Row, Typography, message } from "antd";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import ErrorBoundary from "../base/ErrorBoundary";
import LocationSelection from "./LocationSelection";
import SeatLayout from "./SeatLayout";

const { Text } = Typography;

interface BookingProcessProps {
  bus: Bus;
  selectedCarIndex?: number;
  onClose: () => void;
}

export default memo(function BookingProcess({
  bus,
  selectedCarIndex = 0,
  onClose,
}: BookingProcessProps) {
  const router = useRouter();
  const setSelection = useBookingSelectionStore((s) => s.setSelection);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPickup, setSelectedPickup] = useState<string>("");
  const [selectedDropoff, setSelectedDropoff] = useState<string>("");
  const [seatRefreshKey, setSeatRefreshKey] = useState(0);

  const selectedCar = bus.tripCars[selectedCarIndex];

  const seats = useMemo(() => {
    return selectedCar?.car?.carSeats || [];
  }, [selectedCar]);

  const pickupLocations = useMemo(() => {
    return bus.tripStops
      .filter((stop) => stop.stopType === "PICKUP")
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [bus.tripStops]);

  const dropoffLocations = useMemo(() => {
    return bus.tripStops
      .filter((stop) => stop.stopType === "DROPOFF")
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [bus.tripStops]);

  useEffect(() => {
    if (pickupLocations.length > 0 && !selectedPickup) {
      setSelectedPickup(pickupLocations[0].id);
    }
  }, [pickupLocations, selectedPickup]);

  useEffect(() => {
    if (dropoffLocations.length > 0 && !selectedDropoff) {
      setSelectedDropoff(dropoffLocations[0].id);
    }
  }, [dropoffLocations, selectedDropoff]);

  const handleToggleSeat = useCallback(
    (seatId: string, seatNumber: string) => {
      const seat = seats.find((s) => s.id === seatId);
      if (seat?.isBooked) return;

      setSelectedSeats((prev) =>
        prev.includes(seatNumber)
          ? prev.filter((s) => s !== seatNumber)
          : [...prev, seatNumber]
      );
    },
    [seats]
  );

  const handleNeedRefresh = useCallback(() => {
    setSeatRefreshKey((prev) => prev + 1);
    setSelectedSeats([]);
  }, []);

  const totalPrice = useMemo(() => {
    if (selectedSeats.length === 0) return 0;
    return selectedSeats.length * (selectedCar?.price || bus.price);
  }, [selectedSeats, selectedCar, bus]);

  const departureTime = useMemo(() => {
    const date = new Date(bus.departureTime);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [bus.departureTime]);

  const handleContinue = useCallback(() => {
    if (currentStep === 1) {
      if (selectedSeats.length === 0) {
        message.warning("Vui lòng chọn ít nhất một ghế");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedPickup || !selectedDropoff) {
        message.warning("Vui lòng chọn điểm đón và điểm trả");
        return;
      }

      const selectedPickupLocation = pickupLocations.find(
        (p) => p.id === selectedPickup
      );
      const selectedDropoffLocation = dropoffLocations.find(
        (d) => d.id === selectedDropoff
      );

      if (!selectedPickupLocation || !selectedDropoffLocation) {
        message.error("Có lỗi xảy ra, vui lòng thử lại");
        return;
      }

      const selection = {
        bus: bus,
        tripId: selectedCar.tripId,
        selectedCar: selectedCar,
        selectedSeats: selectedSeats,
        pickupLocation: selectedPickupLocation,
        dropoffLocation: selectedDropoffLocation,
        totalPrice: totalPrice,
      };

      setSelection(selection);
      router.push("/payment", selection);
    }
  }, [
    currentStep,
    selectedSeats,
    selectedPickup,
    selectedDropoff,
    pickupLocations,
    dropoffLocations,
    bus,
    selectedCar,
    totalPrice,
    setSelection,
    router,
  ]);

  return (
    <ErrorBoundary>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fff",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col flex="auto">
              <Row align="middle" gutter={16}>
                <Col>
                  <div
                    style={{
                      height: 50,
                      width: 70,
                      background: "#f0f0f0",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      fontSize: 12,
                    }}
                  >
                    Xe
                  </div>
                </Col>
                <Col>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      {selectedCar.car.carType.name}
                    </Text>
                    <Text
                      style={{
                        marginLeft: 8,
                        fontSize: 13,
                        color: "#666",
                      }}
                    >
                      {selectedCar.car.licensePlate}
                    </Text>
                  </div>
                  <div style={{ color: "#666", fontSize: 13 }}>
                    <EnvironmentOutlined /> {departureTime} •{" "}
                    {bus.route.startLocation} → {bus.route.endLocation}
                  </div>
                </Col>
              </Row>
            </Col>
            <Col>
              <Button
                type="text"
                shape="circle"
                icon={<CloseOutlined />}
                onClick={onClose}
              />
            </Col>
          </Row>
        </div>

        <div
          style={{
            padding: "16px 24px",
            background: "#fafafa",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  background: currentStep === 1 ? "#fff" : "transparent",
                  borderRadius: 8,
                  border: currentStep === 1 ? "2px solid #1890ff" : "none",
                  cursor: currentStep === 2 ? "pointer" : "default",
                }}
                onClick={() => currentStep === 2 && setCurrentStep(1)}
              >
                <Badge count={1} style={{ background: "#1890ff" }} />
                <span style={{ marginLeft: 10, fontWeight: 500 }}>
                  Chọn ghế ({selectedSeats.length})
                </span>
              </div>
            </Col>
            <Col span={12}>
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  background: currentStep === 2 ? "#fff" : "transparent",
                  borderRadius: 8,
                  opacity: currentStep === 1 ? 0.5 : 1,
                  border: currentStep === 2 ? "2px solid #1890ff" : "none",
                }}
              >
                <Badge
                  count={2}
                  style={{
                    background: currentStep === 2 ? "#1890ff" : "#d9d9d9",
                  }}
                />
                <span style={{ marginLeft: 10, fontWeight: 500 }}>
                  Điểm đón trả
                </span>
              </div>
            </Col>
          </Row>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 24,
            background: "#f5f5f5",
          }}
        >
          {currentStep === 1 ? (
            <SeatLayout
              seats={seats}
              selectedSeats={selectedSeats}
              onToggleSeat={handleToggleSeat}
              tripId={selectedCar?.tripId}
              carId={selectedCar?.car?.id}
              onNeedRefresh={handleNeedRefresh}
            />
          ) : (
            <LocationSelection
              pickupLocations={pickupLocations}
              dropoffLocations={dropoffLocations}
              selectedPickup={selectedPickup}
              selectedDropoff={selectedDropoff}
              onSelectPickup={setSelectedPickup}
              onSelectDropoff={setSelectedDropoff}
            />
          )}
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
            background: "#fff",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <div>
                {currentStep === 2 && (
                  <Button
                    size="large"
                    onClick={() => setCurrentStep(1)}
                    style={{ marginRight: 16 }}
                  >
                    ← Quay lại
                  </Button>
                )}
              </div>
              <div style={{ marginTop: currentStep === 2 ? 8 : 0 }}>
                <Text style={{ fontSize: 14 }}>Tổng cộng: </Text>
                <Text strong style={{ fontSize: 22, color: "#ff4d4f" }}>
                  {totalPrice.toLocaleString()}đ
                </Text>
                {selectedSeats.length > 0 && (
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#666",
                      marginLeft: 8,
                    }}
                  >
                    ({selectedSeats.length} ghế x{" "}
                    {(selectedCar?.price || bus.price).toLocaleString()}đ)
                  </Text>
                )}
              </div>
            </Col>
            <Col>
              <Button
                type="primary"
                size="large"
                disabled={
                  (currentStep === 1 && selectedSeats.length === 0) ||
                  (currentStep === 2 && (!selectedPickup || !selectedDropoff))
                }
                style={{
                  minWidth: 140,
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                }}
                onClick={handleContinue}
              >
                {currentStep === 1 ? "Tiếp tục" : "Thanh toán"}
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    </ErrorBoundary>
  );
});
