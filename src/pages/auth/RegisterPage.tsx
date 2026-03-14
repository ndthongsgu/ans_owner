import { googleButtonStyle } from "@/components/auth/LoginForm";
import { useRegister } from "@/hooks/auth/auth";
import { useToast } from "@/hooks/layout/useToast";
import { PUBLIC_ROUTES } from "@/routes/routes";
import { handleGoogleLogin } from "@/services/other";
import { GoogleOutlined } from "@ant-design/icons";
import { Alert, Button, Divider, Form, Input, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";

const { Title } = Typography;

function RegisterPageForm() {
  const registerMutation = useRegister();
  const showToast = useToast();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await registerMutation.mutateAsync({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      showToast({
        title: "Đăng ký thành công",
        message: "Bạn có thể đăng nhập ngay bây giờ.",
        type: "success",
      });
      setTimeout(() => {
        navigate(PUBLIC_ROUTES.LOGIN);
      }, 2000);
    } catch (error: any) {
      showToast({
        title: "Đăng ký thất bại",
        message: error?.message || "Có lỗi xảy ra, vui lòng thử lại.",
        type: "error",
      });
    }
  };

  return (
    <div
      style={{
        padding: "20px 40px",
        backgroundColor: "white",
        borderRadius: "8px",
        width: "400px",
        maxWidth: "90vw",
        position: "absolute",
        right: "150px",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <Title level={2} style={{ textAlign: "center", marginBottom: "12px" }}>
        Đăng ký
      </Title>

      {/* {registerMutation.isError && (
        <Alert
          message={registerMutation.error.message}
          type="error"
          showIcon
          style={{ marginBottom: 6 }}
        />
      )} */}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Họ và tên"
          name="full_name"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input
            placeholder="Nhập họ và tên"
            style={{ padding: "10px", borderRadius: "6px", fontSize: "14px" }}
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input
            placeholder="Nhập email của bạn"
            style={{ padding: "10px", borderRadius: "6px", fontSize: "14px" }}
          />
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
          <Input
            placeholder="Nhập số điện thoại"
            style={{ padding: "10px", borderRadius: "6px", fontSize: "14px" }}
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu"
            style={{ padding: "10px", borderRadius: "6px", fontSize: "14px" }}
          />
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
                  new Error("Mật khẩu xác nhận không khớp!"),
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Nhập lại mật khẩu"
            style={{ padding: "10px", borderRadius: "6px", fontSize: "14px" }}
          />
        </Form.Item>

        <Button
          type="primary"
          size="large"
          htmlType="submit"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            fontWeight: 500,
            backgroundColor: "#52c41a",
            borderColor: "#52c41a",
          }}
          loading={registerMutation.isPending}
        >
          Đăng ký
        </Button>
      </Form>

      <Divider style={{ margin: "5px 0" }}>Hoặc đăng nhập với</Divider>
      <Button
        onClick={handleGoogleLogin}
        size="large"
        style={googleButtonStyle}
      >
        {/* You will need to import the actual Google SVG/Image path */}
        {/* <img src={Google} alt="Google" style={{ width: "20px", height: "20px", marginRight: "8px" }} /> */}
        <GoogleOutlined
          style={{ fontSize: "18px", marginRight: "8px", color: "#DB4437" }}
        />
        Tiếp tục với Google
      </Button>
      <Divider style={{ margin: "24px 0" }}></Divider>

      <div style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
        Đã có tài khoản?{" "}
        <Link
          to={PUBLIC_ROUTES.LOGIN}
          style={{ color: "#1890ff", textDecoration: "none" }}
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}

function RegisterPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <RegisterPageForm />
    </div>
  );
}

export default RegisterPage;
