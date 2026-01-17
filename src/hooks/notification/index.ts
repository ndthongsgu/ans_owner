import type { PaginationResponse } from "@/dto/base.dto";
import type {
  NotificationQuery,
  NotificationResponse,
} from "@/dto/notification.dto";
import rootApiService from "@/services/api.service";

export const notificationApi = {
  /**
   * Get paginated list of notifications for current user
   */
  getMyNotifications: async (
    query: NotificationQuery = {}
  ): Promise<PaginationResponse<NotificationResponse>> => {
    // 1. Build the query object for rootApiService to handle
    //    We need to handle undefined values to prevent empty strings in params
    const params: Record<string, string | number> = {};

    if (query.page !== undefined) params.page = query.page;
    if (query.size !== undefined) params.size = query.size;
    if (query.sortBy) params.sortBy = query.sortBy;
    if (query.sortDirection) params.sortDirection = query.sortDirection;
    if (query.bookingId) params.bookingId = query.bookingId;
    if (query.tripId) params.tripId = query.tripId;
    if (query.typeId) params.typeId = query.typeId;
    if (query.channel) params.channel = query.channel;
    if (query.isSent !== undefined)
      params.isSent = query.isSent ? "true" : "false";
    if (query.isRead !== undefined)
      params.isRead = query.isRead ? "true" : "false";

    const response = await rootApiService.get<
      PaginationResponse<NotificationResponse>
    >(`/notifications`, params);
    return response;
  },

  /**
   * Get single notification by ID
   */
  getNotificationById: async (id: string): Promise<NotificationResponse> => {
    // Use rootApiService.get
    const response = await rootApiService.get<NotificationResponse>(
      `/notifications/${id}`
    );
    return response;
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: async (): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Use rootApiService.get
    const response = await rootApiService.get<number>(
      "/notifications/unread-count"
    );
    return response;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    // Use rootApiService.patch (sending no body)
    await rootApiService.patch<void>(`/notifications/${id}/read`);
  },

  /**
   * Delete notification (soft delete)
   */
  deleteNotification: async (id: string): Promise<void> => {
    // Use rootApiService.delete
    await rootApiService.delete<void>(`/notifications/${id}`);
  },
};
