import { Button, Card, Form, Input, message, Typography } from "antd";
import {
  useOwnerProfile,
  useOwnerSubscription,
  useUpdateOwnerProfile,
} from "@/hooks/owner";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { REQUIRE_AUTH_ROUTES } from "@/routes/routes";

const { Title } = Typography;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile } = useOwnerProfile();
  const { data: subscription } = useOwnerSubscription();
  const updateProfileMutation = useUpdateOwnerProfile();
  const [form] = Form.useForm();

  const owner = profile?.owner;

  const initialValues = {
    full_name: owner?.full_name || "",
    email: profile?.email || "",
    phone: owner?.phone || "",
    business_name: owner?.business_name || "",
    business_address: owner?.business_address || "",
  };

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const subscriptionName = subscription?.packageName;
  const subscriptionExpires =
    subscription?.expiresAt || owner?.subscription_expires_at;
  const expText = subscriptionExpires
    ? new Date(subscriptionExpires).toLocaleDateString()
    : null;
  const isActiveSubscription = Boolean(subscriptionName);

  const onFinish = async (values: any) => {
    try {
      await updateProfileMutation.mutateAsync(values);
      message.success("Đã lưu thông tin");
    } catch (err: any) {
      message.error(err?.message || "Lỗi lưu");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Thông tin cá nhân</Title>

      <Card style={{ marginBottom: 24 }}>
        <div>
          Gói đăng ký hiện tại:{" "}
          <strong>{subscriptionName || "Chưa đăng ký gói"}</strong>
          {expText && (
            <span>
              {" "}
              (hết hạn: <strong>{expText}</strong>)
            </span>
          )}
          <span>
            {" "}
            - Trạng thái:{" "}
            <strong>
              {isActiveSubscription ? "Đang hoạt động" : "Chưa kích hoạt"}
            </strong>
          </span>
        </div>
      </Card>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <Form.Item
            name="full_name"
            label="Tên chủ quán"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button
              onClick={() => navigate(REQUIRE_AUTH_ROUTES.CHANGE_PASSWORD)}
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={(updateProfileMutation as any).isPending}
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
