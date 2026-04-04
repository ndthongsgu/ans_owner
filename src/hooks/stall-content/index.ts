import type {
  StallContentCreateRequest,
  StallContentListResponse,
  StallContentResponse,
  StallContentUpdateRequest,
  StallWithoutContentListResponse,
  StallWithoutContentResponse,
} from "@/dto/stall-content.dto";
import { API_ENDPOINTS } from "@/services/api-route";
import rootApiService from "@/services/api.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type LanguageListResponse = {
  data: string[];
  total?: number;
};

type RawStallContentRecord = Record<string, unknown>;

const getFirstString = (source: RawStallContentRecord, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const normalizeStallContent = (
  item: StallContentResponse | RawStallContentRecord,
) => {
  const source = item as RawStallContentRecord;
  const normalizedId = getFirstString(source, [
    "id",
    "contentId",
    "content_id",
    "stallContentId",
    "stall_content_id",
  ]);

  return {
    ...source,
    id: normalizedId,
    stall_id: getFirstString(source, ["stall_id", "stallId"]),
    stall_name: getFirstString(source, ["stall_name", "stallName"]),
    language_code: getFirstString(source, ["language_code", "languageCode"]),
    title: getFirstString(source, ["title"]),
    description: getFirstString(source, ["description"]),
    audio_url: getFirstString(source, ["audio_url", "audioUrl", "url"]),
    tts_script: getFirstString(source, ["tts_script", "ttsScript"]),
    version: source.version as number | undefined,
    is_deleted: Boolean(source.is_deleted ?? source.isDeleted),
    created_at: source.created_at as number,
    updated_at: source.updated_at as number | undefined,
    audio_duration: source.audio_duration as number | undefined,
    audio_file_size: source.audio_file_size as number | undefined,
  } as StallContentResponse;
};

const ensureArray = <T>(payload: T[] | { data?: T[] } | undefined | null) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.data) ? payload.data : [];
};

export const useStallContents = () => {
  return useQuery<StallContentResponse[]>({
    queryKey: ["stall-contents"],
    queryFn: async () => {
      const res = await rootApiService.get<
        StallContentResponse[] | StallContentListResponse
      >(API_ENDPOINTS.OWNER.STALL_CONTENT.LIST());

      return ensureArray(res).map((item) => normalizeStallContent(item));
    },
  });
};

export const useAvailableStallsWithoutContent = () => {
  return useQuery<StallWithoutContentResponse[]>({
    queryKey: ["stall-contents", "available-stalls"],
    queryFn: async () => {
      const res = await rootApiService.get<
        StallWithoutContentResponse[] | StallWithoutContentListResponse
      >(API_ENDPOINTS.OWNER.STALL_CONTENT.AVAILABLE_STALLS());

      return ensureArray(res);
    },
  });
};

export const useAvailableLanguagesByStall = (stallId?: string) => {
  return useQuery<string[]>({
    queryKey: ["stall-contents", "available-languages", stallId],
    enabled: Boolean(stallId),
    queryFn: async () => {
      if (!stallId) {
        return [];
      }

      const res = await rootApiService.get<string[] | LanguageListResponse>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.AVAILABLE_LANGUAGES(stallId),
      );

      return ensureArray(res);
    },
  });
};

export const useStallContentDetail = (stallId?: string, contentId?: string) => {
  return useQuery<StallContentResponse | null>({
    queryKey: ["stall-contents", "detail", stallId, contentId],
    enabled: Boolean(stallId && contentId),
    queryFn: async () => {
      if (!stallId || !contentId) {
        return null;
      }

      const res = await rootApiService.get<StallContentResponse>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.DETAIL(stallId, contentId),
      );

      return normalizeStallContent(res);
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
      rootApiService.post<StallContentResponse>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.CREATE(),
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stall-contents"] });
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
      rootApiService.put<StallContentResponse>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.UPDATE(stallId, contentId),
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stall-contents"] });
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
      rootApiService.delete(
        API_ENDPOINTS.OWNER.STALL_CONTENT.DELETE(stallId, contentId),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stall-contents"] });
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
      rootApiService.patch<StallContentResponse>(
        API_ENDPOINTS.OWNER.STALL_CONTENT.TOGGLE(stallId, contentId),
        { is_deleted: isDeleted ? "true" : "false" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stall-contents"] });
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
      rootApiService.get(
        API_ENDPOINTS.OWNER.STALL_CONTENT.BY_LANGUAGE(stallId, languageCode),
      ),
  });
};
