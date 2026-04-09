import type {
  StallCreateRequest,
  StallResponse,
  StallUpdateRequest,
} from "@/dto/stall.dto";
import { API_ENDPOINTS } from "@/services/api-route";
import rootApiService from "@/services/api.service";
import type { ApiResponse } from "@/services/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type StallLimitResponse = {
  current_stalls: number;
  max_stalls: number;
  remaining_stalls: number;
};

export const useStalls = () => {
  return useQuery<StallResponse[]>({
    queryKey: [API_ENDPOINTS.OWNER.STALLS.LIST],
    queryFn: async () => {
      const res = await rootApiService.get<ApiResponse<StallResponse[]>>(
        API_ENDPOINTS.OWNER.STALLS.LIST,
      );
      return res.data;
    },
  });
};

export const useStallLimit = () => {
  return useQuery<StallLimitResponse>({
    queryKey: [API_ENDPOINTS.OWNER.STALLS.LIMIT],
    queryFn: async () => {
      const res = await rootApiService.get<ApiResponse<StallLimitResponse>>(
        API_ENDPOINTS.OWNER.STALLS.LIMIT,
      );
      return res.data;
    },
    retry: false,
  });
};

export const useCreateStall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StallCreateRequest) =>
      rootApiService.post<ApiResponse<StallResponse>>(
        API_ENDPOINTS.OWNER.STALLS.CREATE,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALLS.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALLS.LIMIT],
      });
    },
  });
};

export const useUpdateStall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: StallUpdateRequest & { id: string }) =>
      rootApiService.put<ApiResponse<StallResponse>>(
        API_ENDPOINTS.OWNER.STALLS.UPDATE(id),
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALLS.LIST],
      });
    },
  });
};

export const useDeleteStall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stallId: string) =>
      rootApiService.delete<ApiResponse<unknown>>(
        API_ENDPOINTS.OWNER.STALLS.DELETE(stallId),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALLS.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALLS.LIMIT],
      });
    },
  });
};
