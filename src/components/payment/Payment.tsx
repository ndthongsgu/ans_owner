import { EnvironmentOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Button, Divider, Drawer, Radio, Tabs, Tag, Typography } from "antd";
import { memo, useState } from "react";

const { Text, Title } = Typography;

interface LocationItem {
  id: string | number;
  time?: string;
  date?: string;
  name: string;
  address?: string;
  badge?: string;
  mapUrl?: string;
}

interface Props {
  openDrawer: "detail" | "pickup" | "dropoff" | null;
  setOpenDrawer: (value: "detail" | "pickup" | "dropoff" | null) => void;
  bookingData?: any;
  onApplyChanges?: (payload: {
    pickupId: string | number | null;
    dropoffId: string | number | null;
  }) => void;
}

function BookingDrawer({
  openDrawer,
  setOpenDrawer,
  bookingData,
  onApplyChanges,
}: Props) {
  const [selectedPickup, setSelectedPickup] = useState<string | number | null>(
    bookingData?.pickupLocation?.id ?? null
  );
  const [selectedDropoff, setSelectedDropoff] = useState<
    string | number | null
  >(bookingData?.dropoffLocation?.id ?? null);

  if (!bookingData) return null;

  const pickupList: LocationItem[] = Array.isArray(bookingData?.bus?.tripStops)
    ? bookingData.bus.tripStops
        .filter((s: any) => s.stopType === "PICKUP")
        .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
        .map((s: any) => ({ id: s.id, name: s.location }))
    : [];

  const dropoffList: LocationItem[] = Array.isArray(bookingData?.bus?.tripStops)
    ? bookingData.bus.tripStops
        .filter((s: any) => s.stopType === "DROPOFF")
        .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
        .map((s: any) => ({ id: s.id, name: s.location }))
    : [];

  const renderLocationList = (
    list: LocationItem[] = [],
    selectedValue: string | number | null,
    onChange: (val: string | number) => void
  ) => {
    if (!Array.isArray(list) || list.length === 0) {
      return (
        <div style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
          Không có dữ liệu điểm đón/trả.
        </div>
      );
    }

    return (
      <Radio.Group
        onChange={(e) => onChange(e.target.value)}
        value={selectedValue}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {list.map((loc) => (
          <Radio key={loc.id} value={loc.id} style={{ width: "100%" }}>
            <div
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                padding: 10,
                background: loc.id === selectedValue ? "#e6f4ff" : "#fff",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  {loc.time && (
                    <div>
                      <Text strong style={{ fontSize: 15 }}>
                        {loc.time}{" "}
                      </Text>
                      {loc.date && (
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          ({loc.date})
                        </Text>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 4 }}>
                    <Text style={{ fontWeight: 500, fontSize: 15 }}>
                      {loc.name}
                    </Text>
                  </div>

                  {loc.address && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {loc.address}
                      </Text>
                    </div>
                  )}

                  {loc.badge && (
                    <Tag
                      color="green"
                      style={{
                        fontSize: 12,
                        marginTop: 4,
                        borderRadius: 4,
                        padding: "0 6px",
                      }}
                    >
                      {loc.badge}
                    </Tag>
                  )}
                </div>

                <Button
                  type="link"
                  size="small"
                  icon={<EnvironmentOutlined />}
                  onClick={() => window.open(loc.mapUrl || "#", "_blank")}
                  style={{ fontSize: 13 }}
                >
                  Bản đồ
                </Button>
              </div>
            </div>
          </Radio>
        ))}
      </Radio.Group>
    );
  };

  return (
    <Drawer
      title={
        openDrawer === "detail"
          ? "Chi tiết chuyến đi"
          : openDrawer === "pickup"
          ? "Thay đổi điểm đón"
          : "Thay đổi điểm trả"
      }
      placement="right"
      width={420}
      onClose={() => setOpenDrawer(null)}
      open={!!openDrawer}
      footer={
        openDrawer !== "detail" && (
          <Button
            type="primary"
            block
            onClick={() => {
              onApplyChanges?.({
                pickupId: selectedPickup,
                dropoffId: selectedDropoff,
              });
              setOpenDrawer(null);
            }}
            style={{ height: 40, fontWeight: 600 }}
          >
            Lưu thay đổi
          </Button>
        )
      }
    >
      {openDrawer === "detail" && bookingData.bus && (
        <div style={{ fontSize: 15 }}>
          <div style={{ marginBottom: 10 }}>
            <Title level={5} style={{ margin: 0 }}>
              {bookingData.bus.company}
            </Title>
            <Text type="secondary">
              {bookingData.bus.departureLocation} →{" "}
              {bookingData.bus.arrivalLocation}
            </Text>
          </div>

          <Divider style={{ margin: "10px 0" }} />

          <div style={{ lineHeight: "28px" }}>
            <Text strong>Giờ khởi hành:</Text> {bookingData.bus.departureTime}
            <br />
            <Text strong>Giờ đến:</Text> {bookingData.bus.arrivalTime}
            <br />
            <Text strong>Loại xe:</Text> {bookingData.bus.busType}
            <br />
            <Text strong>Ghế đã chọn:</Text>{" "}
            {(bookingData.selectedSeats || []).join(", ")}
            <br />
            <Text strong>Tạm tính:</Text>{" "}
            <span style={{ color: "#1677ff", fontWeight: 600 }}>
              {bookingData.totalPrice?.toLocaleString()}đ
            </span>
          </div>

          <Divider style={{ margin: "10px 0" }} />

          <Text type="secondary">
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            Thay đổi điểm đón/trả có thể ảnh hưởng đến giá vé và thời gian.
          </Text>
        </div>
      )}

      {(openDrawer === "pickup" || openDrawer === "dropoff") && (
        <Tabs
          defaultActiveKey="soonest"
          items={[
            {
              key: "soonest",
              label: "Sớm nhất",
              children: renderLocationList(
                openDrawer === "pickup" ? pickupList : dropoffList,
                openDrawer === "pickup" ? selectedPickup : selectedDropoff,
                openDrawer === "pickup"
                  ? (val) => setSelectedPickup(String(val))
                  : (val) => setSelectedDropoff(String(val))
              ),
            },
            {
              key: "latest",
              label: "Gần nhất",
              children: (
                <div
                  style={{
                    textAlign: "center",
                    color: "#999",
                    marginTop: 20,
                  }}
                >
                  (Tính năng “Gần nhất” đang được cập nhật)
                </div>
              ),
            },
          ]}
        />
      )}
    </Drawer>
  );
}

export default memo(BookingDrawer);
