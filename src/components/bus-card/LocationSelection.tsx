import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Col, Empty, Input, Row, Typography } from "antd";
import { useState } from "react";

const { Text, Title } = Typography;

interface TripStop {
  id: string;
  stopType: "PICKUP" | "DROPOFF";
  location: string;
  orderIndex: number;
}

interface LocationSelectionProps {
  pickupLocations: TripStop[];
  dropoffLocations: TripStop[];
  selectedPickup: string;
  selectedDropoff: string;
  onSelectPickup: (id: string) => void;
  onSelectDropoff: (id: string) => void;
}

export default function LocationSelection({
  pickupLocations,
  dropoffLocations,
  selectedPickup,
  selectedDropoff,
  onSelectPickup,
  onSelectDropoff,
}: LocationSelectionProps) {
  const [pickupSearch, setPickupSearch] = useState("");
  const [dropoffSearch, setDropoffSearch] = useState("");

  const filteredPickups = pickupLocations.filter((loc) =>
    loc.location.toLowerCase().includes(pickupSearch.toLowerCase())
  );

  const filteredDropoffs = dropoffLocations.filter((loc) =>
    loc.location.toLowerCase().includes(dropoffSearch.toLowerCase())
  );

  const renderLocationList = (
    locations: TripStop[],
    selectedId: string,
    onSelect: (id: string) => void,
    type: "pickup" | "dropoff"
  ) => {
    if (locations.length === 0) {
      return (
        <Empty
          description={
            type === "pickup" ? "Chưa có điểm đón nào" : "Chưa có điểm trả nào"
          }
          style={{ padding: "40px 0" }}
        />
      );
    }

    return locations.map((location, index) => (
      <div
        key={location.id}
        onClick={() => onSelect(location.id)}
        style={{
          padding: "16px",
          border:
            selectedId === location.id
              ? "2px solid #1890ff"
              : "1px solid #f0f0f0",
          borderRadius: 8,
          marginBottom: 8,
          cursor: "pointer",
          background: selectedId === location.id ? "#e6f7ff" : "#fff",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          if (selectedId !== location.id) {
            e.currentTarget.style.background = "#fafafa";
            e.currentTarget.style.borderColor = "#d9d9d9";
          }
        }}
        onMouseLeave={(e) => {
          if (selectedId !== location.id) {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.borderColor = "#f0f0f0";
          }
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <input
            type="radio"
            checked={selectedId === location.id}
            readOnly
            style={{ marginTop: 4, cursor: "pointer" }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  background: type === "pickup" ? "#1890ff" : "#52c41a",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {index + 1}
              </span>
              <Text strong style={{ fontSize: 15 }}>
                {location.location}
              </Text>
            </div>
            <Text style={{ fontSize: 13, color: "#666" }}>
              {location.stopType === "PICKUP" ? "Điểm đón" : "Điểm trả"} • Thứ
              tự: {location.orderIndex}
            </Text>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          background: "#e6f7ff",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <ExclamationCircleOutlined style={{ color: "#1890ff", fontSize: 16 }} />
        <Text style={{ fontSize: 13 }}>
          An tâm đặt vé. Đảm bảo có vé, không phụ thu với vé đã đặt.
        </Text>
      </div>

      <Row gutter={24}>
        <Col span={12}>
          <div
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: 12,
              padding: 16,
              background: "#fff",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Title level={5} style={{ fontSize: 16, margin: 0 }}>
                📍 Điểm đón
              </Title>
              <Text
                style={{
                  background: "#e6f7ff",
                  color: "#1890ff",
                  padding: "4px 12px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {pickupLocations.length} điểm
              </Text>
            </div>
            <Input
              placeholder="Tìm kiếm điểm đón..."
              value={pickupSearch}
              onChange={(e) => setPickupSearch(e.target.value)}
              style={{ marginBottom: 16 }}
              allowClear
            />
            <div style={{ maxHeight: 450, overflowY: "auto", paddingRight: 8 }}>
              {renderLocationList(
                filteredPickups,
                selectedPickup,
                onSelectPickup,
                "pickup"
              )}
            </div>
          </div>
        </Col>

        <Col span={12}>
          <div
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: 12,
              padding: 16,
              background: "#fff",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Title level={5} style={{ fontSize: 16, margin: 0 }}>
                🎯 Điểm trả
              </Title>
              <Text
                style={{
                  background: "#f6ffed",
                  color: "#52c41a",
                  padding: "4px 12px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {dropoffLocations.length} điểm
              </Text>
            </div>
            <Input
              placeholder="Tìm kiếm điểm trả..."
              value={dropoffSearch}
              onChange={(e) => setDropoffSearch(e.target.value)}
              style={{ marginBottom: 16 }}
              allowClear
            />
            <div style={{ maxHeight: 450, overflowY: "auto", paddingRight: 8 }}>
              {renderLocationList(
                filteredDropoffs,
                selectedDropoff,
                onSelectDropoff,
                "dropoff"
              )}
            </div>
          </div>
        </Col>
      </Row>

      {(selectedPickup || selectedDropoff) && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#fafafa",
            borderRadius: 8,
            border: "1px solid #e0e0e0",
          }}
        >
          <Title level={5} style={{ fontSize: 14, marginBottom: 12 }}>
            Thông tin đã chọn:
          </Title>
          <Row gutter={16}>
            {selectedPickup && (
              <Col span={12}>
                <Text style={{ color: "#666", fontSize: 13 }}>
                  <strong style={{ color: "#1890ff" }}>Điểm đón:</strong>{" "}
                  {
                    pickupLocations.find((l) => l.id === selectedPickup)
                      ?.location
                  }
                </Text>
              </Col>
            )}
            {selectedDropoff && (
              <Col span={12}>
                <Text style={{ color: "#666", fontSize: 13 }}>
                  <strong style={{ color: "#52c41a" }}>Điểm trả:</strong>{" "}
                  {
                    dropoffLocations.find((l) => l.id === selectedDropoff)
                      ?.location
                  }
                </Text>
              </Col>
            )}
          </Row>
        </div>
      )}
    </div>
  );
}
