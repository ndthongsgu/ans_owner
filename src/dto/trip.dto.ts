import type { BaseDto } from "./base.dto";

export interface RouteResponse {
  id: string;
  startLocation: string;
  endLocation: string;
  estimatedDuration?: number;
  distanceKm?: number;
  description?: string;
}

export interface Route extends BaseDto {
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  estimatedDuration: number;
}

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

export interface TripUserQuery {
  startLocation?: string;
  endLocation?: string;
  numberOfSeats?: number;
  departureTime?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface TripUserResponse extends BaseDto {
  route: RouteResponse;
  departureTime: string;
  price: number;
  availableSeats: number;
  tripStops?: TripStopResponse[];
  tripCars?: TripCarResponse[];
}

export interface TripStopResponse {
  id: string;
  stopType: "PICKUP" | "DROPOFF";
  location: string;
  orderIndex: number;
}

export interface TripCarResponse {
  id: string;
  car: CarResponse;
  trip: TripUserResponse;
  tripId: string;
  carId: string;
  price: number;
  availableSeats: number;
}

export interface BookingSeatResponse {
  id: string;
  code: string;
  status: string;
  price: number;
}

export interface TripStop extends BaseDto {
  stopType: "PICKUP" | "DROPOFF";
  location: string;
  orderIndex: number;
}

export interface TripCar extends BaseDto {
  tripId: string;
  carId: string;
  car: Car;
  price: number;
  availableSeats: number | null;
}

export interface Bus extends BaseDto {
  route: Route;
  departureTime: string;
  price: number;
  availableSeats: number | null;
  tripStops: TripStop[];
  tripCars: TripCar[];
}
