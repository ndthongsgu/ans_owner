import {
  CheckOutlined,
  CrownOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Tag, Typography } from "antd";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "@/routes/hooks";
import { PUBLIC_ROUTES, REQUIRE_AUTH_ROUTES } from "@/routes/routes";

const { Title, Paragraph, Text } = Typography;

type RoleAwareProfile =
  | {
      roles?: Array<{ code?: string | null }>;
    }
  | null
  | undefined;

type Plan = {
  id: string;
  name: string;
  price: string;
  badge?: string;
  description: string;
  features: string[];
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "499.000đ/tháng",
    description: "Phù hợp quán nhỏ cần thuyết minh cho menu cơ bản.",
    features: [
      "Tối đa 60 món",
      "2 giọng đọc",
      "Cập nhật nội dung không giới hạn",
      "Hỗ trợ qua chat",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "1.290.000đ/tháng",
    badge: "Phổ biến",
    description: "Dành cho quán ăn bận rộn, cần quản lý nhiều khu vực.",
    features: [
      "Tối đa 250 món",
      "8 giọng đọc + 2 ngôn ngữ",
      "Thống kê lượt nghe theo món",
      "Hỗ trợ triển khai tận nơi",
    ],
  },
  {
    id: "chain",
    name: "Chain",
    price: "Liên hệ",
    description: "Cho chuỗi nhà hàng cần quản lý đồng bộ nhiều chi nhánh.",
    features: [
      "Không giới hạn món",
      "Đồng bộ nội dung đa chi nhánh",
      "Tài khoản theo vai trò",
      "SLA và CSKH ưu tiên",
    ],
  },
];

export default function BookingScreen() {
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();

  const roleCodes = ((profile as RoleAwareProfile)?.roles ?? []).map(
    (role) => role.code ?? "",
  );
  const isOwner = roleCodes.includes("OWNER");

  const handlePrimaryAction = () => {
    if (isAuthenticated && isOwner) {
      router.push(REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD);
      return;
    }

    if (isAuthenticated) {
      router.push(REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD);
      return;
    }

    router.push(PUBLIC_ROUTES.REGISTER);
  };

  return (
    <div
      style={{
        background: "#f4f7f6",
        minHeight: "100vh",
        padding: "36px 20px 60px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Card
          style={{ borderRadius: 18, border: "none", marginBottom: 24 }}
          styles={{ body: { padding: "28px 24px" } }}
        >
          <Tag color="green" style={{ marginBottom: 14 }}>
            BẢNG GIÁ DỊCH VỤ THUYẾT MINH TỰ ĐỘNG
          </Tag>
          <Title level={2} style={{ marginTop: 0 }}>
            Chọn gói phù hợp quy mô quán ăn của bạn
          </Title>
          <Paragraph style={{ maxWidth: 780, marginBottom: 0 }}>
            Tất cả gói đều bao gồm dashboard owner, cập nhật nội dung theo thời
            gian thực và tạo QR để khách nghe thuyết minh món ăn.
          </Paragraph>
        </Card>

        <Row gutter={[20, 20]}>
          {plans.map((plan) => (
            <Col xs={24} md={8} key={plan.id}>
              <Card
                style={{
                  borderRadius: 16,
                  height: "100%",
                  border: plan.badge ? "2px solid #16a34a" : undefined,
                }}
              >
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Space align="center">
                    {plan.id === "growth" ? (
                      <RocketOutlined />
                    ) : (
                      <CrownOutlined />
                    )}
                    <Text strong style={{ fontSize: 20 }}>
                      {plan.name}
                    </Text>
                    {plan.badge ? <Tag color="green">{plan.badge}</Tag> : null}
                  </Space>

                  <Title level={3} style={{ margin: 0 }}>
                    {plan.price}
                  </Title>
                  <Paragraph style={{ marginBottom: 0 }}>
                    {plan.description}
                  </Paragraph>

                  <div>
                    {plan.features.map((feature) => (
                      <Paragraph key={feature} style={{ marginBottom: 8 }}>
                        <CheckOutlined
                          style={{ color: "#16a34a", marginRight: 8 }}
                        />
                        {feature}
                      </Paragraph>
                    ))}
                  </div>

                  <Button
                    type={plan.badge ? "primary" : "default"}
                    block
                    onClick={handlePrimaryAction}
                  >
                    {isAuthenticated && isOwner
                      ? "Mở trang quản lý"
                      : "Đăng ký ngay"}
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
