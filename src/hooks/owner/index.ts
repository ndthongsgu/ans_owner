import type { OwnerProfile, OwnerProfileUpdate } from "@/dto/owner.dto";
import { API_ENDPOINTS } from "@/services/api-route";
import rootApiService from "@/services/api.service";
import type { ApiResponse } from "@/services/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProfile = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.OWNER.ME],
    queryFn: async () =>
      (
        await rootApiService.get<ApiResponse<OwnerProfile>>(
          API_ENDPOINTS.OWNER.ME,
        )
      ).data,
    retry: false,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OwnerProfileUpdate) =>
      rootApiService.put<ApiResponse<OwnerProfile>>(
        API_ENDPOINTS.OWNER.UPDATE_PROFILE,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.OWNER.ME] });
    },
  });
};
