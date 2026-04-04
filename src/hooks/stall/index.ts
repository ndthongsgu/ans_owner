import type {
  StallCreateRequest,
  StallResponse,
  StallUpdateRequest,
} from "@/dto/stall.dto";
import { API_ENDPOINTS } from "@/services/api-route";
import rootApiService from "@/services/api.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStalls = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.OWNER.STALLS.LIST],
    queryFn: async () => {
      const res = await rootApiService.get<StallResponse[]>(
        API_ENDPOINTS.OWNER.STALLS.LIST,
      );
      return res;
    },
    retry: false,
  });
};

export const useCreateStall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StallCreateRequest) =>
      rootApiService.post<StallResponse>(
        API_ENDPOINTS.OWNER.STALLS.CREATE,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALLS.LIST],
      });
    },
  });
};

export const useUpdateStall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: StallUpdateRequest & { id: string }) =>
      rootApiService.put<StallResponse>(
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
      rootApiService.delete(API_ENDPOINTS.OWNER.STALLS.DELETE(stallId)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALLS.LIST],
      });
    },
  });
};
