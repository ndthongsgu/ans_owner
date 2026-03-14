export interface OwnerInfo {
  id: string;
  full_name: string;
  phone?: string | null;
  business_name?: string | null;
  business_address?: string | null;
  subscription_package_id?: string | null;
  subscription_expires_at?: number | null;
}

export interface OwnerProfile {
  id: string;
  username: string;
  email: string;
  roles: string[];
  owner: OwnerInfo;
}

export interface OwnerProfileUpdate {
  full_name?: string;
  email?: string;
  phone?: string;
  business_name?: string;
  business_address?: string;
}

export interface OwnerSubscription {
  packageId?: string | null;
  packageName?: string | null;
  expiresAt?: number | null;
  active: boolean;
}
