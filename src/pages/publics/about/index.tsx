import {
  CheckCircleOutlined,
  CustomerServiceOutlined,
  ReadOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Timeline, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function About() {
  return (
    <div style={{ padding: "48px 20px", backgroundColor: "#f6f9f8" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Title style={{ textAlign: "center", marginBottom: 8 }}>
          Giải pháp thuyết minh tự động cho quán ăn
        </Title>
        <Paragraph style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 30px" }}>
          Nền tảng được thiết kế cho chủ quán cần chuẩn hóa thông tin món ăn, nâng cao trải nghiệm khách hàng và
          đơn giản hóa việc đào tạo nhân viên mới.
        </Paragraph>

        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 14, height: "100%" }}>
              <Title level={4}>Vấn đề thường gặp tại quán</Title>
              <Timeline
                items={[
                  {
                    color: "red",
                    children: "Khách cần hỏi nhiều lần về thành phần, cách dùng, độ cay.",
                  },
                  {
                    color: "red",
                    children: "Nội dung giới thiệu món không đồng nhất giữa các ca làm.",
                  },
                  {
                    color: "red",
                    children: "Khó nhân rộng khi quán đông khách vào giờ cao điểm.",
                  },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 14, height: "100%" }}>
              <Title level={4}>STREET FOOD GO xử lý ra sao</Title>
              <Timeline
                items={[
                  {
                    color: "green",
                    dot: <SoundOutlined style={{ color: "green" }} />,
                    children: "Mỗi món có một bài thuyết minh riêng, kích hoạt qua QR.",
                  },
                  {
                    color: "green",
                    dot: <ReadOutlined style={{ color: "green" }} />,
                    children: "Chủ quán sửa nội dung trực tiếp trên dashboard trong vài giây.",
                  },
                  {
                    color: "green",
                    dot: <CustomerServiceOutlined style={{ color: "green" }} />,
                    children: "Team kỹ thuật hỗ trợ triển khai nhanh tại cửa hàng.",
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ borderRadius: 14, marginTop: 24 }}>
          <Title level={4}>Giá trị cốt lõi</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Paragraph>
                <CheckCircleOutlined style={{ color: "#16a34a" }} /> Tăng độ chuyên nghiệp trong trình bày menu.
              </Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <Paragraph>
                <CheckCircleOutlined style={{ color: "#16a34a" }} /> Giảm tải cho nhân viên tư vấn tại bàn.
              </Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <Paragraph>
                <CheckCircleOutlined style={{ color: "#16a34a" }} /> Tạo trải nghiệm mới lạ để quay lại.
              </Paragraph>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
