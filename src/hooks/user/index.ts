import type { UserProfile } from "@/dto/user.dto";
import { API_ENDPOINTS } from "@/services/api-route";
import rootApiService from "@/services/api.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface CustomerProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;

  // Owner/shop specific (optional)
  shopName?: string;
  shopLocation?: string;
  stallContentScript?: string;
  // subscription id when selecting a package
  subscriptionId?: string;
}

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.OWNER.ME],
    queryFn: () => rootApiService.get<UserProfile>(API_ENDPOINTS.OWNER.ME),
    retry: false,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerProfileUpdate) =>
      rootApiService.put(API_ENDPOINTS.OWNER.UPDATE_PROFILE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.OWNER.ME] });
    },
  });
};

export const useSetupCredentials = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerProfileUpdate) =>
      rootApiService.post(API_ENDPOINTS.OWNER.UPDATE_PROFILE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.OWNER.ME] });
    },
  });
};
