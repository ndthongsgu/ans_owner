import { FileTextOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Col,
  Select,
  Switch,
} from "antd";
import type { FormInstance } from "antd";

export type StallContentFormValues = {
  title: string;
  category: string;
  audience: string;
  durationMinutes: number;
  isActive: boolean;
  summary: string;
  script: string;
};

type StallContentAddModalProps = {
  open: boolean;
  form: FormInstance<StallContentFormValues>;
  onCancel: () => void;
  onCreate: () => void;
};

const categoryOptions = [
  { label: "Món chính", value: "Món chính" },
  { label: "Món ăn nhẹ", value: "Món ăn nhẹ" },
  { label: "Đồ uống", value: "Đồ uống" },
  { label: "Tráng miệng", value: "Tráng miệng" },
];

const audienceOptions = [
  { label: "Khách gia đình", value: "Khách gia đình" },
  { label: "Khách du lịch", value: "Khách du lịch" },
  { label: "Khách văn phòng", value: "Khách văn phòng" },
  { label: "Khách quốc tế", value: "Khách quốc tế" },
];

export default function StallContentAddModal({
  open,
  form,
  onCancel,
  onCreate,
}: StallContentAddModalProps) {
  return (
    <Modal
      title="Thêm nội dung thuyết minh"
      open={open}
      onCancel={onCancel}
      onOk={onCreate}
      okText="Tạo nội dung"
      cancelText="Hủy"
      width={760}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={12}>
          <Col xs={24} md={14}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input
                size="large"
                prefix={<FileTextOutlined />}
                placeholder="Ví dụ: Giới thiệu món Bún Bò Huế"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={10}>
            <Form.Item
              name="durationMinutes"
              label="Thời lượng (phút)"
              rules={[{ required: true, message: "Vui lòng nhập thời lượng" }]}
            >
              <InputNumber
                size="large"
                min={1}
                max={60}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="category"
              label="Nhóm nội dung"
              rules={[
                { required: true, message: "Vui lòng chọn nhóm nội dung" },
              ]}
            >
              <Select size="large" options={categoryOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="audience"
              label="Đối tượng ưu tiên"
              rules={[{ required: true, message: "Vui lòng chọn đối tượng" }]}
            >
              <Select size="large" options={audienceOptions} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="summary"
          label="Tóm tắt ngắn"
          rules={[{ required: true, message: "Vui lòng nhập tóm tắt" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="2-3 câu mô tả nhanh nội dung dùng cho màn hình danh sách"
          />
        </Form.Item>

        <Form.Item
          name="script"
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

        <Form.Item
          name="isActive"
          label="Kích hoạt ngay"
          valuePropName="checked"
        >
          <Switch checkedChildren="Đang bật" unCheckedChildren="Tạm tắt" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
