import {
  AudioOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  ThunderboltOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Tag, Typography } from "antd";
import { Link } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/routes/routes";

const { Title, Paragraph, Text } = Typography;

export default function HomeScreen() {
  const features = [
    {
      icon: <AudioOutlined style={{ fontSize: 30, color: "#0f766e" }} />,
      title: "Thuyết minh tự động theo món",
      description:
        "Khách quét QR và nghe nội dung món ăn bằng giọng đọc tự nhiên, không cần nhân viên giới thiệu thủ công.",
    },
    {
      icon: <UserSwitchOutlined style={{ fontSize: 30, color: "#0f766e" }} />,
      title: "Quản lý nội dung tập trung",
      description:
        "Chủ quán sửa tên món, mô tả, giọng đọc và ngôn ngữ trong dashboard owner có sẵn.",
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 30, color: "#0f766e" }} />,
      title: "Theo dõi hiệu quả",
      description:
        "Xem lượt nghe, khung giờ cao điểm và món được quan tâm để tối ưu menu nhanh hơn.",
    },
  ];

  const steps = [
    "Đăng ký demo 1-1 cho quán ăn",
    "Chọn gói dịch vụ phù hợp quy mô",
    "Nhập menu và kích hoạt thuyết minh",
    "Vận hành và theo dõi trên trang quản lý",
  ];

  return (
    <div style={{ background: "#f4f7f6", paddingBottom: 60 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 20px 0",
        }}
      >
        <Card
          style={{
            borderRadius: 20,
            border: "none",
            background:
              "linear-gradient(135deg, rgba(15,118,110,0.95) 0%, rgba(22,163,74,0.9) 100%)",
          }}
          styles={{ body: { padding: "36px 30px" } }}
        >
          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Tag
              style={{
                width: "fit-content",
                color: "#0f766e",
                borderRadius: 999,
                padding: "4px 12px",
                fontWeight: 700,
                border: "none",
              }}
            >
              GIẢI PHÁP CHO CHỦ QUÁN ĂN
            </Tag>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              Hệ thống thuyết minh tự động giúp quán ăn phục vụ chuyên nghiệp
              hơn
            </Title>
            <Paragraph
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 16,
                margin: 0,
              }}
            >
              STREET FOOD GO giúp bạn biến menu thành trải nghiệm âm thanh:
              nhanh, dễ hiểu, giảm tải cho nhân viên và tăng khả năng upsell
              món.
            </Paragraph>
            <Space wrap>
              <Link to={PUBLIC_ROUTES.REGISTER}>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                >
                  Đăng ký demo
                </Button>
              </Link>
              <Link to={PUBLIC_ROUTES.LOGIN}>
                <Button size="large">Đăng nhập quản trị</Button>
              </Link>
            </Space>
          </Space>
        </Card>

        <div style={{ marginTop: 28 }}>
          <Row gutter={[20, 20]}>
            <Col xs={24} md={8}>
              <Card style={{ borderRadius: 14, height: "100%" }}>
                <Text strong>
                  <ShopOutlined /> 300+
                </Text>
                <Paragraph style={{ marginBottom: 0, marginTop: 8 }}>
                  quán ăn đã sử dụng để đồng bộ thông tin menu tại điểm bán.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={{ borderRadius: 14, height: "100%" }}>
                <Text strong>
                  <AudioOutlined /> 2 phút
                </Text>
                <Paragraph style={{ marginBottom: 0, marginTop: 8 }}>
                  để cập nhật nội dung thuyết minh cho 1 món trong dashboard.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={{ borderRadius: 14, height: "100%" }}>
                <Text strong>
                  <ThunderboltOutlined /> 24/7
                </Text>
                <Paragraph style={{ marginBottom: 0, marginTop: 8 }}>
                  hệ thống sẵn sàng phát thuyết minh, không phụ thuộc ca làm.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        <div style={{ marginTop: 30 }}>
          <Title level={3}>Giá trị bạn nhận được</Title>
          <Row gutter={[20, 20]}>
            {features.map((item) => (
              <Col xs={24} md={8} key={item.title}>
                <Card style={{ borderRadius: 14, height: "100%" }}>
                  <div style={{ marginBottom: 12 }}>{item.icon}</div>
                  <Title level={4}>{item.title}</Title>
                  <Paragraph style={{ marginBottom: 0 }}>
                    {item.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginTop: 30 }}>
          <Title level={3}>Quy trình bắt đầu</Title>
          <Card style={{ borderRadius: 14 }}>
            <Row gutter={[20, 20]}>
              {steps.map((step, index) => (
                <Col xs={24} sm={12} md={6} key={step}>
                  <Card
                    size="small"
                    style={{ borderRadius: 12, textAlign: "center" }}
                  >
                    <Tag color="green" style={{ marginBottom: 10 }}>
                      Bước {index + 1}
                    </Tag>
                    <Paragraph style={{ marginBottom: 0 }}>{step}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      </div>
    </div>
  );
}
