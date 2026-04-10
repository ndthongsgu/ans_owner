import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import rootApiService from "@/services/api.service";
import { API_ENDPOINTS } from "@/services/api-route";
import type { ApiResponse } from "@/services/type";
import type {
  MySubscriptionDto,
  PackageDto,
  VnpayPaymentSessionDto,
} from "@/dto/subscription.dto";

const isApiResponse = <T>(payload: unknown): payload is ApiResponse<T> => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    "success" in payload
  );
};

const extractPayload = <T>(payload: T | ApiResponse<T>): T => {
  return isApiResponse<T>(payload) ? payload.data : payload;
};

const normalizeRegisterSession = (payload: unknown): VnpayPaymentSessionDto => {
  const source = extractPayload(
    payload as ApiResponse<Record<string, unknown>> | Record<string, unknown>,
  );
  const transaction =
    source.transaction && typeof source.transaction === "object"
      ? (source.transaction as Record<string, unknown>)
      : {};

  const orderId =
    (transaction.order_id as string) ||
    (source.order_id as string) ||
    (transaction.orderId as string) ||
    (source.orderId as string) ||
    "";

  return {
    orderId,
    order_id: orderId || undefined,
    amount: Number(transaction.amount || source.amount || 0) || undefined,
    payment_url:
      (transaction.payment_url as string) ||
      (source.payment_url as string) ||
      (transaction.paymentUrl as string) ||
      (source.paymentUrl as string) ||
      undefined,
    qr_code_url:
      (transaction.qr_code_url as string) ||
      (source.qr_code_url as string) ||
      (transaction.qrCodeUrl as string) ||
      (source.qrCodeUrl as string) ||
      undefined,
    status:
      (transaction.payment_status as string) ||
      (source.payment_status as string) ||
      (transaction.status as string) ||
      (source.status as string) ||
      undefined,
    message: (source.message as string) || undefined,
  };
};

const normalizeMySubscription = (payload: unknown): MySubscriptionDto => {
  const source = extractPayload(
    payload as ApiResponse<Record<string, unknown>> | Record<string, unknown>,
  );

  const packageData =
    source.package && typeof source.package === "object"
      ? (source.package as PackageDto)
      : undefined;

  const subscriptionPackageId =
    (source.subscription_package_id as string) ||
    (source.packageId as string) ||
    packageData?.id;

  const active = Boolean(
    source.is_active ??
    source.active ??
    (source.remaining_seconds && Number(source.remaining_seconds) > 0),
  );

  return {
    owner_id: (source.owner_id as string) || undefined,
    subscription_package_id: subscriptionPackageId,
    is_active: Boolean(source.is_active ?? active),
    package: packageData,
    packageId: subscriptionPackageId,
    packageName:
      packageData?.name ||
      (source.packageName as string) ||
      (source.package_name as string) ||
      undefined,
    active,
  };
};

export const useListPackages = () => {
  return useQuery<PackageDto[]>({
    queryKey: [API_ENDPOINTS.SUBSCRIPTION.LIST],
    queryFn: async () => {
      const res = await rootApiService.get<ApiResponse<PackageDto[]>>(
        API_ENDPOINTS.SUBSCRIPTION.LIST,
      );
      return res.data || [];
    },
  });
};

export const useMySubscription = () => {
  return useQuery<MySubscriptionDto>({
    queryKey: [API_ENDPOINTS.SUBSCRIPTION.MY],
    queryFn: async () => {
      const res = await rootApiService.get<ApiResponse<unknown>>(
        API_ENDPOINTS.SUBSCRIPTION.MY,
      );
      return normalizeMySubscription(res);
    },
  });
};

export const useRegisterPackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packageId: string) => {
      const res = await rootApiService.post<ApiResponse<unknown>>(
        API_ENDPOINTS.SUBSCRIPTION.REGISTER,
        {
          subscription_package_id: packageId,
          payment_method: "vnpay",
        },
      );

      return normalizeRegisterSession(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.SUBSCRIPTION.MY],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.SUBSCRIPTION.MY_PURCHASES],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.SUBSCRIPTION.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.AUTH.PROFILE],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.ME],
      });
    },
  });
};

export const useCreateVnpayPaymentSession = () => {
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await rootApiService.post<ApiResponse<unknown>>(
        API_ENDPOINTS.PAYMENTS.VNPAY_CREATE,
        {
          ...payload,
          method: "vnpay",
        },
      );

      return normalizeRegisterSession(res);
    },
  });
};

export const useMyPurchases = () => {
  return useQuery<PackageDto[]>({
    queryKey: [API_ENDPOINTS.SUBSCRIPTION.MY_PURCHASES],
    queryFn: async () => {
      const res = await rootApiService.get<ApiResponse<PackageDto[]>>(
        API_ENDPOINTS.SUBSCRIPTION.MY_PURCHASES,
      );
      return res.data;
    },
  });
};

export const useActivatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction_id: string) => {
      const res = await rootApiService.post<ApiResponse<unknown>>(
        API_ENDPOINTS.SUBSCRIPTION.ACTIVATE_PURCHASE,
        { transaction_id },
      );
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.SUBSCRIPTION.MY],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.SUBSCRIPTION.MY_PURCHASES],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.SUBSCRIPTION.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.AUTH.PROFILE],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.ME],
      });
    },
  });
};
