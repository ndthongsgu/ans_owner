import { Card, Col, Descriptions, Row, Statistic, Typography } from "antd";

const { Title, Text } = Typography;

type StallContentHeroSectionProps = {
  totalContent: number;
  activeContent: number;
  visibleContent: number;
  selectedCategory: string;
  selectedDuration: string;
};

export default function StallContentHeroSection({
  totalContent,
  activeContent,
  visibleContent,
  selectedCategory,
  selectedDuration,
}: StallContentHeroSectionProps) {
  return (
    <Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Text type="secondary">Narration Content Center</Text>
          <Title level={3}>Quản lý nội dung thuyết minh</Title>
          <Text type="secondary">
            Chuẩn hóa nội dung theo từng nhóm món, theo dõi trạng thái kích hoạt
            và cập nhật kịch bản ngay tại một màn hình.
          </Text>
        </Col>

        <Col xs={24} lg={12}>
          <Row gutter={[12, 12]}>
            <Col xs={12} md={8}>
              <Statistic title="Tổng nội dung" value={totalContent} />
            </Col>
            <Col xs={12} md={8}>
              <Statistic title="Đang kích hoạt" value={activeContent} />
            </Col>
            <Col xs={24} md={8}>
              <Statistic title="Đang hiển thị" value={visibleContent} />
            </Col>
          </Row>

          <Descriptions column={1} size="small" style={{ marginTop: 12 }}>
            <Descriptions.Item label="Nhóm nội dung hiện tại">
              {selectedCategory}
            </Descriptions.Item>
            <Descriptions.Item label="Thời lượng bài đang chọn">
              {selectedDuration}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
}
