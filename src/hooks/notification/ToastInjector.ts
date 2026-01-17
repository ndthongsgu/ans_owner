import React, { useEffect } from "react";
import { useToast } from "../layout/useToast";
import { notificationWebsocketService } from "./notification-websocket";

/**
 * A component to use the toast hook and inject the function into the
 * singleton WebSocketService for use outside of React components.
 */
const ToastInjector: React.FC = () => {
  // ⭐️ 1. Call the hook inside a React component
  const showToast = useToast();

  // ⭐️ 2. Inject the function into the service on mount
  useEffect(() => {
    notificationWebsocketService.setShowToastFunction(showToast);
  }, [showToast]);

  return null; // This component renders nothing
};

export default ToastInjector;
