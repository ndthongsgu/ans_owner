import { Button, Form, Modal } from "antd";
import { useEffect } from "react";
import { useUpdateProfile } from "@/hooks/user";

export default function NarrationEditor({ open, onClose, initialValue }: any) {
  const [form] = Form.useForm();
  const mutation = useUpdateProfile();

  useEffect(() => {
    if (open) form.setFieldsValue({ narrationContent: initialValue });
  }, [open]);

  const onFinish = async (values: any) => {
    await mutation.mutateAsync({ narrationContent: values.narrationContent });
    onClose();
  };

  return (
    <Modal title="Chỉnh sửa nội dung thuyết minh" open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="narrationContent">
          <textarea style={{ width: "100%", minHeight: 160, padding: 8 }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isLoading}>Lưu</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
