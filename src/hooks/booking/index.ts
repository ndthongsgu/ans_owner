import type { PaginationResponse } from "@/dto/base.dto";
import type {
  BookingQuery,
  BookingResponse,
  BookingSearchRequest,
  BookingUserCreate,
} from "@/dto/booking.dto";
import API_ENDPOINTS from "@/services/api-route";
import rootApiService from "@/services/api.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSearchBooking = () => {
  return useMutation({
    mutationFn: async (
      searchRequest: BookingSearchRequest
    ): Promise<BookingResponse> => {
      return rootApiService.post<BookingResponse>(
        API_ENDPOINTS.BOOKING.SEARCH,
        searchRequest
      );
    },
  });
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: [API_ENDPOINTS.BOOKING.MY_BOOKINGS],
    queryFn: async (): Promise<BookingResponse[]> => {
      return rootApiService.get<BookingResponse[]>(
        API_ENDPOINTS.BOOKING.MY_BOOKINGS
      );
    },
  });
};

export const useMyBookingsPaged = (query: BookingQuery) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.BOOKING.MY_BOOKINGS_PAGED, query],
    queryFn: async (): Promise<PaginationResponse<BookingResponse>> => {
      return rootApiService.get<PaginationResponse<BookingResponse>>(
        API_ENDPOINTS.BOOKING.MY_BOOKINGS_PAGED,
        { params: query }
      );
    },
  });
};

export const useBookingById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [API_ENDPOINTS.BOOKING.BY_ID, id],
    queryFn: async (): Promise<BookingResponse> => {
      return rootApiService.get<BookingResponse>(
        `${API_ENDPOINTS.BOOKING.BY_ID}/${id}`
      );
    },
    enabled: enabled && !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookingUserCreate): Promise<BookingResponse> => {
      return rootApiService.post<BookingResponse>(
        API_ENDPOINTS.BOOKING.CREATE,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.BOOKING.MY_BOOKINGS],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.BOOKING.MY_BOOKINGS_PAGED],
      });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<BookingResponse> => {
      return rootApiService.post<BookingResponse>(
        `${API_ENDPOINTS.BOOKING.CANCEL}/${id}`
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.BOOKING.MY_BOOKINGS],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.BOOKING.MY_BOOKINGS_PAGED],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.BOOKING.BY_ID, data.id],
      });
    },
  });
};

export const useBookingManagement = () => {
  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();

  return {
    createBooking,
    cancelBooking,
    isLoading: createBooking.isPending || cancelBooking.isPending,
    isError: createBooking.isError || cancelBooking.isError,
    error: createBooking.error || cancelBooking.error,
  };
};

export const useBookingList = (query?: BookingQuery) => {
  const defaultQuery: BookingQuery = {
    sortBy: "createdDate",
    sortDirection: "desc",
    page: 0,
    size: 10,
    ...query,
  };

  const { data, isLoading, error, refetch } = useMyBookingsPaged(defaultQuery);

  return {
    bookings: data?.content || [],
    totalElements: data?.totalElements || 0,
    isLoading,
    error,
    refetch,
  };
};
