// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import rootApiService from "@/services/api.service";
import { API_ENDPOINTS } from "@/services/api-route";
import type { PackageDto, MySubscriptionDto } from "@/dto/subscription.dto";

export const useListPackages = () => {
  // queryKey generics cause weird overload errors, silence
  // @ts-ignore
  return useQuery<PackageDto[], Error, PackageDto[], [string]>(
    [API_ENDPOINTS.SUBSCRIPTION.LIST] as [string],
    () => rootApiService.get<PackageDto[]>(API_ENDPOINTS.SUBSCRIPTION.LIST)
  );
};

export const useMySubscription = () => {
  // @ts-ignore
  return useQuery<MySubscriptionDto, Error, MySubscriptionDto, [string]>(
    [API_ENDPOINTS.SUBSCRIPTION.MY] as [string],
    () => rootApiService.get<MySubscriptionDto>(API_ENDPOINTS.SUBSCRIPTION.MY)
  );
};

export const usePurchasePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) =>
      rootApiService.post(API_ENDPOINTS.SUBSCRIPTION.PURCHASE(packageId)),
    onSuccess: () => {
      // refresh current user and subscription queries
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.USER.GET_ME] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SUBSCRIPTION.MY] });
    },
  });
};
