import { UploadOutlined, EnvironmentOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Col,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  TimePicker,
  Typography,
  message,
} from "antd";
import { Icon, type LatLngExpression, type LeafletMouseEvent } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { StallCreateRequest, StallResponse } from "@/dto/stall.dto";
import {
  reverseGeocode,
  searchLocationSuggestions,
  type LocationSuggestion,
} from "@/services/location.service";
import {
  extractCoordinates,
  normalizeCoordinate,
} from "@/utils/location.utils";
import {
  hourStringToDayjs,
  hourValueToString,
  normalizeStallCoverImage,
} from "@/utils/stall.utils";
import "../add/index.css";

const { Text } = Typography;

export type StallEditSubmitValues = StallCreateRequest;

type StallEditFormValues = StallEditSubmitValues & {
  location?: string;
};

type StallEditModalProps = {
  open: boolean;
  stall: StallResponse | null;
  onCancel: () => void;
  onSubmit: (values: StallEditSubmitValues) => Promise<void> | void;
  submitting?: boolean;
};

const DEFAULT_CENTER: LatLngExpression = [10.7578, 106.7046];
const DEFAULT_ZOOM = 16;

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

const isClosingAfterOpening = (
  opening?: StallEditFormValues["opening_hours"],
  closing?: StallEditFormValues["close_hours"],
) => {
  if (!opening || !closing) {
    return true;
  }

  try {
    const openingText = hourValueToString(opening);
    const closingText = hourValueToString(closing);
    return closingText > openingText;
  } catch {
    return false;
  }
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

type MapUpdaterProps = {
  position?: LatLngExpression;
  open: boolean;
};

function MapUpdater({ position, open }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 220);

    return () => window.clearTimeout(timer);
  }, [map, open]);

  useEffect(() => {
    if (!position || !map) return;

    const coordinates = extractCoordinates(position);
    if (!coordinates) return;

    const { lat, lng } = coordinates;

    // Double-check that coordinates are valid before trying to use them
    if (
      !isValidLatLng(lat, lng) ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }

    try {
      map.flyTo([lat, lng], 17, { duration: 0.8 });
    } catch {
      // Ignore invalid runtime coordinate errors to keep modal usable.
    }
  }, [map, position]);

  return null;
}

export default function StallEditModal({
  open,
  stall,
  onCancel,
  onSubmit,
  submitting = false,
}: StallEditModalProps) {
  const [form] = Form.useForm<StallEditFormValues>();
  const [selectedPosition, setSelectedPosition] = useState<
    LatLngExpression | undefined
  >(undefined);
  const [locationOptions, setLocationOptions] = useState<LocationSuggestion[]>(
    [],
  );
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchTimerRef = useRef<number | null>(null);
  const latestQueryRef = useRef("");
  const watchedCoverImage = Form.useWatch("cover_image", form);

  const toValidPosition = (
    latValue: unknown,
    lngValue: unknown,
  ): LatLngExpression | undefined => {
    const lat = Number(latValue);
    const lng = Number(lngValue);

    // Check if both values are valid finite numbers
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return undefined;
    }

    if (!isValidLatLng(lat, lng)) {
      return undefined;
    }

    return [normalizeCoordinate(lat), normalizeCoordinate(lng)];
  };

  const safeSelectedPosition = useMemo<LatLngExpression | undefined>(() => {
    const coordinates = extractCoordinates(selectedPosition);
    if (!coordinates) return undefined;

    // Validate that coordinates are finite numbers before returning
    if (!isValidLatLng(coordinates.lat, coordinates.lng)) {
      return undefined;
    }

    return [coordinates.lat, coordinates.lng];
  }, [selectedPosition]);

  const mapCenter = useMemo<LatLngExpression>(() => {
    if (safeSelectedPosition) return safeSelectedPosition;
    return DEFAULT_CENTER;
  }, [safeSelectedPosition]);

  const shouldShowLocationSuggest =
    locationQuery.trim().length > 0 &&
    (searchingLocation || locationOptions.length > 0);

  useEffect(() => {
    if (open && stall) {
      const existingLocation =
        (stall as unknown as { location?: string }).location || "";

      // Validate latitude and longitude before using them
      const validLat =
        typeof stall.latitude === "number" && Number.isFinite(stall.latitude)
          ? stall.latitude
          : undefined;
      const validLng =
        typeof stall.longitude === "number" && Number.isFinite(stall.longitude)
          ? stall.longitude
          : undefined;

      // Only set form values with valid coordinates
      const formValues: Partial<StallEditFormValues> = {
        stall_name: stall.stall_name,
        category: stall.category,
        price_range: stall.price_range,
        radius: stall.radius,
        contact_phone: stall.contact_phone,
        website: stall.website,
        opening_hours: hourStringToDayjs(stall.opening_hours),
        close_hours: hourStringToDayjs(stall.close_hours),
        cover_image: stall.cover_image,
        location: existingLocation,
      };

      // Only set coordinates if they're valid
      if (validLat && validLng) {
        formValues.latitude = validLat;
        formValues.longitude = validLng;
      }

      form.setFieldsValue(formValues);

      // Defer state updates to avoid cascading renders
      const timer = window.setTimeout(() => {
        if (validLat && validLng) {
          const initialPosition = toValidPosition(validLat, validLng);
          if (initialPosition) {
            setSelectedPosition(initialPosition);
            if (!existingLocation) {
              const coordinates = extractCoordinates(initialPosition);
              if (coordinates) {
                void reverseGeocode(coordinates.lat, coordinates.lng).then(
                  (name) => {
                    form.setFields([{ name: "location", value: name }]);
                    setLocationQuery(name);
                  },
                );
              }
            } else {
              setLocationQuery(existingLocation);
            }
          }
        } else {
          setLocationQuery(existingLocation);
          setSelectedPosition(undefined);
        }
      }, 0);

      return () => window.clearTimeout(timer);
    }

    // Handle modal close
    if (!open) {
      const timer = window.setTimeout(() => {
        form.resetFields();
        setSelectedPosition(undefined);
        setLocationOptions([]);
        setSearchingLocation(false);
        setLocationQuery("");
        latestQueryRef.current = "";
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [open, stall, form]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const readFileAsDataUrl = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }

        reject(new Error("Không thể đọc file ảnh"));
      };
      reader.onerror = () => reject(new Error("Không thể đọc file ảnh"));
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (!values.cover_image) {
        form.setFields([
          {
            name: "cover_image",
            errors: ["Vui lòng chọn ảnh bìa quán"],
          },
        ]);
        message.error("Vui lòng chọn ảnh bìa quán");
        return;
      }

      if (!isClosingAfterOpening(values.opening_hours, values.close_hours)) {
        form.setFields([
          {
            name: "close_hours",
            errors: ["Giờ đóng cửa phải sau giờ mở cửa"],
          },
        ]);
        return;
      }

      const payloadValues = { ...values };
      delete payloadValues.location;

      await onSubmit(payloadValues);
    } catch {
      // Form validation errors are displayed inline by antd.
    }
  };

  const handlePickPosition = async (e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const nextPosition = toValidPosition(lat, lng);

    if (!nextPosition) {
      message.error("Không thể xác định tọa độ hợp lệ từ vị trí đã chọn");
      return;
    }

    const coordinates = extractCoordinates(nextPosition);
    if (!coordinates) {
      return;
    }

    setSelectedPosition(nextPosition);
    form.setFieldValue("latitude", coordinates.lat);
    form.setFieldValue("longitude", coordinates.lng);

    const locationName = await reverseGeocode(coordinates.lat, coordinates.lng);
    form.setFields([{ name: "location", value: locationName }]);
    setLocationQuery(locationName);

    await form
      .validateFields(["latitude", "longitude", "location"])
      .catch(() => undefined);
  };

  const handleSearchLocation = (value: string) => {
    const query = value.trim();
    setLocationQuery(value);
    latestQueryRef.current = query;

    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
    }

    if (query.length < 2) {
      setLocationOptions([]);
      setSearchingLocation(false);
      return;
    }

    setSearchingLocation(true);
    searchTimerRef.current = window.setTimeout(async () => {
      const activeQuery = latestQueryRef.current;
      const suggestions = await searchLocationSuggestions(activeQuery, 6);

      if (activeQuery !== latestQueryRef.current) {
        return;
      }

      setLocationOptions(suggestions);
      setSearchingLocation(false);
    }, 350);
  };

  const handleSelectLocationSuggestion = (
    _value: string,
    option: LocationSuggestion,
  ) => {
    const nextPosition = toValidPosition(option.lat, option.lng);
    if (!nextPosition) {
      message.warning("Gợi ý địa điểm không có tọa độ hợp lệ");
      return;
    }

    const coordinates = extractCoordinates(nextPosition);
    if (!coordinates) {
      message.warning("Không thể đọc tọa độ từ gợi ý đã chọn");
      return;
    }

    setSelectedPosition(nextPosition);
    form.setFieldValue("latitude", coordinates.lat);
    form.setFieldValue("longitude", coordinates.lng);
    form.setFields([{ name: "location", value: option.value }]);
    setLocationQuery(option.value);
    setLocationOptions([]);
  };

  const handleSelectCoverFile = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      form.setFieldValue("cover_image", dataUrl);
      form.setFields([{ name: "cover_image", errors: [] }]);
      message.success("Đã chọn ảnh bìa từ thiết bị");
    } catch {
      message.error("Không thể đọc ảnh, vui lòng thử lại");
    }

    event.target.value = "";
  };

  return (
    <Modal
      title="Chỉnh sửa quán"
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={submitting}
      destroyOnHidden
      width={900}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={12}>
          <Col xs={24} sm={16}>
            <Form.Item
              name="stall_name"
              label="Tên quán"
              rules={[{ required: true, message: "Vui lòng nhập tên quán" }]}
            >
              <Input size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng nhập danh mục" }]}
            >
              <Input size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={16}>
            <Form.Item
              name="price_range"
              label="Mức giá"
              rules={[{ required: true, message: "Vui lòng nhập mức giá" }]}
            >
              <InputNumber
                size="large"
                min={10000}
                max={100000000}
                step={10000}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="radius"
              label="Bán kính nghe thuyết minh tự động (m)"
              initialValue={50}
            >
              <InputNumber
                size="large"
                min={10}
                max={5000}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item name="contact_phone" label="Số điện thoại liên hệ">
              <Input size="large" placeholder="Ví dụ: 0901234567" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="website" label="Website">
              <Input size="large" placeholder="https://your-site.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="latitude" hidden>
          <InputNumber />
        </Form.Item>
        <Form.Item name="longitude" hidden>
          <InputNumber />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24}>
            <Form.Item
              className="stall-location-item"
              name="location"
              label="Vị trí quán"
              rules={[
                {
                  required: true,
                  message:
                    "Vui lòng nhập địa điểm hoặc chọn vị trí trên bản đồ",
                },
              ]}
            >
              <AutoComplete
                options={locationOptions}
                onSearch={handleSearchLocation}
                onSelect={handleSelectLocationSuggestion}
                open={shouldShowLocationSuggest}
                notFoundContent={
                  searchingLocation
                    ? "Đang tìm địa điểm..."
                    : "Không có gợi ý phù hợp"
                }
                filterOption={false}
              >
                <Input
                  size="large"
                  placeholder="Nhập tên địa điểm hoặc chọn trên bản đồ..."
                  prefix={<EnvironmentOutlined />}
                />
              </AutoComplete>
            </Form.Item>
          </Col>
        </Row>

        <div className="stall-map-canvas">
          <span className="stall-map-badge">Chạm vào bản đồ để ghim</span>
          <MapContainer
            center={mapCenter}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom
            className="stall-add-map"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              subdomains={["a", "b", "c", "d"]}
              maxZoom={20}
            />
            <MapUpdater position={safeSelectedPosition} open={open} />
            <LocationPicker onPick={handlePickPosition} />
            {safeSelectedPosition ? (
              <Marker
                position={safeSelectedPosition}
                icon={locationMarkerIcon}
              />
            ) : null}
          </MapContainer>
        </div>

        <Row gutter={12} style={{ marginTop: 20 }}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="opening_hours"
              label="Giờ mở cửa"
              rules={[{ required: true, message: "Vui lòng chọn giờ mở cửa" }]}
            >
              <TimePicker
                size="large"
                format="HH:mm"
                minuteStep={5}
                changeOnScroll
                style={{ width: "100%" }}
                placeholder="Chọn giờ mở cửa"
                onChange={() => {
                  void form
                    .validateFields(["close_hours"])
                    .catch(() => undefined);
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="close_hours"
              label="Giờ đóng cửa"
              dependencies={["opening_hours"]}
              rules={[
                { required: true, message: "Vui lòng chọn giờ đóng cửa" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const opening = getFieldValue("opening_hours");

                    if (!opening || !value) {
                      return Promise.resolve();
                    }

                    if (!isClosingAfterOpening(opening, value)) {
                      return Promise.reject(
                        new Error("Giờ đóng cửa phải sau giờ mở cửa"),
                      );
                    }

                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <TimePicker
                size="large"
                format="HH:mm"
                minuteStep={5}
                changeOnScroll
                style={{ width: "100%" }}
                placeholder="Chọn giờ đóng cửa"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="cover_image"
          label="Ảnh bìa quán"
          rules={[{ required: true, message: "Vui lòng chọn ảnh bìa quán" }]}
        >
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              aria-label="Chọn ảnh bìa quán"
              title="Chọn ảnh bìa quán"
              className="stall-file-input-hidden"
              onChange={handleSelectCoverFile}
            />

            <Space direction="vertical" size="small" style={{ width: "100%" }}>
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
                    onClick={() => {
                      form.setFieldValue("cover_image", undefined);
                      void form
                        .validateFields(["cover_image"])
                        .catch(() => undefined);
                    }}
                  >
                    Xóa ảnh
                  </Button>
                ) : null}
              </Space>

              {watchedCoverImage ? (
                <Image
                  src={normalizeStallCoverImage(watchedCoverImage)}
                  alt="Ảnh bìa quán"
                  className="stall-cover-preview"
                />
              ) : (
                <Text type="secondary">Chưa chọn ảnh bìa</Text>
              )}
            </Space>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
