import type { BaseDto } from "./base.dto";
import type { Car, CarResponse } from "./car.dto";
import type { Route, RouteResponse } from "./route.dto";

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
