import { ContactUs } from "@/assets/animations";
import { CustomerServiceOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select, Typography, message } from "antd";
import Lottie from "lottie-react";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

export default function ContactSection() {
  const [form] = Form.useForm();

  const handleSubmit = (values: {
    fullName: string;
    phone: string;
    email: string;
    shopAddress: string;
    supportType: string;
    note?: string;
  }) => {
    message.success(`Đã gửi yêu cầu hỗ trợ cho ${values.fullName}.`);
    form.resetFields();
  };

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "40px 16px" }}>
      <Row gutter={[32, 32]} justify="center" align="middle" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Col xs={24} md={11} style={{ display: "flex", justifyContent: "center" }}>
          <Card style={{ border: "none" }}>
            <div style={{ width: 360, height: 360 }}>
              <Lottie animationData={ContactUs} loop />
            </div>
            <Title level={4} style={{ marginBottom: 8 }}>
              Hỗ trợ chủ quán từ A-Z
            </Title>
            <Paragraph style={{ marginBottom: 0 }}>
              Team kỹ thuật hỗ trợ thiết lập ban đầu, cấu hình nội dung thuyết minh và xử lý vấn đề vận hành.
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} md={13}>
          <Card
            title={
              <Title level={4} style={{ display: "flex", alignItems: "center", marginBottom: 0 }}>
                <CustomerServiceOutlined style={{ marginRight: 8 }} />
                Gửi yêu cầu hỗ trợ
              </Title>
            }
            style={{ borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fullName"
                    label="Người liên hệ"
                    rules={[{ required: true, message: "Nhập người liên hệ" }]}
                  >
                    <Input placeholder="Họ và tên" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Điện thoại"
                    rules={[
                      { required: true, message: "Nhập số điện thoại" },
                      { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
                    ]}
                  >
                    <Input placeholder="09xxxxxxxx" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input placeholder="owner@quan.com" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="shopAddress"
                    label="Địa chỉ quán"
                    rules={[{ required: true, message: "Nhập địa chỉ" }]}
                  >
                    <Input placeholder="Quận 1, TP.HCM" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="supportType"
                label="Loại yêu cầu"
                rules={[{ required: true, message: "Chọn loại yêu cầu" }]}
              >
                <Select
                  size="large"
                  placeholder="Chọn loại yêu cầu"
                  options={[
                    { value: "consulting", label: "Tư vấn triển khai" },
                    { value: "pricing", label: "Tư vấn bảng giá" },
                    { value: "technical", label: "Hỗ trợ kỹ thuật" },
                    { value: "training", label: "Hướng dẫn sử dụng dashboard" },
                  ]}
                />
              </Form.Item>

              <Form.Item name="note" label="Nội dung chi tiết">
                <TextArea rows={4} placeholder="Mô tả vấn đề hoặc nhu cầu của bạn" />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large" block>
                Gửi yêu cầu
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
