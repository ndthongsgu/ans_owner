import { usePasswordResetRequest } from "@/hooks/auth/auth";
import { Alert, Button, Card, Form, Input } from "antd";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const resetMutation = usePasswordResetRequest();

  const onFinish = async (values: { email: string }) => {
    await resetMutation.mutateAsync({ email: values.email });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundSize: "cover",
        }}
      >
        <Card style={{ width: 400, textAlign: "center" }}>
          <Alert
            message="Yêu cầu thành công"
            description="Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra email của bạn."
            type="success"
            showIcon
          />
          <Button type="link" href="/login" style={{ marginTop: 16 }}>
            Quay lại đăng nhập
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px 40px",
        backgroundColor: "transparent",
        borderRadius: "8px",
        width: "400px",
        maxWidth: "90vw",
        position: "absolute",
        right: "200px",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <Card title="Quên mật khẩu" style={{ width: 400 }}>
        <Form
          name="forgotPassword"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input size="large" placeholder="Nhập email của bạn" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{ width: "100%" }}
              loading={resetMutation.isPending}
            >
              Gửi yêu cầu
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <a href="/login">Quay lại đăng nhập</a>
        </div>
      </Card>
    </div>
  );
}
