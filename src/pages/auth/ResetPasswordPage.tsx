import { Button, Form, Input, Alert, Card } from "antd";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { usePasswordResetConfirm } from "@/hooks/auth/auth";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const resetMutation = usePasswordResetConfirm();

  const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
    if (!token) {
      throw new Error('Token không hợp lệ');
    }

    await resetMutation.mutateAsync({
      token,
      newPassword: values.newPassword,
    });
    setIsSubmitted(true);
  };

  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
        }}
      >
        <Card style={{ width: 400, textAlign: "center" }}>
          <Alert
            message="Liên kết không hợp lệ"
            description="Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."
            type="error"
            showIcon
          />
          <Button type="link" href="/forgot-password" style={{ marginTop: 16 }}>
            Yêu cầu lại
          </Button>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
        }}
      >
        <Card style={{ width: 400, textAlign: "center" }}>
          <Alert
            message="Đặt lại mật khẩu thành công"
            description="Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập lại."
            type="success"
            showIcon
          />
          <Button type="link" href="/login" style={{ marginTop: 16 }}>
            Đăng nhập ngay
          </Button>
        </Card>
      </div>
    );
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
      }}
    >
      <Card
        title="Đặt lại mật khẩu"
        style={{ width: 400 }}
      >
        <Form
          name="resetPassword"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              style={{ width: "100%" }}
              loading={resetMutation.isPending}
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}