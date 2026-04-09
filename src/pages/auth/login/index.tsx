import { PUBLIC_ROUTES } from "@/routes/routes";
import { Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleSubmit = () => {
    console.log("Login data:", formData);
    // TODO: Gọi API đăng nhập
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
        padding: "40px",
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
        Đăng nhập
      </Title>

      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            { pattern: /^\d+$/, message: "Số điện thoại chỉ gồm chữ số!" },
          ]}
        >
          <Input
            name="phone"
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            style={{
              padding: "12px",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password
            name="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
            style={{
              padding: "12px",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

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
        <Link
          to={PUBLIC_ROUTES.FORGOT_PASSWORD}
          style={{
            color: "#1890ff",
            textDecoration: "none",
            display: "block",
            marginBottom: "8px",
          }}
        >
          Quên mật khẩu?
        </Link>

        <Text style={{ color: "#666" }}>
          Chưa có tài khoản?{" "}
          <Link
            to={PUBLIC_ROUTES.REGISTER}
            style={{ color: "#1890ff", textDecoration: "none" }}
          >
            Đăng ký ngay
          </Link>
        </Text>
      </div>
    </div>
  );
}
