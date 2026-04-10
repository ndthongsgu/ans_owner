import { UploadOutlined, EnvironmentOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Col,
  Card,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  TimePicker,
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
import type { StallCreateRequest } from "@/dto/stall.dto";
import {
  reverseGeocode,
  searchLocationSuggestions,
  type LocationSuggestion,
} from "@/services/location.service";
import {
  extractCoordinates,
  normalizeCoordinate,
} from "@/utils/location.utils";
import { hourValueToString } from "@/utils/stall.utils";
import "./index.css";

type StallAddModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: StallAddFormValues) => Promise<void> | void;
  submitting?: boolean;
};

export type StallAddFormValues = StallCreateRequest & {
  location?: string;
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
  opening?: StallAddFormValues["opening_hours"],
  closing?: StallAddFormValues["close_hours"],
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
    if (!position || !map) return;

    const coordinates = extractCoordinates(position);
    if (!coordinates) return;

    const { lat, lng } = coordinates;
    if (!isValidLatLng(lat, lng)) return;

    // Wait for the modal animation to finish + invalidate size before moving
    // to prevent Leaflet from computing NaN during animation frames.
    const timer = window.setTimeout(() => {
      try {
        map.invalidateSize({ pan: false, animate: false });
        map.setView([lat, lng], 17, { animate: false });
      } catch {
        // Ignore errors if map is already unmounted.
      }
    }, 260);

    return () => window.clearTimeout(timer);
  }, [map, position]);

  // Invalidate size when modal opens (no position change yet)
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      try {
        map.invalidateSize({ pan: false, animate: false });
      } catch {
        // ignore
      }
    }, 260);
    return () => window.clearTimeout(timer);
  }, [map, open]);

  return null;
}

export default function StallAddModal({
  open,
  onCancel,
  onSubmit,
  submitting = false,
}: StallAddModalProps) {
  const [form] = Form.useForm<StallAddFormValues>();
  const [selectedPosition, setSelectedPosition] = useState<
    LatLngExpression | undefined
  >(undefined);
  const [locationOptions, setLocationOptions] = useState<LocationSuggestion[]>(
    [],
  );
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | undefined>(
    undefined,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchTimerRef = useRef<number | null>(null);
  const latestQueryRef = useRef("");
  const watchedLatitude = Form.useWatch("latitude", form);
  const watchedLongitude = Form.useWatch("longitude", form);

  const toValidPosition = (
    latValue: unknown,
    lngValue: unknown,
  ): LatLngExpression | undefined => {
    const lat = Number(latValue);
    const lng = Number(lngValue);

    if (!isValidLatLng(lat, lng)) {
      return undefined;
    }

    return [normalizeCoordinate(lat), normalizeCoordinate(lng)];
  };

  const safeSelectedPosition = useMemo<LatLngExpression | undefined>(() => {
    const coordinates = extractCoordinates(selectedPosition);
    if (!coordinates) return undefined;

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
    const nextPosition = toValidPosition(watchedLatitude, watchedLongitude);
    if (!nextPosition) {
      return;
    }

    const coordinates = extractCoordinates(nextPosition);
    if (!coordinates) {
      return;
    }

    setSelectedPosition(nextPosition);
    void reverseGeocode(coordinates.lat, coordinates.lng).then(
      (locationName) => {
        form.setFields([{ name: "location", value: locationName }]);
      },
    );
  }, [watchedLatitude, watchedLongitude, form]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setSelectedPosition(undefined);
      setLocationOptions([]);
      setSearchingLocation(false);
      setLocationQuery("");
      setCoverPreviewUrl(undefined);
      latestQueryRef.current = "";
    }
  }, [open, form]);

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

  const handleCreate = async () => {
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

      const hasCoordinates =
        typeof values.latitude === "number" &&
        Number.isFinite(values.latitude) &&
        typeof values.longitude === "number" &&
        Number.isFinite(values.longitude);

      if (!hasCoordinates) {
        const locationText = (values.location || locationQuery).trim();
        if (!locationText) {
          form.setFields([
            {
              name: "location",
              errors: ["Vui lòng nhập địa điểm hoặc chọn vị trí trên bản đồ"],
            },
          ]);
          return;
        }

        setSearchingLocation(true);
        const suggestions = await searchLocationSuggestions(locationText, 1);
        setSearchingLocation(false);

        const firstSuggestion = suggestions[0];
        if (!firstSuggestion) {
          form.setFields([
            {
              name: "location",
              errors: ["Không tìm thấy tọa độ cho địa điểm đã nhập"],
            },
          ]);
          message.error("Không tìm thấy tọa độ cho địa điểm đã nhập");
          return;
        }

        const nextPosition = toValidPosition(
          firstSuggestion.lat,
          firstSuggestion.lng,
        );

        if (!nextPosition) {
          form.setFields([
            {
              name: "location",
              errors: ["Địa điểm trả về tọa độ không hợp lệ"],
            },
          ]);
          message.error("Địa điểm trả về tọa độ không hợp lệ");
          return;
        }

        const coordinates = extractCoordinates(nextPosition);
        if (!coordinates) {
          return;
        }

        const { lat, lng } = coordinates;

        values.latitude = lat;
        values.longitude = lng;
        values.location = firstSuggestion.value;

        form.setFieldValue("latitude", lat);
        form.setFieldValue("longitude", lng);
        form.setFieldValue("location", firstSuggestion.value);

        setSelectedPosition(nextPosition);
        setLocationQuery(firstSuggestion.value);
      }

      await onSubmit(values);
    } catch {
      // Form validation errors are displayed inline by antd.
    } finally {
      setSearchingLocation(false);
    }
  };

  const handlePickPosition = async (e: LeafletMouseEvent) => {
    const nextPosition = toValidPosition(e.latlng.lat, e.latlng.lng);
    if (!nextPosition) {
      message.error("Tọa độ ghim không hợp lệ");
      return;
    }

    const coordinates = extractCoordinates(nextPosition);
    if (!coordinates) {
      return;
    }

    const { lat, lng } = coordinates;

    setSelectedPosition(nextPosition);
    form.setFieldValue("latitude", lat);
    form.setFieldValue("longitude", lng);

    const locationName = await reverseGeocode(lat, lng);
    form.setFields([{ name: "location", value: locationName }]);

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
      message.error("Gợi ý địa điểm có tọa độ không hợp lệ");
      return;
    }

    const coordinates = extractCoordinates(nextPosition);
    if (!coordinates) {
      return;
    }

    const { lat, lng } = coordinates;

    setSelectedPosition(nextPosition);
    form.setFieldValue("latitude", lat);
    form.setFieldValue("longitude", lng);
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
      setCoverPreviewUrl(dataUrl);
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
      title="Thêm quán mới"
      open={open}
      onCancel={onCancel}
      onOk={handleCreate}
      okText="Tạo quán"
      cancelText="Huỷ"
      confirmLoading={submitting}
      destroyOnHidden
      width={900}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            <Card className="stall-form-card" title="Thông tin quán">
              <Row gutter={12}>
                <Col xs={24} sm={16}>
                  <Form.Item
                    name="stall_name"
                    label="Tên quán"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên quán" },
                    ]}
                  >
                    <Input size="large" placeholder="Ví dụ: Quán Ăn Gia Đình" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="category"
                    label="Danh mục"
                    rules={[
                      { required: true, message: "Vui lòng nhập danh mục" },
                    ]}
                  >
                    <Input size="large" placeholder="Ví dụ: Món Việt" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col xs={24} sm={16}>
                  <Form.Item
                    name="price_range"
                    label="Mức giá"
                    rules={[
                      { required: true, message: "Vui lòng nhập mức giá" },
                    ]}
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
                    label="Phạm vi nghe (m)"
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

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="opening_hours"
                    label="Giờ mở cửa"
                    rules={[
                      { required: true, message: "Vui lòng chọn giờ mở cửa" },
                    ]}
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
                rules={[
                  { required: true, message: "Vui lòng chọn ảnh bìa quán" },
                ]}
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

                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Space>
                      <Button
                        icon={<UploadOutlined />}
                        onClick={() => {
                          if (!fileInputRef.current) return;
                          fileInputRef.current.value = "";
                          fileInputRef.current.click();
                        }}
                      >
                        Chọn ảnh bìa
                      </Button>
                      {coverPreviewUrl ? (
                        <Button
                          danger
                          onClick={() => {
                            setCoverPreviewUrl(undefined);
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

                    {coverPreviewUrl ? (
                      <Image
                        src={coverPreviewUrl}
                        alt="Ảnh bìa quán mới"
                        className="stall-cover-preview"
                      />
                    ) : null}
                  </Space>
                </div>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <Card className="stall-map-card" title="Vị trí trên bản đồ">
              <Form.Item name="latitude" hidden>
                <InputNumber />
              </Form.Item>
              <Form.Item name="longitude" hidden>
                <InputNumber />
              </Form.Item>

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
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
