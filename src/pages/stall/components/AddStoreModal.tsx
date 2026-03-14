import { EnvironmentOutlined, PictureOutlined } from "@ant-design/icons";
import { Col, Form, Input, Modal, Row, Select } from "antd";
import type { FormInstance } from "antd";
import { categoryOptions, priceOptions } from "../constants";
import type { StoreItem } from "../types";

type AddStoreModalProps = {
  open: boolean;
  form: FormInstance<StoreItem>;
  onCancel: () => void;
  onCreate: () => void;
};

export default function AddStoreModal({
  open,
  form,
  onCancel,
  onCreate,
}: AddStoreModalProps) {
  return (
    <Modal
      title="Thêm quán mới"
      open={open}
      onCancel={onCancel}
      onOk={onCreate}
      okText="Tạo quán"
      cancelText="Huỷ"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên quán"
          rules={[{ required: true, message: "Vui lòng nhập tên quán" }]}
        >
          <Input size="large" placeholder="Ví dụ: Quán Ăn Gia Đình" />
        </Form.Item>

        <Form.Item
          name="location"
          label="Vị trí"
          rules={[{ required: true, message: "Vui lòng nhập vị trí" }]}
        >
          <Input
            size="large"
            prefix={<EnvironmentOutlined />}
            placeholder="Ví dụ: 12 Nguyễn Huệ, Quận 1"
          />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
            >
              <Select size="large" options={categoryOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="priceRange"
              label="Mức giá"
              rules={[{ required: true, message: "Vui lòng chọn mức giá" }]}
            >
              <Select size="large" options={priceOptions} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="openTime"
              label="Giờ mở cửa"
              rules={[{ required: true, message: "Vui lòng nhập giờ mở cửa" }]}
            >
              <Input size="large" placeholder="08:00" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="closeTime"
              label="Giờ đóng cửa"
              rules={[{ required: true, message: "Vui lòng nhập giờ đóng cửa" }]}
            >
              <Input size="large" placeholder="22:00" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="coverImage" label="URL ảnh bìa (tuỳ chọn)">
          <Input
            size="large"
            prefix={<PictureOutlined />}
            placeholder="https://..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
