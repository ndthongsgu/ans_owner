import { loading } from "@/assets/animations";
import { Spin, Typography } from "antd";
import Lottie from "lottie-react";

export default function GlobalLoading() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999999,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div style={{ width: 350, height: 350 }}>
        <Lottie animationData={loading} loop />
      </div>
      <Typography.Text
        style={{
          marginTop: 16,
          fontSize: 20,
          fontWeight: 600,
          color: "#595959",
        }}
      >
        Đang tải...
      </Typography.Text>
      <Spin style={{ marginTop: 16 }} />
    </div>
  );
}
