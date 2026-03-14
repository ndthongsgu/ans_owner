import type {
  OwnerProfile,
  OwnerProfileUpdate,
  OwnerSubscription,
} from "@/dto/owner.dto";
import type { PackageDto } from "@/dto/subscription.dto";
import { API_ENDPOINTS } from "@/services/api-route";
import rootApiService from "@/services/api.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useOwnerProfile = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.OWNER.ME],
    queryFn: () => rootApiService.get<OwnerProfile>(API_ENDPOINTS.OWNER.ME),
    retry: false,
  });
};

export const useUpdateOwnerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OwnerProfileUpdate) =>
      rootApiService.put<OwnerProfile>(
        API_ENDPOINTS.OWNER.UPDATE_PROFILE,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.OWNER.ME] });
    },
  });
};

export const useOwnerPackages = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.OWNER.SUBSCRIPTION.LIST],
    queryFn: () =>
      rootApiService.get<PackageDto[]>(API_ENDPOINTS.OWNER.SUBSCRIPTION.LIST),
    retry: false,
  });
};

export const useOwnerSubscription = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.OWNER.SUBSCRIPTION.MY],
    queryFn: () =>
      rootApiService.get<OwnerSubscription>(
        API_ENDPOINTS.OWNER.SUBSCRIPTION.MY,
      ),
    retry: false,
  });
};

export const usePurchaseOwnerPackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) =>
      rootApiService.post(API_ENDPOINTS.OWNER.SUBSCRIPTION.PURCHASE(packageId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.OWNER.ME] });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.SUBSCRIPTION.MY],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.SUBSCRIPTION.LIST],
      });
    },
  });
};
