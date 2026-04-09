import { Card, Descriptions, Image, Space, Typography } from "antd";
import { Icon, type LatLngExpression } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useMemo } from "react";
import type { StallResponse } from "@/dto/stall.dto";
import { normalizeStallCoverImage } from "@/utils/stall.utils";
import "./index.css";

type StallDetailProps = {
  stall: StallResponse;
  getStallAddress: (stall: StallResponse) => string;
  getPriceRange: (stall: StallResponse) => string;
  getOpeningHours: (stall: StallResponse) => string;
  getClosingHours: (stall: StallResponse) => string;
};

export default function StallDetail({
  stall,
  getStallAddress,
  getPriceRange,
  getOpeningHours,
  getClosingHours,
}: StallDetailProps) {
  const hasCoordinates =
    typeof stall.latitude === "number" &&
    Number.isFinite(stall.latitude) &&
    typeof stall.longitude === "number" &&
    Number.isFinite(stall.longitude);

  const mapCenter = useMemo<LatLngExpression | null>(() => {
    if (!hasCoordinates) return null;
    return [stall.latitude, stall.longitude];
  }, [hasCoordinates, stall.latitude, stall.longitude]);

  const mapMarkerIcon = useMemo(
    () =>
      new Icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    [],
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <div className="stall-detail-hero">
        <Image
          src={normalizeStallCoverImage(stall.cover_image)}
          alt={stall.cover_image}
          className="stall-detail-cover"
        />
        <div className="stall-detail-hero-content">
          <Typography.Title level={4} className="stall-detail-title">
            {stall.stall_name}
          </Typography.Title>
          <Typography.Text type="secondary">
            {getStallAddress(stall)}
          </Typography.Text>
        </div>
      </div>

      <Card className="stall-detail-card" title="Thông tin quán">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Tên quán">
            {stall.stall_name}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ quán">
            {getStallAddress(stall)}
          </Descriptions.Item>
          <Descriptions.Item label="Danh mục">{stall.category}</Descriptions.Item>
          <Descriptions.Item label="Mức giá">
            {getPriceRange(stall)}
          </Descriptions.Item>
          <Descriptions.Item label="Giờ hoạt động">
            {getOpeningHours(stall)} - {getClosingHours(stall)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className="stall-detail-card" title="Vị trí trên bản đồ">
        {hasCoordinates && mapCenter ? (
          <div className="stall-detail-map-wrap">
            <MapContainer
              center={mapCenter}
              zoom={16}
              scrollWheelZoom
              className="stall-detail-map"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains={["a", "b", "c", "d"]}
                maxZoom={20}
              />
              <Marker position={mapCenter} icon={mapMarkerIcon} />
            </MapContainer>
            <Typography.Text type="secondary" className="stall-detail-map-note">
              {stall.latitude}, {stall.longitude}
            </Typography.Text>
          </div>
        ) : (
          <Typography.Text type="secondary">
            Chưa có tọa độ để hiển thị bản đồ.
          </Typography.Text>
        )}
      </Card>
    </Space>
  );
}
