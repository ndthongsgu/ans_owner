import { EnvironmentOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { Icon, type LatLngExpression, type LeafletMouseEvent } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { FormInstance } from "antd";
import { categoryOptions, priceOptions } from "@/constants/stall.constants";
import type { StallItem } from "@/dto/stall.dto";
import { toBase64 } from "@/utils/stall.utils";
import "./index.css";

const { Text } = Typography;

type StallAddModalProps = {
  open: boolean;
  form: FormInstance<StallItem>;
  onCancel: () => void;
  onCreate: () => void;
};

const VINH_KHANH_CENTER: LatLngExpression = [10.76095, 106.7047];
const VINH_KHANH_BOUNDS = {
  minLat: 10.7565,
  maxLat: 10.7655,
  minLng: 106.6995,
  maxLng: 106.7095,
};

const isVinhKhanhAddress = (value: string) => {
  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized.includes("vinh khanh");
};

const isInVinhKhanhBounds = (lat: number, lng: number) => {
  return (
    lat >= VINH_KHANH_BOUNDS.minLat &&
    lat <= VINH_KHANH_BOUNDS.maxLat &&
    lng >= VINH_KHANH_BOUNDS.minLng &&
    lng <= VINH_KHANH_BOUNDS.maxLng
  );
};

const locationMarkerIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type LocationPickerProps = {
  onPick: (e: LeafletMouseEvent) => void;
};

function LocationPicker({ onPick }: LocationPickerProps) {
  useMapEvents({
    click: onPick,
  });

  return null;
}

export default function StallAddModal({
  open,
  form,
  onCancel,
  onCreate,
}: StallAddModalProps) {
  const [selectedPosition, setSelectedPosition] = useState<
    LatLngExpression | undefined
  >(undefined);
  const [selectedLocationText, setSelectedLocationText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const watchedCoverImage = Form.useWatch("coverImage", form);

  const mapCenter = useMemo<LatLngExpression>(() => {
    if (selectedPosition) return selectedPosition;
    return VINH_KHANH_CENTER;
  }, [selectedPosition]);

  const handlePickPosition = async (e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;

    if (!isInVinhKhanhBounds(lat, lng)) {
      message.warning("Vui lòng chọn vị trí trong khu vực Phố Vĩnh Khánh");
      return;
    }

    setSelectedPosition([lat, lng]);
    const fallbackLocation = `Phố Vĩnh Khánh (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
    form.setFieldValue("location", fallbackLocation);
    setSelectedLocationText(fallbackLocation);
    await form.validateFields(["location"]).catch(() => undefined);

    try {
      const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const response = await fetch(reverseUrl, {
        headers: {
          Accept: "application/json",
        },
      });
      const data = (await response.json()) as {
        display_name?: string;
        address?: {
          road?: string;
          suburb?: string;
          quarter?: string;
          city_district?: string;
          city?: string;
        };
      };

      const road = data.address?.road || "Phố Vĩnh Khánh";
      const ward = data.address?.quarter || data.address?.suburb || "Phường 8";
      const district = data.address?.city_district || "Quận 4";
      const city = data.address?.city || "TP Hồ Chí Minh";

      const resolved = data.display_name
        ? `${road}, ${ward}, ${district}, ${city}`
        : fallbackLocation;

      form.setFieldValue("location", resolved);
      setSelectedLocationText(resolved);
      await form.validateFields(["location"]).catch(() => undefined);
      message.success("Đã chọn vị trí quán");
    } catch {
      message.info("Đã lưu tọa độ vị trí, không lấy được địa chỉ chi tiết");
    }
  };

  const handleSelectCoverFile = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64Image = await toBase64(file);
      form.setFieldValue("coverImage", base64Image);
      message.success("Đã chọn ảnh bìa từ thiết bị");
    } catch {
      message.error("Không thể đọc file ảnh, vui lòng thử lại");
    } finally {
      event.target.value = "";
    }
  };

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
          rules={[
            { required: true, message: "Vui lòng nhập vị trí" },
            {
              validator: (_, value: string) => {
                if (!value || isVinhKhanhAddress(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Chỉ hỗ trợ địa chỉ thuộc Phố Vĩnh Khánh"),
                );
              },
            },
          ]}
        >
          <Input
            size="large"
            prefix={<EnvironmentOutlined />}
            placeholder="Ví dụ: 12 Vĩnh Khánh, Phường 8, Quận 4"
          />
        </Form.Item>

        <Space direction="vertical" size="small">
          <Text type="secondary">
            Vị trí tạo quán được giới hạn trong khu vực Phố Vĩnh Khánh. Nhấn
            trực tiếp trên bản đồ OpenStreetMap để chọn vị trí.
          </Text>
          {selectedLocationText ? (
            <Text>
              Vị trí đã chọn: <strong>{selectedLocationText}</strong>
            </Text>
          ) : null}
        </Space>

        <MapContainer
          center={mapCenter}
          zoom={17}
          scrollWheelZoom
          className="stall-add-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationPicker onPick={handlePickPosition} />
          {selectedPosition ? (
            <Marker position={selectedPosition} icon={locationMarkerIcon} />
          ) : null}
        </MapContainer>

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
              rules={[
                { required: true, message: "Vui lòng nhập giờ đóng cửa" },
              ]}
            >
              <Input size="large" placeholder="22:00" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="coverImage" label="Ảnh bìa (chọn từ máy)">
          <Space direction="vertical" size="small">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              aria-label="Chọn ảnh bìa quán"
              title="Chọn ảnh bìa quán"
              className="stall-file-input-hidden"
              onChange={handleSelectCoverFile}
            />

            <Space>
              <Button
                icon={<UploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
              >
                Chọn ảnh bìa
              </Button>
              {watchedCoverImage ? (
                <Button
                  danger
                  onClick={() => form.setFieldValue("coverImage", "")}
                >
                  Xóa ảnh
                </Button>
              ) : null}
            </Space>

            {watchedCoverImage ? (
              <Image
                src={watchedCoverImage}
                alt="Ảnh bìa quán mới"
                className="stall-cover-preview"
              />
            ) : (
              <Text type="secondary">Chưa chọn ảnh bìa</Text>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
