export interface PackageDto {
  id: string;
  name: string;
  code: string;
  price: number;
  max_stalls: number;
  description?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MySubscriptionDto {
  owner_id?: string;
  subscription_package_id?: string;
  is_active?: boolean;
  package?: PackageDto;
  packageId?: string;
  packageName?: string;
  active: boolean;
}

export interface VnpayCreatePaymentRequestDto {
  packageId: string;
  method?: "vnpay";
  returnUrl?: string;
}

export interface VnpayPaymentSessionDto {
  orderId: string;
  order_id?: string;
  amount?: number;
  payment_url?: string;
  qr_code_url?: string;
  status?: string;
  message?: string;
}

export interface VnpayPaymentStatusDto {
  orderId: string;
  status: string;
  paid: boolean;
  message?: string;
}
