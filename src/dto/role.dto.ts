import type { BaseDto } from "./base.dto";

export interface RoleCreateUpdateDto {
  code: string;
  name: string;
}

export interface RolePageRequest {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface RoleDto extends BaseDto {
  code: string;
  name: string;
  description: string;
}
