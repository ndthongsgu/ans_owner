import { Form, Input, Modal, Select } from "antd";
import type { FormInstance } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Icon, type LatLngExpression } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { motion } from "framer-motion";

import type { StallContentCreateRequest } from "@/dto/stall-content.dto";
import type { StallResponse } from "@/dto/stall.dto";

type StallContentAddModalProps = {
  open: boolean;
  form: FormInstance<StallContentCreateRequest>;
  onCancel: () => void;
  onCreate: () => void;
  stallOptions: Array<{ label: string; value: string }>;
  stalls?: StallResponse[];
};

const mapMarkerIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const fallbackCenter: LatLngExpression = [10.7769, 106.7009];

export default function StallContentAddModal({
  open,
  form,
  onCancel,
  onCreate,
  stallOptions,
  stalls = [],
}: StallContentAddModalProps) {
  const filteredStallOptions = useMemo(() => stallOptions, [stallOptions]);
  const selectedStallId = Form.useWatch("stall_id", form);

  const stallsWithCoordinates = useMemo(
    () =>
      stalls.filter(
        (stall) =>
          typeof stall.latitude === "number" &&
          Number.isFinite(stall.latitude) &&
          typeof stall.longitude === "number" &&
          Number.isFinite(stall.longitude),
      ),
    [stalls],
  );

  const [selectedMapPosition, setSelectedMapPosition] = useState<
    LatLngExpression | undefined
  >(undefined);

  const mapCenter = useMemo<LatLngExpression>(() => {
    if (selectedMapPosition) return selectedMapPosition;
    if (stallsWithCoordinates.length > 0) {
      return [
        stallsWithCoordinates[0].latitude as number,
        stallsWithCoordinates[0].longitude as number,
      ];
    }
    return fallbackCenter;
  }, [selectedMapPosition, stallsWithCoordinates]);

  useEffect(() => {
    if (!open) {
      setSelectedMapPosition(undefined);
      return;
    }

    if (!selectedStallId) {
      return;
    }

    const selectedStall = stallsWithCoordinates.find(
      (stall) => stall.id === selectedStallId,
    );

    if (!selectedStall) {
      return;
    }

    setSelectedMapPosition([
      selectedStall.latitude as number,
      selectedStall.longitude as number,
    ]);
  }, [open, selectedStallId, stallsWithCoordinates]);

  return (
    <Modal
      title="Thêm nội dung thuyết minh"
      open={open}
      onCancel={onCancel}
      onOk={onCreate}
      okText="Tạo nội dung"
      cancelText="Hủy"
      width={760}
      destroyOnHidden
      modalRender={(node) => (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2 }}
        >
          {node}
        </motion.div>
      )}
    >
      <Form<StallContentCreateRequest> form={form} layout="vertical">
        <Form.Item
          name="stall_id"
          label="Quán"
          rules={[{ required: true, message: "Vui lòng chọn quán" }]}
        >
          <Select
            size="large"
            options={filteredStallOptions}
            placeholder="Chọn quán"
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        {stallsWithCoordinates.length > 0 ? (
          <div className="stall-content-map-selector-wrap">
            <div className="stall-content-map-selector-title">
              Chọn quán trực tiếp trên bản đồ
            </div>
            <MapContainer
              center={mapCenter}
              zoom={14}
              scrollWheelZoom
              className="stall-content-map-selector"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains={["a", "b", "c", "d"]}
                maxZoom={20}
              />
              {stallsWithCoordinates.map((stall) => (
                <Marker
                  key={stall.id}
                  position={[stall.latitude as number, stall.longitude as number]}
                  icon={mapMarkerIcon}
                >
                  <Popup>
                    <div className="stall-content-map-popup">
                      <strong>{stall.stall_name}</strong>
                      <button
                        type="button"
                        className="stall-content-map-popup-button"
                        onClick={() => {
                          form.setFieldValue("stall_id", stall.id);
                          setSelectedMapPosition([
                            stall.latitude as number,
                            stall.longitude as number,
                          ]);
                        }}
                      >
                        Chọn quán này
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : null}

        <Form.Item
          name="tts_script"
          label="Nội dung thuyết minh"
          rules={[
            { required: true, message: "Vui lòng nhập nội dung thuyết minh" },
          ]}
        >
          <Input.TextArea
            rows={8}
            placeholder="Nhập kịch bản thuyết minh chi tiết để hệ thống phát cho khách"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
