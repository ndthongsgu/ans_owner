import { useSearchBooking } from "@/hooks/booking";
import { useToast } from "@/hooks/layout/useToast";
import { useRouter } from "@/routes/hooks";
import { SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import React from "react";

const { Title } = Typography;

const SearchBookingPage: React.FC = () => {
  const [form] = Form.useForm();
  const toast = useToast();
  const router = useRouter();
  const searchBooking = useSearchBooking();

  const onFinish = async (values: {
    bookingCode: string;
    customerName: string;
    customerPhone: string;
  }) => {
    try {
      const result = await searchBooking.mutateAsync({
        bookingCode: values.bookingCode.trim(),
        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone.trim(),
      });

      toast({
        type: "success",
        title: "Tìm thấy thông tin vé",
        message: "Vé của bạn đã được tìm thấy",
      });

      router.push("/search-booking/result-search", { bookingData: result });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không tìm thấy thông tin vé. Vui lòng kiểm tra lại thông tin đã nhập.";

      toast({
        type: "error",
        title: "Không tìm thấy vé",
        message: errorMessage,
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: "0 20px",
      }}
    >
      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        Tra cứu thông tin đặt vé
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <Alert
          message="Lưu ý"
          description="Vui lòng nhập đầy đủ cả 3 thông tin: Mã vé, Họ tên và Số điện thoại để tìm kiếm vé của bạn."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Mã vé"
            name="bookingCode"
            rules={[
              { required: true, message: "Vui lòng nhập mã vé" },
              {
                whitespace: true,
                message: "Mã vé không được chỉ chứa khoảng trắng",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Nhập mã vé (VD: BK1761454647036)"
              prefix={<SearchOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Họ và tên"
            name="customerName"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên" },
              {
                whitespace: true,
                message: "Họ tên không được chỉ chứa khoảng trắng",
              },
            ]}
          >
            <Input size="large" placeholder="Nhập họ tên đầy đủ" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="customerPhone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Số điện thoại phải gồm 10 chữ số",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Nhập số điện thoại (10 chữ số)"
              maxLength={10}
            />
          </Form.Item>

          <Form.Item>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              loading={searchBooking.isPending}
              block
              icon={<SearchOutlined />}
              style={{
                marginTop: 24,
                backgroundColor: "var(--color-primary-800)",
                borderColor: "var(--color-primary-800)",
              }}
            >
              {searchBooking.isPending ? "Đang tìm kiếm..." : "Tìm kiếm"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SearchBookingPage;
