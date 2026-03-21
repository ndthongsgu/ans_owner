import {
  ClockCircleOutlined,
  FileTextOutlined,
  SaveOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";
import type { FormInstance } from "antd";
import type { RefObject } from "react";
import type { StallContentFormValues } from "../add";

const { Text, Title } = Typography;

type StallNarrationItem = StallContentFormValues & {
  id: string;
  updatedAt: string;
};

type StallContentEditSectionProps = {
  detailRef: RefObject<HTMLDivElement | null>;
  form: FormInstance<StallContentFormValues>;
  selectedContent?: StallNarrationItem;
  selectedVisibleContent: boolean;
  handleSaveContent: (values: StallContentFormValues) => void;
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

export default function StallContentEditSection({
  detailRef,
  form,
  selectedContent,
  selectedVisibleContent,
  handleSaveContent,
}: StallContentEditSectionProps) {
  return (
    <div ref={detailRef}>
      <Card title="Chi tiết nội dung thuyết minh">
        {selectedContent ? (
          <Space wrap style={{ marginBottom: 12 }}>
            <Tag color="blue">Đang chỉnh sửa: {selectedContent.title}</Tag>
            <Tag color={selectedContent.isActive ? "green" : "default"}>
              {selectedContent.isActive ? "Đang kích hoạt" : "Tạm tắt"}
            </Tag>
            <Tag>{selectedContent.updatedAt}</Tag>
          </Space>
        ) : null}

        {selectedContent && selectedVisibleContent ? (
          <Form form={form} layout="vertical" onFinish={handleSaveContent}>
            <Card
              size="small"
              title="Thông tin nhanh"
              style={{ marginBottom: 16 }}
            >
              <Space direction="vertical">
                <Title level={4}>{selectedContent.title}</Title>
                <Text type="secondary">{selectedContent.summary}</Text>
                <Space wrap>
                  <Tag color="purple">{selectedContent.category}</Tag>
                  <Tag color="cyan">{selectedContent.audience}</Tag>
                  <Tag>{selectedContent.durationMinutes} phút</Tag>
                </Space>
              </Space>
            </Card>

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
                  rules={[
                    { required: true, message: "Vui lòng nhập thời lượng" },
                  ]}
                >
                  <InputNumber
                    size="large"
                    min={1}
                    max={60}
                    style={{ width: "100%" }}
                    addonBefore={<ClockCircleOutlined />}
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
                  <Select
                    size="large"
                    options={categoryOptions}
                    suffixIcon={<TagsOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="audience"
                  label="Đối tượng ưu tiên"
                  rules={[
                    { required: true, message: "Vui lòng chọn đối tượng" },
                  ]}
                >
                  <Select
                    size="large"
                    options={audienceOptions}
                    suffixIcon={<TeamOutlined />}
                  />
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
                {
                  required: true,
                  message: "Vui lòng nhập nội dung thuyết minh",
                },
              ]}
            >
              <Input.TextArea
                rows={10}
                placeholder="Nhập kịch bản thuyết minh chi tiết để hệ thống phát cho khách"
              />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Trạng thái kích hoạt"
              valuePropName="checked"
            >
              <Switch checkedChildren="Đang bật" unCheckedChildren="Tạm tắt" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
              >
                Lưu thay đổi nội dung
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Empty description="Hãy chọn nội dung cần quản lý" />
        )}
      </Card>
    </div>
  );
}
