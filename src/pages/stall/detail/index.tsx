import { Descriptions, Image, Space } from "antd";
import type { StallResponse } from "@/dto/stall.dto";

type StallDetailProps = {
  stall: StallResponse;
  getStallAddress: (stall: StallResponse) => string;
  getPriceRange: (stall: StallResponse) => string;
  getOpeningHours: (stall: StallResponse) => string;
  getClosingHours: (stall: StallResponse) => string;
};

export default function StallDetail({
  stall,
  getStallAddress,
  getPriceRange,
  getOpeningHours,
  getClosingHours,
}: StallDetailProps) {
  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Image src={stall.cover_image} alt={stall.cover_image} />
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Tên quán">
          {stall.stall_name}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ quán">
          {getStallAddress(stall)}
        </Descriptions.Item>
        <Descriptions.Item label="Danh mục">{stall.category}</Descriptions.Item>
        <Descriptions.Item label="Mức giá">
          {getPriceRange(stall)}
        </Descriptions.Item>
        <Descriptions.Item label="Giờ hoạt động">
          {getOpeningHours(stall)} - {getClosingHours(stall)}
        </Descriptions.Item>
      </Descriptions>
    </Space>
  );
}
