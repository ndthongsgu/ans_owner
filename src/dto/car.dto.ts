import type { BaseDto } from "./base.dto";
import type { BookingSeatResponse } from "./trip.dto";

export interface CarResponse {
  id: string;
  code: string;
  licensePlate: string;
  carType?: CarType;
  seatCount?: number;
  carSeats?: CarSeatResponse[];
}

export interface CarSeatResponse {
  id: string;
  seatNumber: string;
  seatPosition: string;
  isBooked?: boolean;
  bookingSeats?: BookingSeatResponse[];
  bookedStatuses?: string[];
}

export interface CarType extends BaseDto {
  code: string;
  name: string;
  description: string;
  seatCount: number;
}

export interface CarSeat extends BaseDto {
  seatNumber: string;
  seatPosition: string;
  isBooked: boolean;
  bookedStatuses?: string[];
}

export interface Car extends BaseDto {
  code: string;
  carType: CarType;
  licensePlate: string;
  carSeats: CarSeat[];
}
