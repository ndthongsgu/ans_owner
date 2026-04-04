import { Form, Input, Modal } from "antd";
import type { FormInstance } from "antd";
import { useEffect } from "react";
import type { StallContentUpdateRequest } from "@/dto/stall-content.dto";

export type StallContentEditFormValues = StallContentUpdateRequest & {
  id?: string;
  stall_id?: string;
  stall_name?: string;
};

type StallContentEditModalProps = {
  open: boolean;
  form: FormInstance<StallContentEditFormValues>;
  stallId?: string;
  onCancel: () => void;
  onSave: () => void;
};

export default function StallContentEditModal({
  open,
  form,
  stallId,
  onCancel,
  onSave,
}: StallContentEditModalProps) {
  useEffect(() => {
    if (open && stallId) {
      form.setFieldsValue({ stall_id: stallId });
    }
  }, [form, open, stallId]);

  return (
    <Modal
      title="Chỉnh sửa nội dung thuyết minh"
      open={open}
      onCancel={onCancel}
      onOk={onSave}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      width={760}
      destroyOnHidden
    >
      <Form<StallContentEditFormValues> form={form} layout="vertical">
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="stall_id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="stall_name"
          label="Quán"
          rules={[{ required: true, message: "Không tìm thấy tên quán" }]}
        >
          <Input size="large" placeholder="Tên quán" disabled />
        </Form.Item>

        <Form.Item
          name="tts_script"
          label="Nội dung thuyết minh"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung thuyết minh" },
          ]}
        >
          <Input.TextArea
            rows={8}
            placeholder="Nhập kịch bản thuyết minh chi tiết để hệ thống phát cho khách"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
