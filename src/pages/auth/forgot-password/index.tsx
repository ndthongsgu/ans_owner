import { PUBLIC_ROUTES } from "@/routes/routes";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
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
          right: "250px",
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
          Email đã được gửi!
        </Title>

        <Text
          style={{
            color: "#666",
            marginBottom: "24px",
            display: "block",
            lineHeight: 1.5,
          }}
        >
          Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email{" "}
          <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
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
          Quay lại đăng nhập
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
        right: "150px",
        top: "50%",
        transform: "translateY(-50%)",
      }}
    >
      <Title level={2} style={{ textAlign: "center", marginBottom: "32px" }}>
        Quên mật khẩu
      </Title>

      <Text
        style={{
          display: "block",
          textAlign: "center",
          color: "#666",
          marginBottom: "20px",
          lineHeight: 1.5,
        }}
      >
        Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn để đặt lại mật khẩu.
      </Text>

      <Form layout="vertical" onFinish={handleSubmit}>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "6px",
              fontSize: "14px",
            }}
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
              marginTop: "10px",
              fontWeight: 500,
              backgroundColor: "#faad14",
              borderColor: "#faad14",
            }}
          >
            Gửi email khôi phục
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
        Nhớ lại mật khẩu?{" "}
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
