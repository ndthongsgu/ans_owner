import type { BookingResponse } from "./booking.dto";
import type { TripUserResponse } from "./trip.dto";
import type { UserProfile } from "./user.dto";

export interface NotificationTypeResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface NotificationResponse {
  id: string;
  user: UserProfile;
  booking?: BookingResponse;
  trip?: TripUserResponse;
  type: NotificationTypeResponse;
  channel: string;
  title: string;
  message: string;
  isSent: boolean;
  sentAt?: string;
  isRead: boolean;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
}

export interface NotificationQuery {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  bookingId?: string;
  tripId?: string;
  typeId?: string;
  channel?: string;
  isSent?: boolean;
  isRead?: boolean;
}

export interface NotificationKafkaDTO {
  userId: string;
  username?: string;
  email?: string;
  phone?: string;
  type?: "NEW_NOTIFICATION" | "READ_NOTIFICATION" | "DELETED_NOTIFICATION";
}
