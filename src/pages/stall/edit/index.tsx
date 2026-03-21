import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  PictureOutlined,
  ShopOutlined,
  TagsOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  Upload,
} from "antd";
import type { FormInstance, UploadFile, UploadProps } from "antd";
import type { RefObject } from "react";
import { categoryOptions, priceOptions } from "@/constants/stall.constants";
import type { StallItem } from "@/dto/stall.dto";

const { Title, Text } = Typography;

type StallEditSectionProps = {
  detailRef: RefObject<HTMLDivElement | null>;
  form: FormInstance<StallItem>;
  selectedStall?: StallItem;
  selectedVisibleStall: boolean;
  watchedCoverImage?: string;
  mapEmbedUrl: string;
  mapSearchUrl: string;
  uploadFileList: UploadFile[];
  handleUploadChange: UploadProps["onChange"];
  handleSaveStall: (values: StallItem) => void;
};

export default function StallEditSection({
  detailRef,
  form,
  selectedStall,
  selectedVisibleStall,
  watchedCoverImage,
  mapEmbedUrl,
  mapSearchUrl,
  uploadFileList,
  handleUploadChange,
  handleSaveStall,
}: StallEditSectionProps) {
  return (
    <div ref={detailRef}>
      <Card title="Thông tin chi tiết quán">
        {selectedStall ? (
          <Tag color="orange">Đang chỉnh sửa: {selectedStall.name}</Tag>
        ) : null}

        {selectedStall && selectedVisibleStall ? (
          <Form form={form} layout="vertical" onFinish={handleSaveStall}>
            <Card size="small" title="Tổng quan quán">
              <Space direction="vertical">
                <Title level={4}>{selectedStall.name}</Title>
                <Text type="secondary">{selectedStall.location}</Text>
                <Space wrap>
                  <Tag color="gold">{selectedStall.priceRange}</Tag>
                  <Tag color="blue">{selectedStall.category}</Tag>
                  <Tag>
                    {selectedStall.openTime} - {selectedStall.closeTime}
                  </Tag>
                </Space>
              </Space>
            </Card>

            <Divider />

            <Typography.Title level={5}>
              <ShopOutlined /> Thông tin cơ bản
            </Typography.Title>
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

            <Space direction="vertical">
              <Text type="secondary">
                Chọn vị trí trên Google Maps rồi copy địa chỉ vào ô Vị trí để
                lưu chính xác.
              </Text>
              <Button
                icon={<GlobalOutlined />}
                onClick={() =>
                  window.open(mapSearchUrl, "_blank", "noopener,noreferrer")
                }
              >
                Chọn vị trí với Google Maps
              </Button>
            </Space>

            <iframe
              title="Bản đồ vị trí quán"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              width="100%"
              height={280}
            />

            <Form.Item
              name="coverImage"
              label="Ảnh bìa"
              rules={[
                {
                  required: true,
                  message: "Vui lòng tải ảnh hoặc nhập URL",
                },
              ]}
            >
              <Upload
                listType="picture"
                maxCount={1}
                accept="image/*"
                beforeUpload={() => false}
                fileList={uploadFileList}
                onChange={handleUploadChange}
                onRemove={() => {
                  form.setFieldValue("coverImage", "");
                  return true;
                }}
              >
                {!uploadFileList.length && (
                  <Button icon={<UploadOutlined />}>Tải ảnh</Button>
                )}
              </Upload>
            </Form.Item>

            <Form.Item label="Hoặc dán URL ảnh (tuỳ chọn)">
              <Input
                size="large"
                prefix={<PictureOutlined />}
                placeholder="https://..."
                value={watchedCoverImage}
                onChange={(e) =>
                  form.setFieldValue("coverImage", e.target.value)
                }
              />
            </Form.Item>

            <img
              src={watchedCoverImage || selectedStall.coverImage}
              alt={selectedStall.name}
              width="100%"
            />

            <Divider />

            <Typography.Title level={5}>
              <ClockCircleOutlined /> Thời gian mở cửa
            </Typography.Title>
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="openTime"
                  label="Giờ mở cửa"
                  rules={[
                    { required: true, message: "Vui lòng nhập giờ mở cửa" },
                  ]}
                >
                  <Input size="large" placeholder="08:00" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="closeTime"
                  label="Giờ đóng cửa"
                  rules={[
                    { required: true, message: "Vui lòng nhập giờ đóng cửa" },
                  ]}
                >
                  <Input size="large" placeholder="22:00" />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Typography.Title level={5}>
              <TagsOutlined /> Danh mục và mức giá
            </Typography.Title>
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="category"
                  label="Danh mục"
                  rules={[
                    { required: true, message: "Vui lòng chọn danh mục" },
                  ]}
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

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large">
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Empty description="Hãy chọn quán để quản lý" />
        )}
      </Card>
    </div>
  );
}
