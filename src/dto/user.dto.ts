import type { RoleDto } from "./role.dto";

export interface CustomerTypeDto {
  id: string;
  code: string;
  name: string;
  description: string;
}
export interface CustomerProfile {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  customerType: CustomerTypeDto;
  // owner-specific fields (nullable)
  shopName?: string;
  shopLocation?: string;
  narrationContent?: string;
  subscription?: {
    id?: string;
    name?: string;
    expires_at?: string;
  };
}
export interface UserProfile {
  id: string;
  username: string;
  hasPassword: boolean;
  isAdmin: boolean;
  email: string;
  roles: RoleDto[];
  isGoogle: boolean;
  customer: CustomerProfile;
}
