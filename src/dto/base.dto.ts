export interface BasePermissions {
  isCanView: boolean;
  isCanEdit: boolean;
  isCanDeactivate: boolean;
  isCanActivate: boolean;
  isCanCreate: boolean;
  isCanImport: boolean;
  isCanExport: boolean;
}

export interface BaseDto extends BasePermissions {
  id: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
}

export interface PaginationDto<T> {
  skip: number;
  take: number;
  where: T;
  sortBy?: string;
  sortDirection?: string;
}

export interface PrimaryBaseEntity {
  id?: string;
  createdDate?: Date;
  updatedDate?: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  version?: number;
}
export interface ActionLogDto extends BaseDto {
  functionId: string;
  functionType: string;
  type: string;
  description: string;
  createdByName?: string;
  employeeCode?: string;
}

export interface PaginationDto<T> {
  skip: number;
  take: number;
  where: T;
}

export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  message?: string;
}

export interface PaginationParams {
  skip: number;
  take: number;
  [key: string]: any;
}

export interface SuccessResponse {
  message?: string;
  data?: any;
}

export interface ErrorResponse {
  message: string;
  statusCode?: number;
}
