import type { Dayjs } from "dayjs";

export type StallBaseRequest = {
  stall_name: string;
  latitude: number;
  longitude: number;
  radius: number;
  cover_image: string;
  contact_phone?: string;
  website?: string;
  price_range: string;
  opening_hours: string | Dayjs;
  close_hours: string | Dayjs;
  category: string;
};

export type StallCreateRequest = StallBaseRequest & {
  owner_id?: string;
};

export type StallUpdateRequest = Partial<StallBaseRequest>;

export type StallResponse = StallBaseRequest & {
  id: string;
  owner_id: string;
  stall_name: string;
  average_rating?: number;
  total_reviews?: number;
  created_at?: number;
  updated_at?: number;
};

// Backward-compatible alias for existing usage.
export type StallItem = StallResponse;
