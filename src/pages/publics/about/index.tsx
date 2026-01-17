import { Card, Col, Divider, Image, Row, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function About() {
  const sections = [
    {
      title: "Sứ mệnh của chúng tôi",
      text: "VietTravel cam kết mang đến trải nghiệm đặt vé xe nhanh chóng, tiện lợi và an toàn nhất cho khách hàng. Chúng tôi không ngừng đổi mới để giúp mọi hành trình của bạn trở nên dễ dàng hơn.",
      img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Giá trị cốt lõi",
      text: "Chúng tôi đặt khách hàng làm trung tâm, luôn hướng đến chất lượng dịch vụ, minh bạch trong giá vé và hỗ trợ tận tâm trên mọi chuyến đi.",
      img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Tầm nhìn tương lai",
      text: "VietTravel hướng tới trở thành nền tảng đặt vé xe hàng đầu Việt Nam, kết nối hàng triệu hành khách với các hãng xe uy tín trên toàn quốc.",
      img: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div style={{ padding: "60px 20px", backgroundColor: "#f8f9fa" }}>
      <div style={{ textAlign: "center", marginBottom: 80 }}>
        <Title style={{ color: "#1a73e8", fontSize: "3rem", fontWeight: 700 }}>
          Giới thiệu về VietTravel
        </Title>
        <Paragraph
          style={{
            maxWidth: 720,
            margin: "20px auto 0",
            fontSize: 18,
            lineHeight: 1.8,
            color: "#555",
          }}
        >
          VietTravel – nền tảng đặt vé xe hàng đầu tại Việt Nam, mang đến trải
          nghiệm di chuyển tiện lợi, an toàn và đáng tin cậy. Chúng tôi kết nối
          hành khách với các hãng xe uy tín, giúp mọi hành trình trở nên dễ dàng
          và trọn vẹn hơn.
        </Paragraph>
        <Divider
          style={{
            borderColor: "#1a73e8",
            width: 80,
            margin: "40px auto 0",
          }}
        />
      </div>

      {sections.map((item, index) => (
        <Card
          key={index}
          hoverable
          style={{
            marginBottom: 60,
            borderRadius: 16,
            overflow: "hidden",
            border: "none",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Row
            gutter={[40, 20]}
            align="middle"
            style={{ flexDirection: index % 2 === 0 ? "row" : "row-reverse" }}
          >
            <Col xs={24} md={12}>
              <div
                style={{
                  overflow: "hidden",
                  height: "100%",
                  borderRadius: 16,
                }}
              >
                <Image
                  src={item.img}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                  preview={false}
                  onMouseOver={(e: any) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseOut={(e: any) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ padding: "40px 30px" }}>
                <Title level={3} style={{ color: "#1a73e8", fontWeight: 600 }}>
                  {item.title}
                </Title>
                <Paragraph
                  style={{ fontSize: 16, lineHeight: 1.8, color: "#555" }}
                >
                  {item.text}
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>
      ))}

      <div
        style={{
          textAlign: "center",
          color: "#888",
          fontSize: 14,
          marginTop: 80,
        }}
      >
        © {new Date().getFullYear()} VietTravel — Kết nối mọi hành trình của
        bạn.
      </div>
    </div>
  );
}
