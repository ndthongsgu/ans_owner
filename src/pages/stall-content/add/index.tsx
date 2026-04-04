import { Form, Input, Modal, Select } from "antd";
import type { FormInstance } from "antd";
import { useMemo } from "react";

import type { StallContentCreateRequest } from "@/dto/stall-content.dto";

type StallContentAddModalProps = {
  open: boolean;
  form: FormInstance<StallContentCreateRequest>;
  onCancel: () => void;
  onCreate: () => void;
  stallOptions: Array<{ label: string; value: string }>;
};

export default function StallContentAddModal({
  open,
  form,
  onCancel,
  onCreate,
  stallOptions,
}: StallContentAddModalProps) {
  const filteredStallOptions = useMemo(() => stallOptions, [stallOptions]);

  return (
    <Modal
      title="Thêm nội dung thuyết minh"
      open={open}
      onCancel={onCancel}
      onOk={onCreate}
      okText="Tạo nội dung"
      cancelText="Hủy"
      width={760}
      destroyOnHidden
    >
      <Form<StallContentCreateRequest> form={form} layout="vertical">
        <Form.Item
          name="stall_id"
          label="Quán"
          rules={[{ required: true, message: "Vui lòng chọn quán" }]}
        >
          <Select
            size="large"
            options={filteredStallOptions}
            placeholder="Chọn quán"
            showSearch
            optionFilterProp="label"
          />
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
