import { ContactUs } from "@/assets/animations";
import { MailOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Typography } from "antd";
import Lottie from "lottie-react";

const { TextArea } = Input;
const { Title } = Typography;

export default function ContactSection() {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    form.resetFields();
    alert("Gửi thông tin thành công!");
  };

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "40px 0" }}>
      <Row
        gutter={[40, 40]}
        justify="center"
        align="middle"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
      >
        <Col
          xs={24}
          md={12}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Card
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "none",
            }}
          >
            <div style={{ width: 400, height: 400 }}>
              <Lottie animationData={ContactUs} loop />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <Title
                level={4}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: 600,
                  color: "var(--color-primary-800)",
                }}
              >
                <MailOutlined style={{ marginRight: 8 }} />
                Gửi thông tin liên hệ đến chúng tôi
              </Title>
            }
            style={{ borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fullName"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ và tên" },
                    ]}
                  >
                    <Input placeholder="Họ và tên" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      {
                        pattern: /^[0-9]{10,11}$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    ]}
                  >
                    <Input placeholder="Điện thoại" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input placeholder="Email" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="address"
                    rules={[
                      { required: true, message: "Vui lòng nhập địa chỉ" },
                    ]}
                  >
                    <Input placeholder="Địa chỉ" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input placeholder="Tiêu đề" size="large" />
              </Form.Item>

              <Form.Item name="note">
                <TextArea placeholder="Ghi chú" rows={4} size="large" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  style={{
                    width: "100%",
                    borderRadius: 24,
                    backgroundColor: "var(--color-primary-800)",
                    borderColor: "var(--color-primary-500)",
                  }}
                >
                  Gửi
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
