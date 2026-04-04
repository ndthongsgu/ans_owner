import type { LatLngExpression } from "leaflet";

export type Coordinates = {
  lat: number;
  lng: number;
};

export const formatCoordinates = (
  lat: number,
  lng: number,
  precision = 4,
): string => {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

export const normalizeCoordinate = (value: number, precision = 6): number => {
  return Number(value.toFixed(precision));
};

export const extractCoordinates = (
  position?: LatLngExpression,
): Coordinates | null => {
  if (!position) return null;

  let lat = Number.NaN;
  let lng = Number.NaN;

  if (Array.isArray(position) && position.length >= 2) {
    lat = Number(position[0]);
    lng = Number(position[1]);
  } else if (
    typeof position === "object" &&
    "lat" in position &&
    "lng" in position
  ) {
    lat = Number(position.lat);
    lng = Number(position.lng);
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};
