import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
const DEFAULT_DATETIME_FORMAT = "HH:mm:ss DD/MM/YYYY";

const normalizeToUnixSeconds = (
  value?: number | string | null,
): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue =
    typeof value === "string" ? Number(value.trim()) : Number(value);

  if (Number.isFinite(numericValue)) {
    return numericValue > 1_000_000_000_000
      ? Math.floor(numericValue / 1000)
      : Math.floor(numericValue);
  }

  if (typeof value === "string") {
    const parsed = dayjs(value);
    if (parsed.isValid()) {
      return parsed.unix();
    }
  }

  return null;
};

export function formatUnixTimestamp(
  value?: number | string | null,
  fallback = "-",
  format = DEFAULT_DATETIME_FORMAT,
): string {
  const seconds = normalizeToUnixSeconds(value);

  if (seconds === null) {
    return fallback;
  }

  return dayjs.unix(seconds).tz(DEFAULT_TIMEZONE).format(format);
}
