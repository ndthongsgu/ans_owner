import { useGetCurrentUser, useUpdateProfile } from "@/hooks/user";
import {
  Button,
  Form,
  Input,
  Card,
  Alert,
  Typography,
  Tag,
  Divider,
} from "antd";
import { REQUIRE_AUTH_ROUTES } from "@/routes/routes";

const { Title, Text } = Typography;

export default function CustomerProfilePage() {
  const { data: user, isLoading } = useGetCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const [form] = Form.useForm();

  const onFinish = async (values: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    confirmPassword?: string;
  }) => {
    try {
      await updateProfileMutation.mutateAsync({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if user is a customer
  const isCustomer = user?.customer && !user?.isAdmin;

  if (!isCustomer) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <Title level={3}>Thông tin người dùng</Title>
          <Text>Trang này chỉ dành cho khách hàng.</Text>
        </Card>
      </div>
    );
  }

  const initialValues = {
    name: user?.customer?.name || "",
    email: user?.customer?.email || "",
    phone: user?.customer?.phone || "",
  };

  const isOwner = (user?.roles || []).some((r: any) => r.code === "OWNER");

  return (
    <div style={{ padding: "24px", maxWidth: 600, margin: "0 auto" }}>
      <Title level={2}>Thông tin cá nhân</Title>
      {isOwner && (
        <div style={{ marginBottom: 12 }}>
          <Button type="default" onClick={() => (window.location.href = REQUIRE_AUTH_ROUTES.OWNER_DASHBOARD)}>
            Quản lý quán
          </Button>
        </div>
      )}

      <Card>
        {updateProfileMutation.isError && (
          <Alert
            message={updateProfileMutation.error.message}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {updateProfileMutation.isSuccess && (
          <Alert
            message="Cập nhật thông tin thành công!"
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ marginBottom: 16 }}>
          <Text strong>Trạng thái tài khoản: </Text>
          {user?.isGoogle && <Tag color="blue">Google OAuth</Tag>}
          {user?.hasPassword && <Tag color="green">Đã có mật khẩu</Tag>}
          {!user?.hasPassword && <Tag color="orange">Chưa có mật khẩu</Tag>}
        </div>

        <Form
          form={form}
          name="customerProfile"
          layout="vertical"
          initialValues={initialValues}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^[0-9]{10,15}$/,
                message: "Số điện thoại không hợp lệ!",
              },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Divider>Cập nhật mật khẩu (tùy chọn)</Divider>

          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[{ min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }]}
          >
            <Input.Password
              size="large"
              placeholder="Để trống nếu không muốn thay đổi"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{ width: "100%" }}
              loading={updateProfileMutation.isPending}
            >
              Cập nhật thông tin
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
