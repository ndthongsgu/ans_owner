import {
  CalendarOutlined,
  EnvironmentOutlined,
  HeartFilled,
  LineChartOutlined,
  ShopOutlined,
  SoundOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Button, Card, Col, Divider, Row, Space, Typography } from "antd";
import { useState } from "react";
import PackageSelector from "../../../components/owner/PackageSelector";
import { useProfile } from "@/hooks/owner";
import { useMySubscription } from "@/hooks/subscription";
import { REQUIRE_AUTH_ROUTES } from "@/routes/routes";
import { useNavigate } from "react-router-dom";
import { formatUnixTimestamp } from "@/utils/date.utils";
import "./index.css";

const { Title, Text } = Typography;

const listenSeries = [42, 68, 55, 92, 110, 124, 118, 142, 158, 167, 182, 210];
const labels = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

function buildChartPoints(
  data: number[],
  width: number,
  height: number,
  padding: number,
) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = Math.max(max - min, 1);
  const xStep = (width - padding * 2) / (data.length - 1);

  return data
    .map((value, index) => {
      const x = padding + index * xStep;
      const y =
        height - padding - ((value - min) / span) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: mySub } = useMySubscription();
  const [showPackages, setShowPackages] = useState(false);

  const owner = profile?.owner;
  const ownerName = owner?.full_name || "Chưa cập nhật";
  const phone = owner?.phone || "Chưa cập nhật";
  const shopName = owner?.business_name || "Chưa có tên quán";
  const shopLocation = owner?.business_address || "Chưa có địa chỉ";

  const subscriptionName = mySub?.packageName || "Chưa đăng ký";
  const expiresAt = mySub?.expiresAt || owner?.subscription_expires_at;
  const expirationText =
    formatUnixTimestamp(expiresAt, "", "DD/MM/YYYY") || null;

  const totalListens = listenSeries.reduce((sum, item) => sum + item, 0);
  const avgRating = 4.7;
  const totalFavorites = 1375;
  const latestMonthGrowth = Math.round(
    ((listenSeries[listenSeries.length - 1] -
      listenSeries[listenSeries.length - 2]) /
      listenSeries[listenSeries.length - 2]) *
      100,
  );

  const chartPoints = buildChartPoints(listenSeries, 760, 280, 36);
  const areaPoints = `${chartPoints} 724,244 36,244`;

  return (
    <div className="owner-dashboard-page">
      <section className="owner-hero">
        <div>
          <Title level={2} className="owner-hero-title">
            Xin chào, {ownerName}
          </Title>
          <Text className="owner-hero-subtitle">
            Theo dõi hiệu suất nghe thuyết minh, chất lượng đánh giá và mức độ
            yêu thích quán theo thời gian thực.
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          className="owner-hero-button"
          onClick={() => setShowPackages(true)}
        >
          Quản lý gói đăng ký
        </Button>
      </section>

      <Row gutter={[16, 16]} className="owner-kpis-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="owner-kpi-card owner-kpi-listens">
            <div className="owner-kpi-head">
              <SoundOutlined className="owner-kpi-icon" />
              <Text className="owner-kpi-label">
                Tổng lượt nghe thuyết minh
              </Text>
            </div>
            <Title level={3} className="owner-kpi-value">
              {totalListens.toLocaleString("vi-VN")}
            </Title>
            <Text className="owner-kpi-trend">
              +{latestMonthGrowth}% so với kỳ trước
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="owner-kpi-card owner-kpi-rating">
            <div className="owner-kpi-head">
              <StarFilled className="owner-kpi-icon" />
              <Text className="owner-kpi-label">Đánh giá trung bình</Text>
            </div>
            <Title level={3} className="owner-kpi-value">
              {avgRating.toFixed(1)} / 5
            </Title>
            <Text className="owner-kpi-trend">
              Xếp hạng xuất sắc trong khu vực
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="owner-kpi-card owner-kpi-favorites">
            <div className="owner-kpi-head">
              <HeartFilled className="owner-kpi-icon" />
              <Text className="owner-kpi-label">Số lượt yêu thích</Text>
            </div>
            <Title level={3} className="owner-kpi-value">
              {totalFavorites.toLocaleString("vi-VN")}
            </Title>
            <Text className="owner-kpi-trend">Tăng ổn định qua từng tháng</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="owner-kpi-card owner-kpi-growth">
            <div className="owner-kpi-head">
              <LineChartOutlined className="owner-kpi-icon" />
              <Text className="owner-kpi-label">Xu hướng tăng trưởng</Text>
            </div>
            <Title level={3} className="owner-kpi-value">
              +{latestMonthGrowth}%
            </Title>
            <Text className="owner-kpi-trend">
              Hiệu quả chiến dịch tháng gần nhất
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card className="owner-chart-card">
            <div className="owner-section-title">
              <LineChartOutlined /> Biểu đồ lượt nghe theo thời gian
            </div>

            <div className="owner-chart-wrap">
              <svg
                viewBox="0 0 760 280"
                className="owner-chart-svg"
                role="img"
                aria-label="Biểu đồ lượt nghe theo thời gian"
              >
                <defs>
                  <linearGradient
                    id="ownerListenGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.45" />
                    <stop
                      offset="100%"
                      stopColor="#0ea5e9"
                      stopOpacity="0.03"
                    />
                  </linearGradient>
                </defs>

                <line
                  x1="36"
                  y1="244"
                  x2="724"
                  y2="244"
                  className="owner-axis"
                />
                <line x1="36" y1="36" x2="36" y2="244" className="owner-axis" />

                <polygon points={areaPoints} fill="url(#ownerListenGradient)" />
                <polyline points={chartPoints} className="owner-chart-line" />

                {listenSeries.map((value, index) => {
                  const max = Math.max(...listenSeries, 1);
                  const min = Math.min(...listenSeries, 0);
                  const span = Math.max(max - min, 1);
                  const xStep = (760 - 72) / (listenSeries.length - 1);
                  const x = 36 + index * xStep;
                  const y = 280 - 36 - ((value - min) / span) * (280 - 72);

                  return (
                    <circle
                      key={`${labels[index]}-${value}`}
                      cx={x}
                      cy={y}
                      r="4"
                      className="owner-chart-point"
                    />
                  );
                })}
              </svg>

              <div className="owner-chart-labels">
                {labels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Space direction="vertical" size={16} className="owner-side-stack">
            <Card title="Tài khoản chủ quán" className="owner-info-card">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Text type="secondary">Người liên hệ</Text>
                  <div>
                    <Text strong>{ownerName}</Text>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <Text type="secondary">Email</Text>
                  <div>
                    <Text strong>{profile?.email || "Chưa cập nhật"}</Text>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <Text type="secondary">Số điện thoại</Text>
                  <div>
                    <Text strong>{phone}</Text>
                  </div>
                </Col>
              </Row>
              <Divider />
              <Button
                onClick={() => navigate(REQUIRE_AUTH_ROUTES.OWNER_PROFILE)}
              >
                Xem và chỉnh sửa thông tin
              </Button>
            </Card>

            <Card title="Thông tin quán hiện tại" className="owner-info-card">
              <div className="owner-info-item">
                <ShopOutlined />
                <div>
                  <Text type="secondary">Tên quán</Text>
                  <div>
                    <Text strong>{shopName}</Text>
                  </div>
                </div>
              </div>
              <Divider />
              <div className="owner-info-item">
                <EnvironmentOutlined />
                <div>
                  <Text type="secondary">Địa chỉ</Text>
                  <div>
                    <Text>{shopLocation}</Text>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Gói dịch vụ" className="owner-info-card">
              <div className="owner-info-item">
                <CalendarOutlined />
                <div>
                  <Text>
                    Gói hiện tại: <strong>{subscriptionName}</strong>
                    {expirationText && (
                      <span>
                        {" "}
                        (hết hạn: <strong>{expirationText}</strong>)
                      </span>
                    )}
                  </Text>
                </div>
              </div>
              <Divider />
              <Button type="primary" onClick={() => setShowPackages(true)}>
                Quản lý gói đăng ký
              </Button>
            </Card>
          </Space>
        </Col>
      </Row>

      <PackageSelector
        open={showPackages}
        onClose={() => setShowPackages(false)}
      />
    </div>
  );
}
