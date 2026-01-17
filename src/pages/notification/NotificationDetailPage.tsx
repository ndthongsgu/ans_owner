import BookingDetails from "@/components/notification/NotificationBookingDetails";
import TripDetails from "@/components/notification/NotificationTripDetails";
import type { NotificationResponse } from "@/dto/notification.dto";
import { notificationApi } from "@/hooks/notification";
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  BellOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  MailOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  message,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const NotificationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<NotificationResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchNotification(id);
    }
  }, [id]);

  const fetchNotification = async (notificationId: string) => {
    setLoading(true);
    try {
      const data = await notificationApi.getNotificationById(notificationId);
      setNotification(data);

      // Mark as read if not already
      if (!data.isRead) {
        await notificationApi.markAsRead(notificationId);
        setNotification({ ...data, isRead: true });
      }
    } catch (error) {
      console.error("Failed to fetch notification:", error);
      message.error("Failed to load notification");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!notification) return;

    try {
      await notificationApi.deleteNotification(notification.id);
      message.success("Notification deleted");
      navigate("/notifications");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      message.error("Failed to delete notification");
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toUpperCase()) {
      case "EMAIL":
        return <MailOutlined />;
      case "SMS":
        return <MobileOutlined />;
      case "APP":
        return <AppstoreOutlined />;
      default:
        return <BellOutlined />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel.toUpperCase()) {
      case "EMAIL":
        return "blue";
      case "SMS":
        return "green";
      case "APP":
        return "purple";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!notification) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Text type="secondary">Notification not found</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header with Back Button */}
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/notifications")}
            style={{ marginBottom: 16 }}
          >
            Back to Notifications
          </Button>
        </div>

        {/* Main Notification Card */}
        <Card
          title={
            <Space>
              <BellOutlined />
              <span>{notification.title}</span>
            </Space>
          }
          extra={
            <Space>
              {notification.isRead && (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Read
                </Tag>
              )}
              <Popconfirm
                title="Delete this notification?"
                description="This action cannot be undone."
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          }
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Notification Metadata */}
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Type" span={2}>
                <Space>
                  <Tag color="cyan">{notification.type.code}</Tag>
                  <Text>{notification.type.name}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Channel">
                <Tag
                  icon={getChannelIcon(notification.channel)}
                  color={getChannelColor(notification.channel)}
                >
                  {notification.channel}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {notification.isSent ? (
                  <Tag color="success">Sent</Tag>
                ) : (
                  <Tag color="warning">Pending</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(notification.createdDate).format("DD/MM/YYYY HH:mm:ss")}
              </Descriptions.Item>
              <Descriptions.Item label="Sent At">
                {notification.sentAt
                  ? dayjs(notification.sentAt).format("DD/MM/YYYY HH:mm:ss")
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Message Content */}
            <div>
              <Title level={5}>Message</Title>
              <Card style={{ background: "#fafafa" }}>
                <Paragraph
                  style={{ fontSize: 15, margin: 0, whiteSpace: "pre-wrap" }}
                >
                  {notification.message}
                </Paragraph>
              </Card>
            </div>

            {/* User Info */}
            <div>
              <Title level={5}>Recipient</Title>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Name">
                  {notification.user.username}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {notification.user.email}
                </Descriptions.Item>
                {/* {notification.user.phone && (
                  <Descriptions.Item label="Phone" span={2}>
                    {notification.user.phone}
                  </Descriptions.Item>
                )} */}
              </Descriptions>
            </div>
          </Space>
        </Card>

        {/* Booking Details (if exists) */}
        {notification.booking && (
          <BookingDetails booking={notification.booking} />
        )}

        {/* Trip Details (if exists and not already shown in booking) */}
        {notification.trip && !notification.booking && (
          <TripDetails trip={notification.trip} />
        )}

        {/* If booking exists, also show its trip separately for clarity */}
        {notification.booking && notification.booking.trip && (
          <>
            <Divider />
            <TripDetails trip={notification.booking.trip} />
          </>
        )}
      </Space>
    </div>
  );
};

export default NotificationDetailPage;
