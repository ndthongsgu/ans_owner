import type { TripUserResponse } from "@/dto/trip.dto";
import {
  CarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Button, Card, Descriptions, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import React from "react";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

interface TripDetailsProps {
  trip: TripUserResponse;
}

const TripDetails: React.FC<TripDetailsProps> = ({ trip }) => {
  // const availabilityPercentage = (
  //   (trip.availableSeats / trip.numberOfSeats) *
  //   100
  // ).toFixed(0);

  // const getAvailabilityColor = () => {
  //   const percentage = parseInt(availabilityPercentage);
  //   if (percentage > 50) return "success";
  //   if (percentage > 20) return "warning";
  //   return "error";
  // };

  // const getAvailabilityColor = () => {
  //   if (trip.availableSeats > 10) return "success";
  //   if (trip.availableSeats > 5) return "warning";
  //   return "error";
  // };

  return (
    <Card
      title={
        <Space>
          <CarOutlined />
          <span>Trip Details</span>
        </Space>
      }
      // extra={
      //   <Link to={`/trip/${trip.id}`}>
      //     <Button type="primary">View Full Trip</Button>
      //   </Link>
      // }
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Route Information */}
        <div>
          <Title level={5}>
            <EnvironmentOutlined /> Route
          </Title>
          <Space size="large" align="center">
            <Tag color="blue" style={{ fontSize: 16, padding: "8px 16px" }}>
              {trip.route.startLocation}
            </Tag>
            <Text strong style={{ fontSize: 18 }}>
              →
            </Text>
            <Tag color="green" style={{ fontSize: 16, padding: "8px 16px" }}>
              {trip.route.endLocation}
            </Tag>
          </Space>
          <Descriptions column={2} size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Distance">
              {trip.route.distanceKm} km
            </Descriptions.Item>
            <Descriptions.Item label="Estimated Duration">
              {typeof trip.route.estimatedDuration === "number"
                ? `${Math.floor(trip.route.estimatedDuration / 60)}h ${
                    trip.route.estimatedDuration % 60
                  }m`
                : "Unknown"}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Schedule */}
        <div>
          <Title level={5}>
            <ClockCircleOutlined /> Schedule
          </Title>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Departure Time" span={2}>
              <Text strong style={{ fontSize: 15 }}>
                {dayjs(trip.departureTime).format("DD/MM/YYYY HH:mm")}
              </Text>
              <br />
              <Text type="secondary">
                {dayjs(trip.departureTime).fromNow()}
              </Text>
            </Descriptions.Item>
            {/* <Descriptions.Item label="Arrival Time" span={2}>
              <Text strong style={{ fontSize: 15 }}>
                {dayjs(trip.arrivalTime).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Descriptions.Item> */}
          </Descriptions>
        </div>

        {/* Pricing & Availability */}
        <div>
          <Title level={5}>Pricing & Availability</Title>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Price per Seat">
              <Text strong style={{ fontSize: 16, color: "#ff4d4f" }}>
                {trip.price.toLocaleString("vi-VN")} VND
              </Text>
            </Descriptions.Item>
            {/* <Descriptions.Item label="Total Seats">
              {trip.numberOfSeats}
            </Descriptions.Item> */}
            <Descriptions.Item label="Available Seats">
              <Space>
                <Text strong>{trip.availableSeats}</Text>
                {/* <Tag color={getAvailabilityColor()}>
                  {availabilityPercentage}% available
                </Tag> */}
              </Space>
            </Descriptions.Item>
            {/* <Descriptions.Item label="Booked Seats">
              {trip.numberOfSeats - trip.availableSeats}
            </Descriptions.Item> */}
          </Descriptions>
        </div>
      </Space>
    </Card>
  );
};

export default TripDetails;
