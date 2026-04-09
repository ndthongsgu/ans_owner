import dayjs, { type Dayjs } from "dayjs";
import { API_ROUTES } from "@/services/api-route";
import { DEFAULT_NEW_COVER_IMAGE } from "@/constants/stall.constants";

export function normalizeStallCoverImage(rawImage?: string | null): string {
  const trimmed = (rawImage || "").trim();
  if (!trimmed) {
    return DEFAULT_NEW_COVER_IMAGE;
  }

  if (
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const looksLikeBase64 =
    /^[A-Za-z0-9+/]+=*$/.test(trimmed) && trimmed.length > 100;
  if (looksLikeBase64) {
    return `data:image/jpeg;base64,${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `${API_ROUTES.BASE_URL}${trimmed}`;
  }

  return `${API_ROUTES.BASE_URL}/${trimmed}`;
}

export function hourStringToDayjs(
  value?: string | Dayjs | null,
): Dayjs | undefined {
  if (!value) return undefined;
  if (dayjs.isDayjs(value)) return value;
  const parsed = dayjs(value, "HH:mm", true);
  return parsed.isValid() ? parsed : undefined;
}

export function hourValueToString(value: unknown): string {
  if (dayjs.isDayjs(value)) {
    return value.format("HH:mm");
  }

  if (typeof value === "string") {
    const raw = value.trim();
    const strictParsed = dayjs(raw, "HH:mm", true);
    if (strictParsed.isValid()) {
      return strictParsed.format("HH:mm");
    }

    const relaxedParsed = dayjs(raw, "H:m", true);
    if (relaxedParsed.isValid()) {
      return relaxedParsed.format("HH:mm");
    }
  }

  throw new Error("invalid-hour-format");
}

export type StallCoordinates = {
  latitude: number;
  longitude: number;
};

export async function geocodeLocationToCoordinates(
  location: string,
): Promise<StallCoordinates | null> {
  const query = location.trim();
  if (!query) return null;

  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(searchUrl, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Array<{
      lat: string;
      lon: string;
    }>;

    const first = data[0];
    if (!first) return null;

    const latitude = Number(first.lat);
    const longitude = Number(first.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return {
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
    };
  } catch {
    return null;
  }
}
