import { Button, Form, Modal, Input } from "antd";
import { useEffect } from "react";
import { useUpdateProfile } from "@/hooks/user";

export default function LocationEditor({ open, onClose, initialValue }: any) {
  const [form] = Form.useForm();
  const mutation = useUpdateProfile();

  useEffect(() => {
    if (open) form.setFieldsValue({ shopLocation: initialValue });
  }, [open]);

  const onFinish = async (values: any) => {
    await mutation.mutateAsync({ shopLocation: values.shopLocation });
    onClose();
  };

  return (
    <Modal title="Chỉnh sửa vị trí quán" open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="shopLocation" label="Địa chỉ">
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isLoading}>Lưu</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
