import { Tag, Typography } from "antd";
import {
  Clock,
  MapPin,
  Phone,
  Globe,
  Store,
  Tag as TagIcon,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { StallResponse } from "@/dto/stall.dto";
import { normalizeStallCoverImage } from "@/utils/stall.utils";
import { reverseGeocode } from "@/services/location.service";
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

  const [resolvedAddress, setResolvedAddress] = useState<string>("");

  useEffect(() => {
    const existingLocation = (stall as unknown as { location?: string })
      .location;
    if (existingLocation?.trim()) {
      setResolvedAddress(existingLocation.trim());
      return;
    }

    const parentAddress = getStallAddress(stall);
    const isCoordinateOnly = /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(parentAddress);
    const isPlaceholder = parentAddress === "Chưa cập nhật địa chỉ";

    if (!isCoordinateOnly && !isPlaceholder) {
      setResolvedAddress(parentAddress);
      return;
    }

    if (!hasCoordinates) {
      setResolvedAddress(parentAddress || "Chưa cập nhật địa chỉ");
      return;
    }

    void reverseGeocode(
      stall.latitude as number,
      stall.longitude as number,
    ).then((name) => setResolvedAddress(name || parentAddress));
  }, [stall, hasCoordinates, getStallAddress]);

  const displayAddress = resolvedAddress || getStallAddress(stall);
  const coverSrc = normalizeStallCoverImage(stall.cover_image);
  const openHour = getOpeningHours(stall);
  const closeHour = getClosingHours(stall);
  const priceRange = getPriceRange(stall);
  const phone = stall.contact_phone;
  const website = (stall as unknown as { website?: string }).website;

  return (
    <div className="sd-root">
      {/* Hero banner */}
      <div className="sd-hero">
        <img src={coverSrc} alt={stall.stall_name} className="sd-hero-img" />
        <div className="sd-hero-overlay">
          <div className="sd-hero-badge">
            <Store size={13} />
            {stall.category || "Quán ăn"}
          </div>
          <Typography.Title level={3} className="sd-hero-title">
            {stall.stall_name}
          </Typography.Title>
          {displayAddress && (
            <div className="sd-hero-addr">
              <MapPin size={13} />
              <span>{displayAddress}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="sd-grid">
        <div className="sd-info-item">
          <div className="sd-info-icon sd-icon-blue">
            <TagIcon size={15} />
          </div>
          <div className="sd-info-body">
            <div className="sd-info-label">Danh mục</div>
            <div className="sd-info-value">
              <Tag color="blue">{stall.category || "—"}</Tag>
            </div>
          </div>
        </div>

        <div className="sd-info-item">
          <div className="sd-info-icon sd-icon-green">
            <Wallet size={15} />
          </div>
          <div className="sd-info-body">
            <div className="sd-info-label">Mức giá</div>
            <div className="sd-info-value sd-value-green">{priceRange}</div>
          </div>
        </div>

        <div className="sd-info-item">
          <div className="sd-info-icon sd-icon-orange">
            <Clock size={15} />
          </div>
          <div className="sd-info-body">
            <div className="sd-info-label">Giờ hoạt động</div>
            <div className="sd-info-value">
              {openHour}
              <span className="sd-time-sep">→</span>
              {closeHour}
            </div>
          </div>
        </div>

        <div className="sd-info-item">
          <div className="sd-info-icon sd-icon-purple">
            <MapPin size={15} />
          </div>
          <div className="sd-info-body">
            <div className="sd-info-label">Địa chỉ</div>
            <div className="sd-info-value sd-value-muted">
              {displayAddress || "Chưa cập nhật"}
            </div>
          </div>
        </div>

        {phone && (
          <div className="sd-info-item">
            <div className="sd-info-icon sd-icon-teal">
              <Phone size={15} />
            </div>
            <div className="sd-info-body">
              <div className="sd-info-label">Điện thoại</div>
              <a className="sd-info-value sd-link" href={`tel:${phone}`}>
                {phone}
              </a>
            </div>
          </div>
        )}

        {website && (
          <div className="sd-info-item">
            <div className="sd-info-icon sd-icon-indigo">
              <Globe size={15} />
            </div>
            <div className="sd-info-body">
              <div className="sd-info-label">Website</div>
              <a
                className="sd-info-value sd-link"
                href={website}
                target="_blank"
                rel="noreferrer"
              >
                {website}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
