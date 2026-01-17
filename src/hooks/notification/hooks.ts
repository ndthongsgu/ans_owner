import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginationResponse } from "@/dto/base.dto";
import type {
  NotificationQuery,
  NotificationResponse,
} from "@/dto/notification.dto";
import { notificationApi } from ".";

// Define centralized query keys for better cache management
const NOTIFICATION_QUERY_KEYS = {
  LIST: "notifications-list",
  COUNT: "notifications-unread-count",
};

/**
 * Hook to get the paginated list of notifications for the current user.
 * @param query - Pagination and filter parameters.
 */
export const useGetMyNotifications = (query: NotificationQuery) => {
  return useQuery<PaginationResponse<NotificationResponse>>({
    // The query key includes the LIST identifier and all query parameters,
    // ensuring React Query caches different filtered lists separately.
    queryKey: [NOTIFICATION_QUERY_KEYS.LIST, query],
    queryFn: () => notificationApi.getMyNotifications(query),
  });
};

/**
 * Hook to get the count of unread notifications.
 */
export const useGetUnreadCount = () => {
  return useQuery<number>({
    queryKey: [NOTIFICATION_QUERY_KEYS.COUNT],
    queryFn: notificationApi.getUnreadCount,
  });
};

/**
 * Hook to mark a single notification as read.
 * On success, it invalidates the unread count and the notification list
 * to trigger an immediate UI refresh.
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      // Invalidate count and list to show changes immediately
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_QUERY_KEYS.COUNT],
      });
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_QUERY_KEYS.LIST],
      });
    },
  });
};

/**
 * Hook to delete a single notification.
 * On success, it invalidates both the unread count and the notification list.
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      // Invalidate count and list to show changes immediately
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_QUERY_KEYS.COUNT],
      });
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_QUERY_KEYS.LIST],
      });
    },
  });
};
