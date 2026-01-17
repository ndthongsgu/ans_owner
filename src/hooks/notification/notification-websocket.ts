import type { Toast } from "@/components/toast";
import type { NotificationKafkaDTO } from "@/dto/notification.dto";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useNotificationStore } from "./notificationStore";

export type NotificationEventType =
  | "NEW_NOTIFICATION"
  | "READ_NOTIFICATION"
  | "DELETE_NOTIFICATION";

export interface WebSocketConfig {
  url: string;
  userId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  onNotification?: (
    event: NotificationEventType,
    data?: NotificationKafkaDTO
  ) => void;
}

// Add type for the injected toast function
type ShowToastFn = (toast: Omit<Toast, "id">) => void;

class WebSocketService {
  private client: Client | null = null;
  private config: WebSocketConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  private showToastFn: ShowToastFn | null = null;

  //  inject the toast function
  public setShowToastFunction(showToast: ShowToastFn): void {
    this.showToastFn = showToast;
  }

  /**
   * Initialize and connect to WebSocket server
   */
  connect(config: WebSocketConfig): void {
    this.config = config;

    // Create STOMP client with SockJS
    this.client = new Client({
      webSocketFactory: () => new SockJS(config.url) as any,

      connectHeaders: {
        // Add auth headers if needed
      },

      debug: (str) => {
        console.log("[WebSocket Debug]", str);
      },

      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("[WebSocket] Connected");
        this.reconnectAttempts = 0;

        if (this.config?.onConnect) {
          this.config.onConnect();
        }

        // Subscribe to user-specific notification topic
        this.subscribeToNotifications();

        // Subscribe to general notification events
        this.subscribeToGeneralEvents();
      },

      // ... rest of the existing methods ...
    });

    this.client.activate();
  }

  /**
   * Subscribe to notification topics
   */
  private subscribeToNotifications(): void {
    if (!this.client || !this.config) return;

    const userId = this.config.userId;

    // Subscribe to userId-based topic from notification-service
    this.client.subscribe(
      `/topic/notifications/${userId}`,
      (message: IMessage) => {
        console.log("[WebSocket] Received message:", message.body);

        try {
          const data: NotificationKafkaDTO = JSON.parse(message.body);

          // Use Zustand store to handle the event
          const store = useNotificationStore.getState();
          store.handleNewNotificationEvent(data).then((_alertData) => {
            // Show alert for new notification
            if (
              this.showToastFn &&
              (data.type === "NEW_NOTIFICATION" || !data.type)
            ) {
              this.showToastFn({
                type: "info", // Choose the correct type
                title: "New Notification",
                message: "You have a new notification",
                duration: 3000, // Duration in ms
              });
            }
          });

          // Also call the original callback if provided
          if (this.config?.onNotification) {
            this.config.onNotification("NEW_NOTIFICATION", data);
          }
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      }
    );

    console.log(`[WebSocket] Subscribed to /topic/notifications/${userId}`);
  }

  /**
   * Subscribe to general notification events
   */
  private subscribeToGeneralEvents(): void {
    if (!this.client || !this.config) return;

    // Subscribe to general notification events that might affect the list
    this.client.subscribe(`/topic/notifications`, (message: IMessage) => {
      console.log(
        "[WebSocket] Received general notification event:",
        message.body
      );

      try {
        const eventData = JSON.parse(message.body);
        this.handleGeneralEvent(eventData);
      } catch (error) {
        console.error("[WebSocket] Failed to parse general event:", error);
      }
    });

    console.log(`[WebSocket] Subscribed to /topic/notifications`);
  }

  /**
   * Handle general notification events
   */
  private handleGeneralEvent(eventData: any): void {
    const eventType = eventData.event?.toLowerCase() || "";

    console.log("[WebSocket] Handling general event:", eventType, eventData);

    // Check if this is a notification-related event
    if (eventType.includes("notification")) {
      // Use Zustand store to handle all notification events
      const store = useNotificationStore.getState();
      store.handleNotificationEvent(eventType, eventData).then((alertData) => {
        // Show alert for new notification events
        if (
          alertData &&
          (eventType.includes("new") || eventType.includes("create"))
        ) {
          if (this.showToastFn) {
            this.showToastFn({
              type: "info",
              title: "New Notification",
              message: "You have a new notification",
              duration: 3000,
            });
          }
        }
      });
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.config = null;
      console.log("[WebSocket] Disconnected manually");
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.client?.connected || false;
  }

  /**
   * Send a message (if needed for future features)
   */
  send(destination: string, body: any): void {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn("[WebSocket] Cannot send message - not connected");
    }
  }
}

// Export singleton instance
export const notificationWebsocketService = new WebSocketService();
