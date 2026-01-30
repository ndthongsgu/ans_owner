import { Button, Card, Form, Input, message, Typography } from "antd";
import { useGetCurrentUser, useUpdateProfile } from "@/hooks/user";

const { Title } = Typography;

export default function OwnerProfilePage() {
  const { data: user } = useGetCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  const initialValues = {
    name: user?.customer?.name || "",
    email: user?.customer?.email || "",
    phone: user?.customer?.phone || "",
    shopName: (user?.customer as any)?.shopName || "",
    shopLocation: (user?.customer as any)?.shopLocation || "",
    narrationContent: (user?.customer as any)?.narrationContent || "",
  };

  const onFinish = async (values: any) => {
    try {
      await updateProfileMutation.mutateAsync(values);
      message.success("Đã lưu thông tin");
    } catch (err: any) {
      message.error(err?.message || "Lỗi lưu");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Thông tin chủ quán</Title>

      <Card>
        <Form layout="vertical" onFinish={onFinish} initialValues={initialValues}>
          <Form.Item name="name" label="Tên người liên hệ" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input />
          </Form.Item>

          <Form.Item name="shopName" label="Tên quán">
            <Input />
          </Form.Item>

          <Form.Item name="shopLocation" label="Địa chỉ quán">
            <Input />
          </Form.Item>

          <Form.Item name="narrationContent" label="Nội dung thuyết minh">
            <Input.TextArea rows={6} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={(updateProfileMutation as any).isPending}>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
