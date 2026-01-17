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
