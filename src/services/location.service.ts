import { formatCoordinates } from "@/utils/location.utils";

export type LocationSuggestion = {
  label: string;
  value: string;
  lat: number;
  lng: number;
};

const SEARCH_CACHE_TTL_MS = 3 * 60 * 1000;
const REVERSE_CACHE_TTL_MS = 10 * 60 * 1000;

const searchCache = new Map<
  string,
  { expiresAt: number; data: LocationSuggestion[] }
>();
const reverseCache = new Map<string, { expiresAt: number; data: string }>();
const pendingSearchRequests = new Map<string, Promise<LocationSuggestion[]>>();
const pendingReverseRequests = new Map<string, Promise<string>>();

export const searchLocationSuggestions = async (
  keyword: string,
  limit = 6,
): Promise<LocationSuggestion[]> => {
  const query = keyword.trim();
  if (!query) return [];

  const cacheKey = `${query.toLowerCase()}::${limit}`;
  const now = Date.now();
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const pending = pendingSearchRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to search location suggestions");
      }

      const data: Array<{
        display_name: string;
        lat: string;
        lon: string;
      }> = await response.json();

      const normalized = data
        .map((item) => ({
          label: item.display_name,
          value: item.display_name,
          lat: Number(item.lat),
          lng: Number(item.lon),
        }))
        .filter(
          (item) => Number.isFinite(item.lat) && Number.isFinite(item.lng),
        );

      searchCache.set(cacheKey, {
        data: normalized,
        expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
      });

      return normalized;
    } catch (error) {
      console.warn("Error searching location suggestions:", error);
      return [];
    } finally {
      pendingSearchRequests.delete(cacheKey);
    }
  })();

  pendingSearchRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

export const reverseGeocode = async (
  lat: number,
  lng: number,
): Promise<string> => {
  const roundedLat = Number(lat.toFixed(6));
  const roundedLng = Number(lng.toFixed(6));
  const cacheKey = `${roundedLat},${roundedLng}`;

  const cached = reverseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const pending = pendingReverseRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLng}&zoom=16&addressdetails=1`,
        { headers: { "User-Agent": "ans-customer-app" } },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location name");
      }

      const data = await response.json();
      const address = data.address || {};
      const parts: string[] = [];

      if (address.house_number && address.road) {
        parts.push(`${address.house_number} ${address.road}`);
      } else if (address.road) {
        parts.push(address.road);
      }

      if (address.suburb || address.village || address.hamlet) {
        parts.push(address.suburb || address.village || address.hamlet);
      }

      if (address.city_district) {
        parts.push(address.city_district);
      }

      if (address.city || address.town || address.municipality) {
        parts.push(address.city || address.town || address.municipality);
      }

      if (address.country) {
        parts.push(address.country);
      }

      const result =
        parts.length > 0
          ? parts.join(", ")
          : formatCoordinates(roundedLat, roundedLng);

      reverseCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + REVERSE_CACHE_TTL_MS,
      });

      return result;
    } catch (error) {
      console.warn("Error fetching location name:", error);
      return formatCoordinates(roundedLat, roundedLng);
    } finally {
      pendingReverseRequests.delete(cacheKey);
    }
  })();

  pendingReverseRequests.set(cacheKey, requestPromise);
  return requestPromise;
};
