import { useChangePassword } from "@/hooks/auth/auth";
import { Button, Form, Input, Card, Alert } from "antd";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordPage() {
  const changePasswordMutation = useChangePassword();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Đổi mật khẩu"
        style={{ maxWidth: 500, margin: "0 auto" }}
      >
        {changePasswordMutation.isError && (
          <Alert
            message={changePasswordMutation.error.message}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          name="changePassword"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
            ]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
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
            <Input.Password size="large" placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              style={{ width: "100%" }}
              loading={changePasswordMutation.isPending}
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>

          <Form.Item>
            <Button 
              type="default" 
              size="large" 
              style={{ width: "100%" }}
              onClick={() => navigate(-1)}
            >
              Quay lại
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}