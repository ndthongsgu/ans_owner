import { notificationWebsocketService } from "@/hooks/notification/notification-websocket";
import { useNotificationStore } from "@/hooks/notification/notificationStore";
import { BellOutlined } from "@ant-design/icons";
import { Badge, Dropdown } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import { useGetCurrentUser } from "@/hooks/user";

const NotificationBell: React.FC = () => {
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const { data: user } = useGetCurrentUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!user?.id) {
      console.warn("No userId found - WebSocket not connected");
      return;
    }

    // Connect to WebSocket with minimal config - store handles everything
    notificationWebsocketService.connect({
      url: `${import.meta.env.VITE_API_NOTIFICATION_URL || ""}/ws-notifications`,
      userId: user.id,
      onConnect: () => {
        console.log("WebSocket connected");
      },
      onError: (error) => {
        console.error("WebSocket error:", error);
      },
    });

    // Cleanup on unmount
    return () => {
      notificationWebsocketService.disconnect();
    };
  }, [user?.id]);

  const handleDropdownOpenChange = (open: boolean) => {
    setDropdownOpen(open);
  };

  const handleViewAll = () => {
    setDropdownOpen(false);
    navigate("/notifications");
  };

  return (
    <Dropdown
      open={dropdownOpen}
      onOpenChange={handleDropdownOpenChange}
      dropdownRender={() => (
        <NotificationDropdown
          onViewAll={handleViewAll}
          onClose={() => setDropdownOpen(false)}
        />
      )}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Badge count={unreadCount} offset={[-5, 5]} size="small">
        <BellOutlined
          style={{
            fontSize: "20px",
            color: "#fff",
            cursor: "pointer",
          }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
