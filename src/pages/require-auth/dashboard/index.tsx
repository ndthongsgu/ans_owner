import {
  AudioOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HeartFilled,
  LineChartOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ShopOutlined,
  SoundOutlined,
  StarFilled,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import { Icon, type LatLngExpression } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import PackageSelector from "@/components/package/PackageSelector";
import { useProfile } from "@/hooks/owner";
import { useMySubscription } from "@/hooks/subscription";
import { useStalls } from "@/hooks/stall/index";
import {
  useListenStallContentByLanguage,
  useStallContents,
} from "@/hooks/stall-content/index";
import { useAudioPlayback } from "@/hooks/stall-content/useAudioPlayback";
import { useToast } from "@/hooks/layout/useToast";
import { REQUIRE_AUTH_ROUTES } from "@/routes/routes";
import { useNavigate } from "react-router-dom";
import { formatUnixTimestamp } from "@/utils/date.utils";
import { LANGUAGE_CODE_MAP, LANGUAGE_LABELS } from "@/utils/language.utils";
import type { StallContentResponse } from "@/dto/stall-content.dto";
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

const DEFAULT_CENTER: LatLngExpression = [10.7578, 106.7046];

const isValidLatLng = (lat: number, lng: number) => {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

const mapMarkerIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const extractPlayableStallContent = (payload: unknown) => {
  const parseObject = (
    source: unknown,
  ): { script: string | null; audioUrl: string | null } => {
    if (Array.isArray(source)) {
      for (const item of source) {
        const parsed = parseObject(item);
        if (parsed.script || parsed.audioUrl) {
          return parsed;
        }
      }

      return { script: null, audioUrl: null };
    }

    if (!source || typeof source !== "object") {
      return { script: null, audioUrl: null };
    }

    const sourceObj = source as Record<string, unknown>;
    const directScript = [
      sourceObj.tts_script,
      sourceObj.script,
      sourceObj.text,
      sourceObj.content,
      sourceObj.ttsScript,
    ].find(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
    const directAudio = [
      sourceObj.audio_url,
      sourceObj.audioUrl,
      sourceObj.url,
      sourceObj.audio,
    ].find(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );

    if (directScript || directAudio) {
      return {
        script: directScript || null,
        audioUrl: directAudio || null,
      };
    }

    const nestedCandidates = [
      sourceObj.data,
      sourceObj.items,
      sourceObj.result,
      sourceObj.stall_content,
      sourceObj.payload,
      sourceObj.content,
    ];

    for (const candidate of nestedCandidates) {
      const parsed = parseObject(candidate);
      if (parsed.script || parsed.audioUrl) {
        return parsed;
      }
    }

    return { script: null, audioUrl: null };
  };

  if (typeof payload === "string") {
    const value = payload.trim();
    return { script: value.length ? value : null, audioUrl: null };
  }

  return parseObject(payload);
};

type FlyToStallProps = {
  position: LatLngExpression;
};

function FlyToStall({ position }: FlyToStallProps) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 17, { duration: 0.8 });
  }, [map, position]);

  return null;
}

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
  const showToast = useToast();
  const { data: profile } = useProfile();
  const { data: mySub } = useMySubscription();
  const { data: stalls = [] } = useStalls();
  const { data: stallContents = [] } = useStallContents();
  const listenByLanguageMutation = useListenStallContentByLanguage();
  const { playAudioUrl, playScript, stopPlayback } =
    useAudioPlayback(showToast);
  const [showPackages, setShowPackages] = useState(false);
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("vi");
  const [scriptCacheByStallLanguage, setScriptCacheByStallLanguage] = useState<
    Record<string, string>
  >({});

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

  const contentsByStallId = useMemo(() => {
    const map = new Map<string, StallContentResponse[]>();

    stallContents
      .filter((content) => !content.is_deleted)
      .forEach((content) => {
        const prev = map.get(content.stall_id) || [];
        prev.push(content);
        map.set(content.stall_id, prev);
      });

    return map;
  }, [stallContents]);

  const mapStalls = useMemo(() => {
    return stalls.filter(
      (stall) =>
        isValidLatLng(stall.latitude, stall.longitude) &&
        (contentsByStallId.get(stall.id)?.length || 0) > 0,
    );
  }, [contentsByStallId, stalls]);

  const totalPoiContents = useMemo(
    () => stallContents.filter((content) => !content.is_deleted).length,
    [stallContents],
  );

  const selectedStall = useMemo(() => {
    if (selectedStallId) {
      const found = mapStalls.find((stall) => stall.id === selectedStallId);
      if (found) return found;
    }

    return mapStalls[0] || null;
  }, [mapStalls, selectedStallId]);

  const mapCenter = useMemo<LatLngExpression>(() => {
    if (!selectedStall) {
      return DEFAULT_CENTER;
    }

    return [selectedStall.latitude, selectedStall.longitude];
  }, [selectedStall]);

  const selectedStallContents = useMemo(() => {
    if (!selectedStall) {
      return [];
    }

    return contentsByStallId.get(selectedStall.id) || [];
  }, [contentsByStallId, selectedStall]);

  const selectedPoiCount = selectedStallContents.length;

  const languageOptions = useMemo(() => {
    return Object.keys(LANGUAGE_CODE_MAP).map((code) => ({
      value: code,
      label: LANGUAGE_LABELS[code as keyof typeof LANGUAGE_LABELS] || code.toUpperCase(),
    }));
  }, []);

  const preferredLanguage = useMemo(() => {
    if (!selectedStallContents.length) {
      return "vi";
    }

    const preferred =
      selectedStallContents.find((item) =>
        (item.language_code || "").toLowerCase().startsWith("vi"),
      ) || selectedStallContents[0];

    return (preferred.language_code || "vi").toLowerCase();
  }, [selectedStallContents]);

  const effectiveSelectedLanguage = useMemo(() => {
    const languageExists = languageOptions.some(
      (option) => option.value === selectedLanguage,
    );

    return languageExists ? selectedLanguage : preferredLanguage;
  }, [languageOptions, preferredLanguage, selectedLanguage]);

  const selectedStallPoi = useMemo(() => {
    if (!selectedStallContents.length) {
      return null;
    }

    return (
      selectedStallContents.find(
        (item) =>
          (item.language_code || "vi").toLowerCase() ===
          effectiveSelectedLanguage,
      ) ||
      selectedStallContents.find((item) =>
        (item.language_code || "").toLowerCase().startsWith("vi"),
      ) ||
      selectedStallContents[0]
    );
  }, [effectiveSelectedLanguage, selectedStallContents]);

  const scriptCacheKey = selectedStall
    ? `${selectedStall.id}:${effectiveSelectedLanguage}`
    : "";

  const displayedScript =
    (scriptCacheKey ? scriptCacheByStallLanguage[scriptCacheKey] : "") ||
    selectedStallPoi?.tts_script ||
    "";

  const handleChangeLanguage = async (value: string) => {
    setSelectedLanguage(value);

    if (!selectedStall) {
      return;
    }

    const localMatched = selectedStallContents.find(
      (item) => (item.language_code || "vi").toLowerCase() === value,
    );
    if (localMatched?.tts_script) {
      return;
    }

    try {
      const payload = await listenByLanguageMutation.mutateAsync({
        stallId: selectedStall.id,
        languageCode: value,
      });

      const playable = extractPlayableStallContent(payload);
      setScriptCacheByStallLanguage((prev) => ({
        ...prev,
        [`${selectedStall.id}:${value}`]:
          playable.script || localMatched?.tts_script || "",
      }));
    } catch {
      setScriptCacheByStallLanguage((prev) => ({
        ...prev,
        [`${selectedStall.id}:${value}`]: localMatched?.tts_script || "",
      }));
    }
  };

  const handleSelectStall = (stallId: string) => {
    setSelectedStallId(stallId);
  };

  const handlePlayPoi = () => {
    if (!selectedStall) {
      showToast({
        type: "warning",
        title: "Chưa có quán",
        message: "Không có quán hợp lệ để phát POI",
      });
      return;
    }

    if (!selectedStallPoi && !selectedStall) {
      showToast({
        type: "warning",
        title: "Chưa có nội dung POI",
        message: "Vui lòng chọn quán có nội dung để phát",
      });
      return;
    }

    if (!selectedStallPoi && selectedStall) {
      showToast({
        type: "warning",
        title: "Chưa có nội dung POI",
        message: `Quán ${selectedStall.stall_name} chưa có nội dung thuyết minh`,
      });
      return;
    }

    if (!selectedStallPoi) {
      return;
    }

    const selectedLanguageCode = effectiveSelectedLanguage || "vi";
    const localMatched = selectedStallContents.find(
      (item) =>
        (item.language_code || "vi").toLowerCase() === selectedLanguageCode,
    );

    if (localMatched?.audio_url?.trim()) {
      void playAudioUrl(localMatched.audio_url);
      return;
    }

    if (localMatched?.tts_script?.trim()) {
      playScript(localMatched.tts_script, selectedLanguageCode);
      return;
    }

    void (async () => {
      try {
        const payload = await listenByLanguageMutation.mutateAsync({
          stallId: selectedStall.id,
          languageCode: selectedLanguageCode,
        });

        const playable = extractPlayableStallContent(payload);
        if (playable.audioUrl) {
          await playAudioUrl(playable.audioUrl);
          return;
        }

        if (playable.script) {
          const nextScript = playable.script;
          playScript(playable.script, selectedLanguageCode);
          setScriptCacheByStallLanguage((prev) => ({
            ...prev,
            [`${selectedStall.id}:${selectedLanguageCode}`]: nextScript,
          }));
          return;
        }

        showToast({
          type: "warning",
          title: "Không có dữ liệu phát",
          message: "Không tìm thấy audio hoặc script phù hợp ngôn ngữ đã chọn",
        });
      } catch {
        showToast({
          type: "error",
          title: "Lỗi phát POI",
          message: "Không thể lấy nội dung theo ngôn ngữ đã chọn",
        });
      }
    })();
  };

  return (
    <div className="owner-dashboard-page">
      <section className="owner-hero">
        <div className="owner-hero-content">
          <Title level={2} className="owner-hero-title">
            Xin chào, {ownerName}
          </Title>
          <Text className="owner-hero-subtitle">
            Theo dõi hiệu suất nghe thuyết minh, chất lượng đánh giá và mức độ
            yêu thích quán theo thời gian thực.
          </Text>
          <Space size={8} wrap className="owner-hero-chips">
            <span className="owner-hero-chip">
              {mapStalls.length} quán có POI
            </span>
            <span className="owner-hero-chip">
              {totalPoiContents} nội dung hoạt động
            </span>
            <span className="owner-hero-chip">
              {selectedPoiCount} POI quán đang chọn
            </span>
          </Space>
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

          <Card className="owner-map-card">
            <div className="owner-map-header">
              <div className="owner-section-title owner-map-title">
                <EnvironmentOutlined /> Bản đồ quán và POI
              </div>
              <Text className="owner-map-counter">
                {mapStalls.length} điểm hiển thị
              </Text>
            </div>
            <Typography.Paragraph className="owner-map-description">
              Chỉ hiển thị quán có nội dung POI. Chọn marker để xem script, chọn
              ngôn ngữ và nghe trực tiếp ngay trên dashboard.
            </Typography.Paragraph>

            {mapStalls.length ? (
              <>
                <div className="owner-map-canvas">
                  <MapContainer
                    center={mapCenter}
                    zoom={16}
                    scrollWheelZoom
                    className="owner-leaflet-map"
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      subdomains={["a", "b", "c", "d"]}
                      maxZoom={20}
                    />
                    <FlyToStall position={mapCenter} />
                    {mapStalls.map((stall) => (
                      <Marker
                        key={stall.id}
                        position={[stall.latitude, stall.longitude]}
                        icon={mapMarkerIcon}
                        eventHandlers={{
                          click: () => handleSelectStall(stall.id),
                        }}
                      >
                        <Popup>
                          <strong>{stall.stall_name}</strong>
                          <div>{stall.category || "Chưa phân loại"}</div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>

                <div className="owner-poi-actions">
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handlePlayPoi}
                    className="owner-poi-btn-primary"
                  >
                    Nghe POI quán đang chọn
                  </Button>
                  <Button
                    icon={<PauseCircleOutlined />}
                    onClick={stopPlayback}
                    className="owner-poi-btn-secondary"
                  >
                    Dừng phát
                  </Button>
                  {selectedStall ? (
                    <Typography.Text
                      className="owner-selected-stall"
                      type="secondary"
                    >
                      Đang chọn: <strong>{selectedStall.stall_name}</strong>
                    </Typography.Text>
                  ) : null}
                </div>
              </>
            ) : (
              <Empty description="Chưa có quán có nội dung POI và tọa độ hợp lệ" />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <div className="owner-sidebar-title-wrap">
            <Text className="owner-sidebar-title">Bảng điều khiển nhanh</Text>
          </div>
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

            <Card
              title="Danh sách quán trên bản đồ"
              className="owner-info-card owner-stall-list-card"
            >
              {mapStalls.length ? (
                <div className="owner-stall-list">
                  {mapStalls.map((stall) => {
                    const isSelected = selectedStall?.id === stall.id;
                    return (
                      <button
                        key={stall.id}
                        type="button"
                        className={`owner-stall-item${isSelected ? " selected" : ""}`}
                        onClick={() => handleSelectStall(stall.id)}
                      >
                        <div className="owner-stall-item-head">
                          <span className="owner-stall-name">
                            {stall.stall_name}
                          </span>
                          <span className="owner-stall-status has-poi">
                            Có POI
                          </span>
                        </div>
                        <div className="owner-stall-meta">
                          <EnvironmentOutlined /> {stall.latitude.toFixed(4)},{" "}
                          {stall.longitude.toFixed(4)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có dữ liệu quán"
                />
              )}
            </Card>

            {selectedStall ? (
              <Card title="POI hiện tại" className="owner-info-card">
                <div className="owner-info-item">
                  <AudioOutlined />
                  <div>
                    <Text type="secondary">Nội dung theo ngôn ngữ</Text>
                    <div>
                      <Text strong>{selectedStall.stall_name}</Text>
                    </div>
                  </div>
                </div>
                <Divider />
                <Space
                  direction="vertical"
                  size={10}
                  className="owner-poi-language-block"
                >
                  <Select
                    value={effectiveSelectedLanguage}
                    options={languageOptions}
                    onChange={(value) => {
                      void handleChangeLanguage(value);
                    }}
                    style={{ width: "100%" }}
                    loading={listenByLanguageMutation.isPending}
                  />
                  <Text className="owner-poi-script-preview">
                    {displayedScript ||
                      "(Không có script cho ngôn ngữ đã chọn)"}
                  </Text>
                </Space>
              </Card>
            ) : null}
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
