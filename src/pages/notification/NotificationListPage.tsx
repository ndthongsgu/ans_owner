import type { NotificationQuery } from "@/dto/notification.dto";
import { useNotificationStore } from "@/hooks/notification/notificationStore";
import {
  BellOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  List,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

const { Text, Title } = Typography;
const { Option } = Select;

const NotificationListPage: React.FC = () => {
  const {
    notifications,
    currentPage,
    loading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
  } = useNotificationStore();

  const [query, setQuery] = useState<NotificationQuery>({
    page: 0,
    size: 10,
    sortBy: "createdDate",
    sortDirection: "DESC",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications(query);
  }, [query, fetchNotifications]);

  const handleFilterChange = (field: keyof NotificationQuery, value: any) => {
    setQuery((prev) => ({
      ...prev,
      [field]: value,
      page: 0, // Reset to first page when filter changes
    }));
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setQuery((prev) => ({
      ...prev,
      page: page - 1, // Ant Design pagination is 1-based, API is 0-based
      size: pageSize,
    }));
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    // Navigate to detail page
    navigate(`/notifications/${notification.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering the click on the list item
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
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

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2}>
            <BellOutlined /> Notifications
          </Title>
          <Text type="secondary">
            Manage your notifications and stay updated
          </Text>
        </div>

        {/* Filters */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Text strong>Status:</Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="All"
                allowClear
                onChange={(value) => handleFilterChange("isRead", value)}
              >
                <Option value={false}>Unread</Option>
                <Option value={true}>Read</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Text strong>Channel:</Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="All Channels"
                allowClear
                onChange={(value) => handleFilterChange("channel", value)}
              >
                <Option value="EMAIL">Email</Option>
                <Option value="SMS">SMS</Option>
                <Option value="APP">App</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Notification List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <Empty
              description="No notifications found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <>
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <Card
                  hoverable
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    marginBottom: 16,
                    background: item.isRead ? "#fff" : "#f0f7ff",
                    cursor: "pointer",
                  }}
                >
                  <Space
                    direction="vertical"
                    size={8}
                    style={{ width: "100%" }}
                  >
                    {/* Header */}
                    <Space
                      style={{ justifyContent: "space-between", width: "100%" }}
                    >
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>
                          {item.title}
                        </Text>
                        {!item.isRead && (
                          <Tag color="blue" icon={<ClockCircleOutlined />}>
                            Unread
                          </Tag>
                        )}
                        <Tag color={getChannelColor(item.channel)}>
                          {item.channel}
                        </Tag>
                      </Space>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => handleDelete(e, item.id)}
                      />
                    </Space>

                    {/* Message */}
                    <Text type="secondary">{item.message}</Text>

                    {/* Metadata */}
                    <Space split="|">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.type.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(item.createdDate).format("MMM DD, YYYY HH:mm")}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(item.createdDate).fromNow()}
                      </Text>
                    </Space>

                    {/* Related entities */}
                    {(item.booking || item.trip) && (
                      <Space>
                        {item.booking && (
                          <Tag color="orange">Booking: {item.booking.code}</Tag>
                        )}
                        {item.trip && (
                          <Tag color="green">
                            Trip: {item.trip.route.startLocation} →{" "}
                            {item.trip.route.endLocation}
                          </Tag>
                        )}
                      </Space>
                    )}
                  </Space>
                </Card>
              )}
            />

            {/* Pagination */}
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Pagination
                current={(query.page || 0) + 1}
                pageSize={query.size || 10}
                total={currentPage?.totalElements || 0}
                onChange={handlePageChange}
                showSizeChanger
                showTotal={(total) => `Total ${total} notifications`}
              />
            </div>
          </>
        )}
      </Space>
    </div>
  );
};

export default NotificationListPage;
