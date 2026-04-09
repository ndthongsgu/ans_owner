import { Icon, type LatLngExpression } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { StallResponse } from "@/dto/stall.dto";
import type { StallContentResponse } from "@/dto/stall-content.dto";
import { Button, Modal, Tag, Typography } from "antd";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, PauseCircle, PlayCircle } from "lucide-react";

interface StallContentMapProps {
  stalls: StallResponse[];
  stallContents?: StallContentResponse[];
  onStallClick?: (stall: StallResponse) => void;
}

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function StallContentMap({
  stalls,
  stallContents = [],
  onStallClick,
}: StallContentMapProps) {
  const [selectedStall, setSelectedStall] = useState<StallResponse | null>(null);
  const [activeAudioStallId, setActiveAudioStallId] = useState<string | null>(null);

  const contentByStallId = new Map(
    stallContents.map((content) => [content.stall_id, content]),
  );

  // Filter stalls with valid coordinates
  const stallsWithCoords = stalls.filter(
    (stall) =>
      stall.latitude &&
      stall.longitude &&
      typeof stall.latitude === "number" &&
      typeof stall.longitude === "number" &&
      isFinite(stall.latitude) &&
      isFinite(stall.longitude)
  );

  if (stallsWithCoords.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          borderRadius: 8,
          color: "#999",
          fontSize: 14,
        }}
      >
        Không có quán nào có tọa độ để hiển thị trên bản đồ
      </div>
    );
  }

  // Calculate center of map
  const centerLat =
    stallsWithCoords.reduce((sum, s) => sum + (s.latitude as number), 0) /
    stallsWithCoords.length;
  const centerLng =
    stallsWithCoords.reduce((sum, s) => sum + (s.longitude as number), 0) /
    stallsWithCoords.length;
  const mapCenter: LatLngExpression = [centerLat, centerLng];

  return (
    <>
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom
        style={{ width: "100%", height: 400, borderRadius: 8 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={20}
        />
        {stallsWithCoords.map((stall) => {
          const content = contentByStallId.get(stall.id);
          const hasAudio = Boolean(content?.audio_url);

          return (
          <Marker
            key={stall.id}
            position={[stall.latitude as number, stall.longitude as number]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => setSelectedStall(stall),
            }}
          >
            <Popup>
              <div className="stall-map-popup-card">
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {stall.stall_name}
                </Typography.Title>
                <div className="stall-map-popup-row">
                  <Tag color={hasAudio ? "gold" : "default"}>
                    {hasAudio ? "Co audio" : "Chua co audio"}
                  </Tag>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {stall.category || "Khong ro danh muc"}
                  </Typography.Text>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<Headphones size={14} />}
                  className="stall-map-popup-play-btn"
                  onClick={() => {
                    onStallClick?.(stall);
                    setSelectedStall(stall);
                  }}
                >
                  Nghe thuyết minh
                </Button>

                {hasAudio ? (
                  <div className="stall-map-mini-player">
                    <Button
                      size="small"
                      type={activeAudioStallId === stall.id ? "default" : "text"}
                      icon={
                        activeAudioStallId === stall.id ? (
                          <PauseCircle size={16} />
                        ) : (
                          <PlayCircle size={16} />
                        )
                      }
                      onClick={() =>
                        setActiveAudioStallId((prev) => (prev === stall.id ? null : stall.id))
                      }
                    >
                      {activeAudioStallId === stall.id ? "An player" : "Play"}
                    </Button>
                    <AnimatePresence initial={false}>
                      {activeAudioStallId === stall.id ? (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <audio controls preload="none" src={content?.audio_url} />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                ) : null}
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>

      {/* Detail Modal */}
      <Modal
        title={selectedStall?.stall_name}
        open={!!selectedStall}
        onCancel={() => setSelectedStall(null)}
        footer={null}
        width={700}
        modalRender={(node) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            {node}
          </motion.div>
        )}
      >
        {selectedStall && (
          <div>
            <p>
              <strong>Danh mục:</strong> {selectedStall.category}
            </p>
            <p>
              <strong>Mức giá:</strong> {selectedStall.price_range}
            </p>
            <p>
              <strong>Tọa độ:</strong> {selectedStall.latitude},
              {selectedStall.longitude}
            </p>
            <Button
              type="primary"
              icon={<Headphones size={14} />}
              onClick={() => onStallClick?.(selectedStall)}
            >
              Nghe thuyết minh
            </Button>

            {contentByStallId.get(selectedStall.id)?.audio_url ? (
              <div className="stall-map-modal-player">
                <audio
                  controls
                  preload="none"
                  src={contentByStallId.get(selectedStall.id)?.audio_url}
                />
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </>
  );
}
