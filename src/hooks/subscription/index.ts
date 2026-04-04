import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import rootApiService from "@/services/api.service";
import { API_ENDPOINTS } from "@/services/api-route";
import type {
  PackageDto,
  MySubscriptionDto,
  VnpayCreatePaymentRequestDto,
  VnpayPaymentSessionDto,
  VnpayPaymentStatusDto,
} from "@/dto/subscription.dto";

const unwrapResponseData = <T>(payload: unknown): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

const normalizePaymentSession = (payload: unknown): VnpayPaymentSessionDto => {
  const source = unwrapResponseData<Record<string, unknown>>(payload);
  const transaction =
    source.transaction && typeof source.transaction === "object"
      ? (source.transaction as Record<string, unknown>)
      : {};

  return {
    orderId:
      (source.orderId as string) ||
      (source.order_id as string) ||
      (source.requestId as string) ||
      (transaction.order_id as string) ||
      (transaction.orderId as string) ||
      (transaction.request_id as string) ||
      (transaction.requestId as string) ||
      "",
    amount: Number(source.amount || transaction.amount || 0) || undefined,
    payUrl:
      (source.payUrl as string) ||
      (source.pay_url as string) ||
      (source.payment_url as string) ||
      (transaction.payUrl as string) ||
      (transaction.pay_url as string) ||
      (transaction.payment_url as string),
    deeplink:
      (source.deeplink as string) ||
      (source.deepLink as string) ||
      (source.qr_code_url as string) ||
      (transaction.deeplink as string) ||
      (transaction.deepLink as string) ||
      (transaction.qr_code_url as string),
    qrCodeUrl:
      (source.qrCodeUrl as string) ||
      (source.qrCodeURL as string) ||
      (source.qrUrl as string) ||
      (source.qr_code_url as string) ||
      (transaction.qrCodeUrl as string) ||
      (transaction.qrCodeURL as string) ||
      (transaction.qrUrl as string) ||
      (transaction.qr_code_url as string),
    status:
      (source.status as string) ||
      (source.resultCode as string) ||
      (transaction.payment_status as string) ||
      (transaction.status as string),
    message:
      (source.message as string) ||
      (source.localMessage as string) ||
      (source.error as string),
  };
};

const normalizePaymentStatus = (payload: unknown): VnpayPaymentStatusDto => {
  const source = unwrapResponseData<Record<string, unknown>>(payload);
  const status = (
    (source.status as string) ||
    (source.resultCode as string) ||
    "pending"
  )
    .toString()
    .toLowerCase();
  const paid =
    Boolean(source.paid) ||
    ["success", "paid", "completed", "00", "0"].includes(status);

  return {
    orderId:
      (source.orderId as string) ||
      (source.order_id as string) ||
      (source.requestId as string) ||
      "",
    status,
    paid,
    message: (source.message as string) || (source.localMessage as string),
  };
};

const ensureArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const source = payload as { data?: unknown };
    if (Array.isArray(source.data)) {
      return source.data as T[];
    }
  }

  return [];
};

const normalizePackage = (payload: unknown): PackageDto => {
  const source =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    id: String(source.id || source.packageId || source.package_id || ""),
    code: String(source.code || ""),
    name: String(source.name || ""),
    price: Number(source.price || 0),
    max_stalls: Number(source.max_stalls || source.maxStalls || 0),
    description:
      typeof source.description === "string" ? source.description : undefined,
    is_deleted:
      typeof source.is_deleted === "boolean"
        ? source.is_deleted
        : typeof source.isDeleted === "boolean"
          ? source.isDeleted
          : undefined,
    created_at:
      typeof source.created_at === "string"
        ? source.created_at
        : typeof source.createdAt === "string"
          ? source.createdAt
          : undefined,
    updated_at:
      typeof source.updated_at === "string"
        ? source.updated_at
        : typeof source.updatedAt === "string"
          ? source.updatedAt
          : undefined,
  };
};

const normalizeMySubscription = (payload: unknown): MySubscriptionDto => {
  const source = unwrapResponseData<Record<string, unknown>>(payload);
  const detail =
    source.subscription && typeof source.subscription === "object"
      ? (source.subscription as Record<string, unknown>)
      : source;
  const packageInfo =
    detail.package && typeof detail.package === "object"
      ? (detail.package as Record<string, unknown>)
      : {};

  const packageId = String(
    detail.packageId ||
      detail.package_id ||
      detail.subscription_package_id ||
      packageInfo.id ||
      packageInfo.package_id ||
      "",
  );
  const packageName = String(
    detail.packageName || detail.package_name || packageInfo.name || "",
  );
  const activeValue =
    detail.active ?? detail.is_active ?? source.active ?? source.is_active;
  const isActive =
    typeof activeValue === "boolean"
      ? activeValue
      : String(activeValue || "").toLowerCase() === "true";
  const expiresAtValue =
    (detail.expiresAt as string) ||
    (detail.expires_at as string) ||
    (detail.expired_at as string) ||
    (detail.end_date as string) ||
    undefined;
  const expiresAtTime = expiresAtValue
    ? new Date(expiresAtValue).getTime()
    : Number.NaN;
  const hasFutureExpiry =
    Number.isFinite(expiresAtTime) && expiresAtTime > Date.now();

  return {
    packageId: packageId || undefined,
    packageName: packageName || undefined,
    expiresAt: expiresAtValue,
    active: isActive || hasFutureExpiry,
  };
};

export const useListPackages = () => {
  return useQuery<PackageDto[]>({
    queryKey: [API_ENDPOINTS.SUBSCRIPTION.LIST],
    queryFn: async () => {
      const response = await rootApiService.get<unknown>(
        API_ENDPOINTS.SUBSCRIPTION.LIST,
      );

      return ensureArray<PackageDto>(unwrapResponseData(response)).map(
        normalizePackage,
      );
    },
  });
};

export const useMySubscription = () => {
  return useQuery<MySubscriptionDto>({
    queryKey: [API_ENDPOINTS.SUBSCRIPTION.MY],
    queryFn: async () => {
      const response = await rootApiService.get<unknown>(
        API_ENDPOINTS.SUBSCRIPTION.MY,
      );

      return normalizeMySubscription(response);
    },
  });
};

export const useRegisterPackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packageId: string) => {
      const response = await rootApiService.post(
        API_ENDPOINTS.SUBSCRIPTION.REGISTER,
        {
          subscription_package_id: packageId,
          note: "",
          payment_method: "vnpay",
          method: "vnpay",
        },
      );

      return normalizePaymentSession(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.OWNER.ME] });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.SUBSCRIPTION.MY],
      });
    },
  });
};

export const usePurchasePackage = useRegisterPackage;

export const useCreateVnpayPaymentSession = () => {
  return useMutation({
    mutationFn: async (payload: VnpayCreatePaymentRequestDto) => {
      const response = await rootApiService.post(
        API_ENDPOINTS.PAYMENTS.VNPAY_CREATE,
        {
          ...payload,
          method: "vnpay",
        },
      );

      return normalizePaymentSession(response);
    },
  });
};

export const useCheckVnpayPaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await rootApiService.get(
        API_ENDPOINTS.PAYMENTS.VNPAY_STATUS(orderId),
      );

      return normalizePaymentStatus(response);
    },
    onSuccess: (status) => {
      if (status.paid) {
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.OWNER.ME] });
        queryClient.invalidateQueries({
          queryKey: [API_ENDPOINTS.SUBSCRIPTION.MY],
        });
      }
    },
  });
};
