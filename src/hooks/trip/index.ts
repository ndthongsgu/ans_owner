import type { TripUserQuery, TripUserResponse } from "@/dto/trip.dto";
import API_ENDPOINTS from "@/services/api-route";
import rootApiService from "@/services/api.service";
import { useMutation } from "@tanstack/react-query";

export const useSearchTrips = () => {
  return useMutation({
    mutationFn: async (query: TripUserQuery): Promise<TripUserResponse[]> => {
      const response = await rootApiService.post<TripUserResponse[]>(
        API_ENDPOINTS.TRIP.SEARCH_BY_ROUTE,
        query
      );
      return response;
    },
  });
};
