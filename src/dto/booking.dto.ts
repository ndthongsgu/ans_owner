import type { BaseDto } from "./base.dto";
import type { CustomerDto } from "./customer.dto";
import type { TripUserResponse } from "./trip.dto";

export interface BookingSeatCreate {
  seatId: string;
  status: string;
  price: number;
}

export interface BookingUserCreate {
  tripId: string;
  pickupStopId: string;
  dropoffStopId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  type: string;
  totalPrice: number;
  bookingSeats?: BookingSeatCreate[];
}

export interface BookingSearchRequest {
  bookingCode: string;
  customerName: string;
  customerPhone: string;
}

export interface BookingQuery {
  code?: string;
  type?: string;
  bookingStatus?: string;
  tripId?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  size?: number;
}

export interface BookingSeatResponse {
  id: string;
  code: string;
  status: string;
  price: number;
  seat?: {
    id: string;
    name: string;
    seatNumber: string;
  };
}

export interface BookingResponse extends BaseDto {
  id: string;
  code: string;
  type: string;
  bookingStatus: string;
  totalPrice: number;
  customer?: CustomerDto;
  trip?: TripUserResponse;
  pickupStop?: {
    id: string;
    location: string;
    arrivalTime: string;
  };
  dropoffStop?: {
    id: string;
    location: string;
    arrivalTime: string;
  };
  bookingSeats?: BookingSeatResponse[];
}
