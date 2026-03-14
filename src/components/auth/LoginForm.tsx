import { useLoading } from "@/context/LoadingContext";
import { useLogin } from "@/hooks/auth/auth";
import { handleGoogleLogin } from "@/services/other";
import { GoogleOutlined } from "@ant-design/icons";
import { Alert, Button, Checkbox, Divider, Form, Input } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";

type FieldType = {
  username: string; // Phone number or email
  password: string;
  remember?: boolean;
};

// Custom style for Inputs/Passwords to match the old design
const inputStyle = {
  padding: "12px",
  borderRadius: "6px",
  fontSize: "14px",
};

// Custom style for the primary button
const primaryButtonStyle = {
  width: "100%",
  padding: "12px",
  fontSize: "16px",
  fontWeight: 500,
  height: "auto", // Allow padding to determine height
};

// Custom style for the Google button
export const googleButtonStyle = {
  width: "100%",
  padding: "12px",
  fontSize: "16px",
  fontWeight: 700,
  color: "#808080",
  border: "1px solid #d9d9d9",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#fff",
  height: "auto", // Allow padding to determine height
};

export default function LoginForm() {
  const { showLoading, hideLoading } = useLoading();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get("message");

  const loginMutation = useLogin();
  const onFinish = async (values: FieldType) => {
    showLoading();
    try {
      await loginMutation.mutateAsync({
        username: values.username,
        password: values.password,
      });
    } finally {
      hideLoading();
    }
  };

  return (
    <div>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "32px",
          fontSize: "24px",
          color: "rgba(0, 0, 0, 0.85)",
        }}
      >
        Đăng nhập
      </h2>

      {message && (
        <Alert
          message={message}
          type="warning"
          showIcon
          style={{ marginBottom: "1rem" }}
        />
      )}

      {loginMutation.isError && (
        <Alert
          message={loginMutation.error.message}
          type="error"
          showIcon
          style={{ marginBottom: "1rem" }}
        />
      )}

      <Form
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{
          remember: true,
        }}
      >
        <Form.Item<FieldType>
          label="Tên đăng nhập (Số điện thoại hoặc email)"
          name="username"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên đăng nhập!",
            },
          ]}
        >
          <Input
            size="large"
            style={inputStyle}
            placeholder="Nhập tên đăng nhập"
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item<FieldType>
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password
            size="large"
            style={inputStyle}
            placeholder="Nhập mật khẩu"
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item<FieldType> name="remember" valuePropName="checked">
          <Checkbox>Nhớ mật khẩu</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={primaryButtonStyle}
            loading={loginMutation.isPending}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: "24px 0" }}>Hoặc đăng nhập với</Divider>
      <Button
        onClick={handleGoogleLogin}
        size="large"
        style={googleButtonStyle}
      >
        <GoogleOutlined
          style={{ fontSize: "18px", marginRight: "8px", color: "#DB4437" }}
        />
        Tiếp tục với Google
      </Button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignContent: "center",
          flexDirection: "column",
          alignItems: "center",
          fontSize: "14px",
          marginTop: "16px",
        }}
      >
        <Button
          type="link"
          onClick={() => navigate("/forgot-password")}
          style={{
            color: "#1890ff",
            textDecoration: "none",
            display: "block",
            marginBottom: "8px",
            padding: 0,
          }}
        >
          Quên mật khẩu?
        </Button>

        <div style={{ color: "#666" }}>
          Chưa có tài khoản?{" "}
          <Button
            type="link"
            onClick={() => navigate("/register")}
            style={{ color: "#1890ff", textDecoration: "none", padding: 0 }}
          >
            Đăng ký ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
