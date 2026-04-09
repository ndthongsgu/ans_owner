import type {
  StallContentCreateRequest,
  StallContentResponse,
  StallContentUpdateRequest,
  StallWithoutContentResponse,
} from "@/dto/stall-content.dto";
import { API_ENDPOINTS } from "@/services/api-route";
import rootApiService from "@/services/api.service";
import type { ApiResponse } from "@/services/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStallContents = () => {
  return useQuery<StallContentResponse[]>({
    queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.LIST],
    queryFn: async () => {
      const res = await rootApiService.get<ApiResponse<StallContentResponse[]>>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.LIST,
      );

      return res.data;
    },
  });
};

export const useAvailableStallsWithoutContent = () => {
  return useQuery<StallWithoutContentResponse[]>({
    queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.AVAILABLE_STALLS],
    queryFn: async () => {
      const res = await rootApiService.get<
        ApiResponse<StallWithoutContentResponse[]>
      >(API_ENDPOINTS.OWNER.STALL_CONTENT.AVAILABLE_STALLS);

      return res.data;
    },
  });
};

export const useAvailableLanguagesByStall = (stallId: string) => {
  return useQuery<string[]>({
    queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.AVAILABLE_LANGUAGES(stallId)],
    enabled: Boolean(stallId),
    queryFn: async () => {
      const res = await rootApiService.get<ApiResponse<string[]>>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.AVAILABLE_LANGUAGES(stallId),
      );
      return res.data;
    },
  });
};

export const useStallContentDetail = (stallId: string, contentId: string) => {
  return useQuery<StallContentResponse | null>({
    queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.DETAIL(stallId, contentId)],
    enabled: Boolean(stallId && contentId),
    queryFn: async () => {
      const res = await rootApiService.get<ApiResponse<StallContentResponse>>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.DETAIL(stallId, contentId),
      );

      return res.data;
    },
  });
};

export const useCreateStallContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
    }: {
      stallId: string;
      payload: StallContentCreateRequest;
    }) =>
      rootApiService.post<ApiResponse<StallContentResponse>>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.CREATE,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.AVAILABLE_STALLS],
      });
    },
  });
};

export const useUpdateStallContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stallId,
      contentId,
      payload,
    }: {
      stallId: string;
      contentId: string;
      payload: StallContentUpdateRequest;
    }) =>
      rootApiService.put<ApiResponse<StallContentResponse>>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.UPDATE(stallId, contentId),
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.AVAILABLE_STALLS],
      });
    },
  });
};

export const useDeleteStallContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stallId,
      contentId,
    }: {
      stallId: string;
      contentId: string;
    }) =>
      rootApiService.delete<ApiResponse<unknown>>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.DELETE(stallId, contentId),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.AVAILABLE_STALLS],
      });
    },
  });
};

export const useToggleStallContentActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stallId,
      contentId,
      isDeleted,
    }: {
      stallId: string;
      contentId: string;
      isDeleted: boolean;
    }) =>
      rootApiService.patch<ApiResponse<StallContentResponse>>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.TOGGLE(stallId, contentId),
        { is_deleted: isDeleted ? "true" : "false" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.LIST],
      });
    },
  });
};

export const useListenStallContentByLanguage = () => {
  return useMutation({
    mutationFn: ({
      stallId,
      languageCode,
    }: {
      stallId: string;
      languageCode: string;
    }) =>
      rootApiService.get<ApiResponse<unknown>>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.BY_LANGUAGE(stallId, languageCode),
      ),
  });
};
