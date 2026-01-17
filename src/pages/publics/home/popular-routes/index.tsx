import { useEndLocationsByStart, useStartLocations } from "@/hooks/route";
import { Card, Carousel, Empty, List, Space, Spin, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

export default function PopularRoutes() {
  // Lấy tất cả điểm xuất phát
  const { data: startLocations = [], isLoading: loadingStart } =
    useStartLocations();

  if (loadingStart)
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" />
      </div>
    );

  if (!startLocations.length)
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Empty description="Không có tuyến đường phổ biến" />
      </div>
    );

  return (
    <div
      style={{ padding: "40px 0", backgroundColor: "var(--color-background)" }}
    >
      <Typography style={{ textAlign: "center" }}>
        <Title
          style={{
            fontSize: "32px",
            color: "var(--color-primary-800)",
            fontWeight: "bold",
          }}
        >
          TUYẾN PHỔ BIẾN
        </Title>
        <Paragraph>Được khách hàng tin tưởng và lựa chọn</Paragraph>
      </Typography>

      <Carousel
        dots
        dotPosition="bottom"
        autoplay
        slidesToShow={3}
        infinite
        responsive={[
          { breakpoint: 1024, settings: { slidesToShow: 2, dots: true } },
          { breakpoint: 768, settings: { slidesToShow: 1, dots: true } },
        ]}
        style={{ padding: "12px" }}
      >
        {/* Hiển thị tối đa 5 tuyến phổ biến */}
        {startLocations.slice(0, 5).map((route, idx) => (
          <RouteCard key={idx} startLocation={route.location || ""} />
        ))}
      </Carousel>
    </div>
  );
}

function RouteCard({ startLocation }: { startLocation: string }) {
  const {
    data: endLocations = [],
    isLoading,
    error,
  } = useEndLocationsByStart(startLocation);

  return (
    <div style={{ padding: "0 8px" }}>
      <Card
        hoverable
        style={{
          borderRadius: 12,
          overflow: "hidden",
          margin: "30px 8px",
        }}
        cover={
          <img
            alt={startLocation}
            src="./background.png"
            style={{ height: 150, objectFit: "cover" }}
          />
        }
      >
        <Title level={4} style={{ marginBottom: 16 }}>
          Tuyến từ {startLocation}
        </Title>

        {isLoading ? (
          <Spin />
        ) : error ? (
          <Text type="danger">Không thể tải điểm đến</Text>
        ) : endLocations.length ? (
          <List
            dataSource={endLocations}
            renderItem={(dest) => (
              <List.Item>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong>{dest.location}</Text>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">Chưa có điểm đến</Text>
        )}
      </Card>
    </div>
  );
}
