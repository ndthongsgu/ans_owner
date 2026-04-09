import API_ENDPOINTS from "@/services/api-route";
import rootApiService from "@/services/api.service";
import type { ApiResponse } from "@/services/type";
import { useQuery } from "@tanstack/react-query";

export interface RouteUserResponse {
  location: string;
}

export interface RouteUserQuery {
  startLocation?: string;
  endLocation?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  size?: number;
}

export interface LocationResponse {
  id?: string | null;
  location?: string | null;
}

export const useAllRoutes = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.ROUTE.ALL],
    queryFn: async (): Promise<RouteUserResponse[]> => {
      return (
        await rootApiService.post<ApiResponse<RouteUserResponse[]>>(
          API_ENDPOINTS.ROUTE.ALL,
        )
      ).data;
    },
  });
};

export const useSearchRoutes = (query: RouteUserQuery) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.ROUTE.PAGED, query],
    queryFn: async () => {
      return (
        await rootApiService.post<ApiResponse<RouteUserResponse[]>>(
          API_ENDPOINTS.ROUTE.PAGED,
          query,
        )
      ).data;
    },
  });
};

export const useStartLocations = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.ROUTE.START_LOCATIONS],
    queryFn: async (): Promise<LocationResponse[]> => {
      const data = (
        await rootApiService.post<ApiResponse<LocationResponse[]>>(
          API_ENDPOINTS.ROUTE.START_LOCATIONS,
        )
      ).data;
      const filtered = data.filter(
        (item) => item.location && item.location.trim(),
      );
      return filtered;
    },
  });
};

export const useEndLocations = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.ROUTE.END_LOCATIONS],
    queryFn: async (): Promise<LocationResponse[]> => {
      const data = (
        await rootApiService.post<ApiResponse<LocationResponse[]>>(
          API_ENDPOINTS.ROUTE.END_LOCATIONS,
        )
      ).data;
      const filtered = data.filter(
        (item) => item.location && item.location.trim(),
      );
      return filtered;
    },
  });
};

export const useEndLocationsByStart = (startLocation: string) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.ROUTE.END_LOCATIONS_BY_START, startLocation],
    queryFn: async (): Promise<LocationResponse[]> => {
      const data = (
        await rootApiService.post<ApiResponse<LocationResponse[]>>(
          `${
            API_ENDPOINTS.ROUTE.END_LOCATIONS_BY_START
          }?startLocation=${encodeURIComponent(startLocation)}`,
        )
      ).data;
      const filtered = data.filter(
        (item) => item.location && item.location.trim(),
      );
      return filtered;
    },
  });
};

export const useLocationSelection = () => {
  const {
    data: locations = [],
    isLoading: startLoading,
    error: startError,
  } = useStartLocations();
  const {
    data: endLocations = [],
    isLoading: endLoading,
    error: endError,
  } = useEndLocations();

  return {
    locations,
    endLocations,
    isLoading: startLoading || endLoading,
    error: startError || endError,
  };
};
