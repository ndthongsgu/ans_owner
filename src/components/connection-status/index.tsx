import { WifiOutlined } from "@ant-design/icons";
import { Badge, Tooltip } from "antd";
import { memo } from "react";

interface ConnectionStatusProps {
  connected: boolean;
  className?: string;
}

export default memo(function ConnectionStatus({
  connected,
  className = "",
}: ConnectionStatusProps) {
  return (
    <Tooltip
      title={
        connected
          ? "Kết nối thời gian thực hoạt động"
          : "Mất kết nối thời gian thực - đang thử kết nối lại..."
      }
    >
      <Badge
        status={connected ? "success" : "error"}
        className={className}
        style={{ fontSize: "12px" }}
      >
        <WifiOutlined
          style={{
            color: connected ? "#52c41a" : "#ff4d4f",
            fontSize: "14px",
          }}
        />
        <span style={{ marginLeft: 4, fontSize: "12px" }}>
          {connected ? "Realtime" : "Offline"}
        </span>
      </Badge>
    </Tooltip>
  );
});
