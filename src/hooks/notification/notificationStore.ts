import type { PaginationResponse } from "@/dto/base.dto";
import type {
  NotificationKafkaDTO,
  NotificationQuery,
  NotificationResponse,
} from "@/dto/notification.dto";
import { create } from "zustand";
import { notificationApi } from ".";

interface NotificationState {
  // State
  notifications: NotificationResponse[];
  unreadCount: number;
  currentPage: PaginationResponse<NotificationResponse> | null;
  loading: boolean;

  // Actions
  fetchUnreadCount: () => Promise<void>;
  fetchNotifications: (query?: NotificationQuery) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addOrUpdateNotification: (notification: NotificationResponse) => void;
  refreshAll: () => Promise<void>;
  handleNewNotificationEvent: (
    data: NotificationKafkaDTO
  ) => Promise<NotificationKafkaDTO>;
  handleNotificationEvent: (
    eventType: string,
    data?: any
  ) => Promise<NotificationKafkaDTO>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  currentPage: null,
  loading: false,

  // Fetch unread count
  fetchUnreadCount: async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  // Fetch notifications with pagination
  fetchNotifications: async (query: NotificationQuery = {}) => {
    set({ loading: true });
    try {
      const response = await notificationApi.getMyNotifications({
        page: 0,
        size: query.size || 10,
        sortBy: "createdDate",
        sortDirection: "DESC",
        ...query,
      });

      set({
        notifications: response.content,
        currentPage: response,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ loading: false });
    }
  },

  // Mark notification as read (Optimistic Update)
  markAsRead: async (id: string) => {
    const { notifications, unreadCount, currentPage: _ } = get();

    // Optimistically update local state BEFORE API call
    const notificationToUpdate = notifications.find((n) => n.id === id);
    const wasUnread = notificationToUpdate && !notificationToUpdate.isRead;

    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, isRead: true } : notification
    );

    let newUnreadCount = unreadCount;
    if (wasUnread) {
      newUnreadCount = Math.max(0, unreadCount - 1);
    }

    set((state) => ({
      notifications: updatedNotifications,
      unreadCount: newUnreadCount,
      // Update the content of the currentPage if it's currently loaded
      currentPage: state.currentPage
        ? {
            ...state.currentPage,
            content: state.currentPage.content.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
          }
        : null,
    }));

    try {
      await notificationApi.markAsRead(id);
      // API call succeeded. State is already updated. No need to re-fetch count.
    } catch (error) {
      console.error("Failed to mark as read, reverting state:", error);
      // Revert state on error (optional, but good practice for optimistic updates)
      get().fetchUnreadCount();
      get().fetchNotifications(
        get().currentPage?.number !== undefined
          ? { page: get().currentPage!.number }
          : undefined
      );
    }
  },

  // Delete notification (Optimistic Update)
  deleteNotification: async (id: string) => {
    const { notifications, unreadCount, currentPage: _ } = get();
    const notificationToDelete = notifications.find((n) => n.id === id);
    const wasUnread = notificationToDelete && !notificationToDelete.isRead;

    // Optimistically update local state BEFORE API call
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== id
    );
    let newUnreadCount = wasUnread ? Math.max(0, unreadCount - 1) : unreadCount;

    set((state) => ({
      notifications: updatedNotifications,
      unreadCount: newUnreadCount,
      // Update the content of the currentPage if it's currently loaded
      currentPage: state.currentPage
        ? {
            ...state.currentPage,
            content: state.currentPage.content.filter((n) => n.id !== id),
            totalElements: state.currentPage.totalElements - 1,
          }
        : null,
    }));

    try {
      await notificationApi.deleteNotification(id);
      // API call succeeded. State is already updated.
    } catch (error) {
      console.error("Failed to delete notification, reverting state:", error);
      // Revert state on error
      get().fetchUnreadCount();
      get().fetchNotifications(
        get().currentPage?.number !== undefined
          ? { page: get().currentPage!.number }
          : undefined
      );
    }
  },

  // Add or update notification (for real-time updates) - Simplified
  addOrUpdateNotification: (notification: NotificationResponse) => {
    set((state) => {
      const existingIndex = state.notifications.findIndex(
        (n) => n.id === notification.id
      );
      let updatedNotifications;
      let newUnreadCount = state.unreadCount;

      if (existingIndex >= 0) {
        // Update existing notification
        updatedNotifications = [...state.notifications];
        const oldNotification = updatedNotifications[existingIndex];
        updatedNotifications[existingIndex] = notification;

        // Adjust count only if read status changed
        if (oldNotification.isRead && !notification.isRead) {
          newUnreadCount++;
        } else if (!oldNotification.isRead && notification.isRead) {
          newUnreadCount = Math.max(0, newUnreadCount - 1);
        }
      } else {
        // Add new notification at the beginning
        updatedNotifications = [notification, ...state.notifications];
        if (!notification.isRead) {
          newUnreadCount++;
        }
      }

      // Handle current page update
      let updatedCurrentPage = state.currentPage;
      if (updatedCurrentPage) {
        const pageContent = updatedCurrentPage.content;
        const existingPageIndex = pageContent.findIndex(
          (n) => n.id === notification.id
        );
        let updatedPageContent;
        let newTotalElements = updatedCurrentPage.totalElements;

        if (existingPageIndex >= 0) {
          // Update in page
          updatedPageContent = [...pageContent];
          updatedPageContent[existingPageIndex] = notification;
        } else {
          // Add to page (at beginning if it's a new notification)
          updatedPageContent = [notification, ...pageContent.slice(0, -1)]; // Keep same page size
          newTotalElements++;
        }

        updatedCurrentPage = {
          ...updatedCurrentPage,
          content: updatedPageContent,
          totalElements: newTotalElements,
        };
      }

      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
        currentPage: updatedCurrentPage,
      };
    });
  },

  // Refresh all data
  refreshAll: async () => {
    const { fetchUnreadCount, fetchNotifications } = get();
    await Promise.all([fetchUnreadCount(), fetchNotifications()]);
  },

  // Handle new notification event from WebSocket - Simplified to just refresh
  handleNewNotificationEvent: async (data: NotificationKafkaDTO) => {
    const { fetchUnreadCount, fetchNotifications } = get();
    await Promise.all([fetchUnreadCount(), fetchNotifications()]);
    return data;
  },

  // Handle various notification events - Simplified to just refresh on most
  handleNotificationEvent: async (eventType: string, data?: any) => {
    const { fetchUnreadCount, fetchNotifications } = get();

    // Always refresh unread count
    await fetchUnreadCount();

    const event = eventType.toLowerCase();

    // If an ID is provided and the event is a state change, attempt local update
    if (data?.notificationId) {
      if (event.includes("read")) {
        get()
          .markAsRead(data.notificationId)
          .catch(() => fetchNotifications());
        return data;
      } else if (event.includes("delete")) {
        get()
          .deleteNotification(data.notificationId)
          .catch(() => fetchNotifications());
        return data;
      }
    }

    // Fallback: For all other events (new/create, update, or unhandled), refresh the full list
    await fetchNotifications();

    return event.includes("new") || event.includes("create") ? data : null;
  },
}));
