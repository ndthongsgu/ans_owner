export interface PackageDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in days
  features?: string[];
}

export interface MySubscriptionDto {
  packageId?: string;
  packageName?: string;
  expiresAt?: string;
  active: boolean;
}
