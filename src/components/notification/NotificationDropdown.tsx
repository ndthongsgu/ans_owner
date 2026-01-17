import type { NotificationResponse } from "@/dto/notification.dto";
import { useNotificationStore } from "@/hooks/notification/notificationStore";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Button, Empty, List, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

const { Text } = Typography;

interface NotificationDropdownProps {
  onViewAll: () => void;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onViewAll,
  onClose,
}) => {
  const { notifications, fetchNotifications, markAsRead } =
    useNotificationStore();
  const navigate = useNavigate();

  // Load notifications when dropdown opens
  useEffect(() => {
    fetchNotifications({ size: 5 });
  }, [fetchNotifications]);

  const handleNotificationClick = async (
    notification: NotificationResponse
  ) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate to detail page
    onClose();
    navigate(`/notifications/${notification.id}`);
  };

  return (
    <div
      style={{
        width: 380,
        maxHeight: 500,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fafafa",
        }}
      >
        <Text strong style={{ fontSize: 16 }}>
          Notifications
        </Text>
      </div>

      {/* Notification List */}
      <div style={{ maxHeight: 380, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <Empty
            description="No notifications"
            style={{ padding: 40 }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={notifications.slice(0, 5)}
            renderItem={(item) => (
              <List.Item
                onClick={() => handleNotificationClick(item)}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  background: item.isRead ? "#fff" : "#f0f7ff",
                  borderBottom: "1px solid #f0f0f0",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fafafa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = item.isRead
                    ? "#fff"
                    : "#f0f7ff";
                }}
              >
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                  <Space
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <Text strong ellipsis style={{ maxWidth: 250 }}>
                      {item.title}
                    </Text>
                    {!item.isRead && (
                      <Tag
                        color="blue"
                        icon={<ClockCircleOutlined />}
                        style={{ margin: 0 }}
                      >
                        New
                      </Tag>
                    )}
                  </Space>
                  <Text type="secondary" ellipsis style={{ fontSize: 13 }}>
                    {item.message}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(item.createdDate).fromNow()}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "8px 16px",
          borderTop: "1px solid #f0f0f0",
          textAlign: "center",
        }}
      >
        <Button type="link" onClick={onViewAll} block>
          View All Notifications
        </Button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
