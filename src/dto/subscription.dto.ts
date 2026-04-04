export interface PackageDto {
  id: string;
  code: string;
  name: string;
  price: number;
  max_stalls: number;
  description?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MySubscriptionDto {
  packageId?: string;
  packageName?: string;
  expiresAt?: string;
  active: boolean;
}

export interface VnpayCreatePaymentRequestDto {
  packageId: string;
  method?: "vnpay";
  returnUrl?: string;
}

export interface VnpayPaymentSessionDto {
  orderId: string;
  amount?: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  status?: string;
  message?: string;
}

export interface VnpayPaymentStatusDto {
  orderId: string;
  status: string;
  paid: boolean;
  message?: string;
}
