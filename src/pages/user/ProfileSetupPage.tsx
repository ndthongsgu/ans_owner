import { useGetCurrentUser, useSetupCredentials } from "@/hooks/user";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function ProfileSetupPage() {
  const setupCredentialsMutation = useSetupCredentials();
  const { data: user, isLoading } = useGetCurrentUser();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: {
    name: string;
    // email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await setupCredentialsMutation.mutateAsync({
        name: values.name,
        // email: values.email,
        phone: values.phone,
        password: values.password,
      });
      navigate("/"); // Redirect to home after successful setup
    } catch (error) {
      // Error handled by mutation
    }
  };

  const initialValues = {
    name: user?.customer?.name || "",
    email: user?.customer?.email || "",
    phone: user?.customer?.phone || "",
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        padding: "24px",
      }}
    >
      <Card style={{ width: 500, maxWidth: "90vw" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={2}>Thiết lập tài khoản</Title>
          <Text type="secondary">
            Bạn cần thiết lập số điện thoại và mật khẩu để sử dụng tài khoản
            OAuth
          </Text>
        </div>

        {setupCredentialsMutation.isError && (
          <Alert
            message={setupCredentialsMutation.error.message}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          name="profileSetup"
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
            <Input size="large" placeholder="Nhập họ và tên của bạn" />
          </Form.Item>

          {/* <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input size="large" placeholder="Nhập email của bạn" />
          </Form.Item> */}

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
            <Input size="large" placeholder="Nhập số điện thoại của bạn" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
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
            <Input.Password size="large" placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{ width: "100%" }}
              loading={setupCredentialsMutation.isPending}
            >
              Thiết lập tài khoản
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
