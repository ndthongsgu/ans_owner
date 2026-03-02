import { CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Form, Input, InputNumber, Row, Select, Typography, message } from "antd";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export default function SearchBookingPage() {
  const [form] = Form.useForm();

  const onFinish = (values: {
    ownerName: string;
    phone: string;
    email: string;
    shopName: string;
    branchCount: number;
    bestTime: string;
    note?: string;
  }) => {
    message.success(`Đã ghi nhận đăng ký demo cho quán ${values.shopName}.`);
    form.resetFields();
  };

  return (
    <div style={{ maxWidth: 1000, margin: "30px auto", padding: "0 20px 40px" }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Card style={{ borderRadius: 14, height: "100%" }}>
            <Title level={3}>Đăng ký demo 1-1</Title>
            <Paragraph>
              Điền thông tin trong 1 phút. Team sẽ liên hệ để setup buổi demo phù hợp quy trình vận hành quán của bạn.
            </Paragraph>

            <Alert
              showIcon
              type="info"
              message="Demo bao gồm"
              description={
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Tư vấn gói phù hợp quy mô quán</li>
                  <li>Demo dashboard cập nhật nội dung thuyết minh</li>
                  <li>Hướng dẫn triển khai QR tại bàn</li>
                </ul>
              }
            />
          </Card>
        </Col>

        <Col xs={24} md={14}>
          <Card style={{ borderRadius: 14 }}>
            <Title level={4} style={{ marginBottom: 16 }}>
              <CalendarOutlined /> Lịch hẹn demo
            </Title>

            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="ownerName"
                    label="Tên chủ quán"
                    rules={[{ required: true, message: "Nhập tên chủ quán" }]}
                  >
                    <Input placeholder="VD: Nguyễn Văn A" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                      { required: true, message: "Nhập số điện thoại" },
                      { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
                    ]}
                  >
                    <Input placeholder="VD: 0909123456" size="large" />
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
                    name="shopName"
                    label="Tên quán"
                    rules={[{ required: true, message: "Nhập tên quán" }]}
                  >
                    <Input placeholder="VD: Bún Chả Phố Cổ" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="branchCount"
                    label="Số chi nhánh"
                    initialValue={1}
                    rules={[{ required: true, message: "Nhập số chi nhánh" }]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="bestTime"
                    label="Khung giờ liên hệ"
                    rules={[{ required: true, message: "Chọn khung giờ" }]}
                  >
                    <Select
                      size="large"
                      placeholder="Chọn khung giờ"
                      options={[
                        { value: "morning", label: "Buổi sáng (08:00 - 11:00)" },
                        { value: "afternoon", label: "Buổi chiều (13:30 - 17:30)" },
                        { value: "evening", label: "Buổi tối (18:00 - 20:00)" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="note" label="Nhu cầu thêm">
                <TextArea rows={4} placeholder="Mô tả nhanh về loại món, đối tượng khách, mục tiêu của quán..." />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large" block icon={<CheckCircleOutlined />}>
                Gửi đăng ký demo
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
