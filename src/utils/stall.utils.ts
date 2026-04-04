import dayjs, { type Dayjs } from "dayjs";

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
