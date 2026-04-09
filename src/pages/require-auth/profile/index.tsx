import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CrownFilled,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { useProfile, useUpdateProfile } from "@/hooks/owner";
import { useMySubscription } from "@/hooks/subscription";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { REQUIRE_AUTH_ROUTES } from "@/routes/routes";
import { formatUnixTimestamp } from "@/utils/date.utils";
import "./index.css";

const { Title, Text, Paragraph } = Typography;

type ProfileFormValues = {
  full_name: string;
  email: string;
  phone: string;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: subscription } = useMySubscription();
  const updateProfileMutation = useUpdateProfile();
  const [form] = Form.useForm<ProfileFormValues>();

  const owner = profile?.owner;

  const initialValues = useMemo<ProfileFormValues>(
    () => ({
      full_name: owner?.full_name || "",
      email: profile?.email || "",
      phone: owner?.phone || "",
    }),
    [owner?.full_name, owner?.phone, profile?.email],
  );

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const subscriptionName =
    subscription?.package?.name || subscription?.packageName;
  const subscriptionExpires =
    subscription?.subscription_expires_at ||
    subscription?.expiresAt ||
    owner?.subscription_expires_at;
  const expText =
    formatUnixTimestamp(subscriptionExpires, "", "DD/MM/YYYY") || null;
  const isActiveSubscription = Boolean(
    subscription?.is_active || subscription?.active || subscriptionName,
  );

  const onFinish = async (values: ProfileFormValues) => {
    try {
      await updateProfileMutation.mutateAsync(values);
      message.success("Đã lưu thông tin");
    } catch (err: unknown) {
      const errMessage =
        err instanceof Error ? err.message : "Lưu thông tin thất bại";
      message.error(errMessage);
    }
  };

  return (
    <div className="profile-page">
      <Card className="profile-header-card" bordered={false}>
        <div className="profile-header-left">
          <Title level={3} className="profile-page-title">
            Hồ sơ chủ quán
          </Title>
          <Paragraph className="profile-page-subtitle">
            Cập nhật thông tin liên hệ và theo dõi trạng thái gói đăng ký của
            tài khoản.
          </Paragraph>
        </div>
        <Tag
          className="profile-status-tag"
          color={isActiveSubscription ? "success" : "default"}
          icon={
            isActiveSubscription ? (
              <CheckCircleFilled />
            ) : (
              <ClockCircleOutlined />
            )
          }
        >
          {isActiveSubscription ? "Đang hoạt động" : "Chưa kích hoạt"}
        </Tag>
      </Card>

      <Card className="profile-subscription-card" bordered={false}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <div className="profile-subscription-highlight">
              <div className="icon-wrap">
                <CrownFilled />
              </div>
              <div>
                <Text className="profile-subscription-label">Gói hiện tại</Text>
                <Title level={4} className="profile-subscription-name">
                  {subscriptionName || "Chưa đăng ký gói"}
                </Title>
              </div>
            </div>
          </Col>
          <Col xs={24} md={7}>
            <div className="profile-subscription-metric">
              <Text className="metric-label">Ngày hết hạn</Text>
              <Text className="metric-value">{expText || "Chưa xác định"}</Text>
            </div>
          </Col>
          <Col xs={24} md={7}>
            <div className="profile-subscription-metric">
              <Text className="metric-label">Giới hạn quán</Text>
              <Text className="metric-value">
                {subscription?.package?.max_stalls
                  ? `${subscription.package.max_stalls} quán`
                  : "Theo cấu hình"}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="profile-form-card" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="full_name"
                label="Tên chủ quán"
                rules={[
                  { required: true, message: "Vui lòng nhập tên chủ quán" },
                ]}
              >
                <Input size="large" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          <div className="profile-actions">
            <Space wrap>
              <Button
                size="large"
                onClick={() => navigate(REQUIRE_AUTH_ROUTES.CHANGE_PASSWORD)}
              >
                Đổi mật khẩu
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={updateProfileMutation.isPending}
              >
                Lưu thay đổi
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}
