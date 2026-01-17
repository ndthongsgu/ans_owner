import {
  ClockCircleOutlined,
  CreditCardOutlined,
  CustomerServiceOutlined,
  GlobalOutlined,
  SafetyOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Card, Col, Row } from "antd";
import BusStationCarousel from "./bus-station";
import MapSolution from "./map-solution";
import PanelSection from "./panel";
import PopularRoutes from "./popular-routes";
import SocialLinkPage from "./social-link";

export default function HomeScreen() {
  const iconStyle = {
    fontSize: "2rem",
    color: "var(--color-primary-600)",
  };

  const features = [
    {
      icon: <SafetyOutlined style={iconStyle} />,
      title: "An toàn tuyệt đối",
      description: "Đội ngũ tài xế chuyên nghiệp, xe được bảo dưỡng định kỳ",
    },
    {
      icon: <ClockCircleOutlined style={iconStyle} />,
      title: "Đúng giờ",
      description: "Cam kết đúng giờ khởi hành, không để khách hàng chờ đợi",
    },
    {
      icon: <CreditCardOutlined style={iconStyle} />,
      title: "Thanh toán linh hoạt",
      description:
        "Hỗ trợ nhiều hình thức thanh toán: thẻ, ví điện tử, tiền mặt",
    },
    {
      icon: <CustomerServiceOutlined style={iconStyle} />,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn",
    },
    {
      icon: <TrophyOutlined style={iconStyle} />,
      title: "Chất lượng cao",
      description: "Xe hiện đại, ghế êm ái, điều hòa mát lạnh",
    },
    {
      icon: <GlobalOutlined style={iconStyle} />,
      title: "Mạng lưới rộng",
      description: "Phủ sóng toàn quốc với nhiều tuyến xe đa dạng",
    },
  ];

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "var(--color-background)",
        color: "var(--color-text-primary)",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "40px 0",
        }}
      >
        <PanelSection />
      </div>

      <div style={{ marginTop: 420 }}>
        <PopularRoutes />
      </div>

      <div style={{ marginTop: 10 }}>
        <SocialLinkPage />
      </div>

      <div style={{ margin: 10 }}>
        <MapSolution />
      </div>

      <div style={{}}>
        <BusStationCarousel />
      </div>

      <div
        style={{
          marginBottom: 50,
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "32px",
              color: "var(--color-primary-800)",
              fontWeight: "bold",
            }}
          >
            Tại sao chọn VietTravel?
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--color-text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Chúng tôi cam kết mang đến cho bạn trải nghiệm di chuyển tốt nhất
          </p>
        </div>

        <Row gutter={[32, 32]}>
          {features.map((f, i) => (
            <Col xs={24} sm={12} md={8} lg={8} key={i}>
              <Card
                hoverable
                style={{
                  textAlign: "center",
                  borderRadius: "var(--radius-card)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-md)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  height: "100%",
                  backgroundColor: "var(--color-surface)",
                }}
                styles={{ body: { padding: 24 } }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
              >
                <div style={{ marginBottom: 24 }}>{f.icon}</div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    marginBottom: 12,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {f.description}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
