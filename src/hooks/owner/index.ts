import type { OwnerProfile, OwnerProfileUpdate } from "@/dto/owner.dto";
import { API_ENDPOINTS } from "@/services/api-route";
import rootApiService from "@/services/api.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProfile = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.OWNER.ME],
    queryFn: () => rootApiService.get<OwnerProfile>(API_ENDPOINTS.OWNER.ME),
    retry: false,
  });
};

export const useUpdateProfile = () => {
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
