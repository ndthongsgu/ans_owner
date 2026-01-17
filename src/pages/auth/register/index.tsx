import { PUBLIC_ROUTES } from "@/routes/routes";
import { Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

const { Title } = Typography;

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    console.log("Register data:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        width: "400px",
        maxWidth: "90vw",
        position: "absolute",
        right: "150px",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <Title level={2} style={{ textAlign: "center", marginBottom: "32px" }}>
        Đăng ký
      </Title>

      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input
            placeholder="Nhập họ và tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            style={{ padding: "12px", borderRadius: "6px", fontSize: "14px" }}
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
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ padding: "12px", borderRadius: "6px", fontSize: "14px" }}
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ padding: "12px", borderRadius: "6px", fontSize: "14px" }}
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
        >
          <Input.Password
            placeholder="Nhập lại mật khẩu"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{ padding: "12px", borderRadius: "6px", fontSize: "14px" }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              marginTop: "10px",
              fontWeight: 500,
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
            }}
          >
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

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
