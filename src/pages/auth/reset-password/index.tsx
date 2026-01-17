import { PUBLIC_ROUTES } from "@/routes/routes";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function ResetPasswordScreen() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    console.log("Reset password:", formData);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isSubmitted) {
    return (
      <div
        style={{
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          width: "400px",
          maxWidth: "90vw",
          position: "absolute",
          right: "200px",
          top: "50%",
          transform: "translateY(-50%)",
          textAlign: "center",
        }}
      >
        <CheckCircleOutlined
          style={{
            fontSize: "60px",
            color: "#52c41a",
            marginBottom: "24px",
          }}
        />

        <Title level={3} style={{ color: "#333", marginBottom: "16px" }}>
          Mật khẩu đã được cập nhật!
        </Title>

        <Text
          style={{
            color: "#666",
            marginBottom: "24px",
            display: "block",
            lineHeight: 1.5,
          }}
        >
          Mật khẩu của bạn đã được thay đổi thành công. Bạn có thể đăng nhập
          bằng mật khẩu mới.
        </Text>

        <Link
          to={PUBLIC_ROUTES.LOGIN}
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#1890ff",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        width: "400px",
        maxWidth: "90vw",
        position: "absolute",
        right: "250px",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <Title level={2} style={{ textAlign: "center", marginBottom: "32px" }}>
        Đặt lại mật khẩu
      </Title>

      <Text
        style={{
          display: "block",
          textAlign: "center",
          color: "#666",
          marginBottom: "32px",
          lineHeight: 1.5,
        }}
      >
        Nhập mật khẩu mới cho tài khoản của bạn.
      </Text>

      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Mật khẩu mới"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 6, message: "Mật khẩu ít nhất 6 ký tự!" },
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu mới"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ padding: "12px", borderRadius: "6px", fontSize: "14px" }}
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            { min: 6, message: "Mật khẩu ít nhất 6 ký tự!" },
          ]}
        >
          <Input.Password
            placeholder="Nhập lại mật khẩu mới"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{ padding: "12px", borderRadius: "6px", fontSize: "14px" }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              fontWeight: 500,
              backgroundColor: "#722ed1",
              borderColor: "#722ed1",
            }}
          >
            Cập nhật mật khẩu
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
        <Link
          to={PUBLIC_ROUTES.LOGIN}
          style={{ color: "#1890ff", textDecoration: "none" }}
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
