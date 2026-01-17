import type { BookingResponse } from "@/dto/booking.dto";
import {
  EnvironmentOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Space,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React from "react";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

interface BookingDetailsProps {
  booking: BookingResponse;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ booking }) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Card
      title={
        <Space>
          <ShoppingOutlined />
          <span>Booking Details</span>
        </Space>
      }
      // extra={
      //   <Link to={`/booking/${booking.id}`}>
      //     <Button type="primary">View Full Booking</Button>
      //   </Link>
      // }
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Basic Booking Info */}
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Booking Code" span={2}>
            <Text strong copyable>
              {booking.code}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(booking.bookingStatus)}>
              {booking.bookingStatus}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag>{booking.type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Price" span={2}>
            <Text strong style={{ fontSize: 16, color: "#ff4d4f" }}>
              {booking.totalPrice.toLocaleString("vi-VN")} VND
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {dayjs(booking.createdDate).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Updated">
            {dayjs(booking.updatedDate).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Customer Info */}
        <div>
          <Title level={5}>
            <UserOutlined /> Customer Information
          </Title>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Name" span={2}>
              {booking.customer?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {booking.customer?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {booking.customer?.phone}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* Seats */}
        <div>
          <Title level={5}>Booked Seats</Title>
          <Space wrap>
            {booking.bookingSeats?.map((seat) => (
              <Tag
                key={seat.id}
                color="blue"
                style={{ fontSize: 14, padding: "4px 12px" }}
              >
                {seat.seat?.seatNumber} - {seat.price.toLocaleString("vi-VN")}{" "}
                VND
              </Tag>
            ))}
          </Space>
        </div>

        <Divider />

        {/* Pickup & Dropoff */}
        <div>
          <Title level={5}>
            <EnvironmentOutlined /> Pickup & Dropoff
          </Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Card size="small" title="Pickup Stop">
              <Text strong>{booking.pickupStop?.id}</Text>
              <br />
              <Text type="secondary">{booking.pickupStop?.location}</Text>
            </Card>
            <Card size="small" title="Dropoff Stop">
              <Text strong>{booking.dropoffStop?.id}</Text>
              <br />
              <Text type="secondary">{booking.dropoffStop?.location}</Text>
            </Card>
          </Space>
        </div>

        {/* Payment Info */}
        {/* {booking.payment && (
          <>
            <Divider />
            <div>
              <Title level={5}>
                <CreditCardOutlined /> Payment Information
              </Title>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Method">
                  {booking.payment.method.name}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(booking.payment.status)}>
                    {booking.payment.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Amount">
                  {booking.payment.amount.toLocaleString("vi-VN")} VND
                </Descriptions.Item>
                <Descriptions.Item label="Transaction Code">
                  <Text copyable>{booking.payment.transactionCode}</Text>
                </Descriptions.Item>
                {booking.payment.paidAt && (
                  <Descriptions.Item label="Paid At" span={2}>
                    {dayjs(booking.payment.paidAt).format("DD/MM/YYYY HH:mm")}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </>
        )} */}
      </Space>
    </Card>
  );
};

export default BookingDetails;
