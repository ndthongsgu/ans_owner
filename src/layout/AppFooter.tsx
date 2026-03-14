import {
  EnvironmentOutlined,
  FacebookOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { Space } from "antd";
import { Link } from "react-router-dom";
import { PUBLIC_ROUTES, REQUIRE_AUTH_ROUTES } from "@/routes/routes";

export default function AppFooter() {
  return (
    <div
      style={{
        backgroundColor: "#fffaf7",
        color: "#333",
        borderTop: "2px solid #e0e0e0",
        padding: "48px 64px 24px",
        fontSize: "14px",
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 40,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ flex: "1 1 300px", minWidth: 260 }}>
          <p
            style={{
              color: "#007a3d",
              fontWeight: 600,
              marginBottom: 6,
              fontSize: "15px",
            }}
          >
            TỔNG ĐÀI TƯ VẤN CHỦ QUÁN
          </p>
          <p
            style={{
              color: "#ff4d00",
              fontSize: "24px",
              fontWeight: 700,
              margin: "0 0 16px",
            }}
          >
            1900 5678
          </p>

          <p
            style={{
              color: "#007a3d",
              fontWeight: 600,
              marginBottom: 6,
              fontSize: "15px",
            }}
          >
            STREET FOOD GO SERVICE
          </p>
          <p style={{ margin: 0 }}>
            <EnvironmentOutlined /> 88 Nguyễn Huệ, Quận 1, TP.HCM
          </p>
          <p style={{ margin: 0 }}>
            <MailOutlined /> hello@streetfoodgo.vn
          </p>
          <p style={{ margin: 0 }}>
            <PhoneOutlined /> 028 9999 8888
          </p>
        </div>

        <div style={{ flex: "1 1 220px", minWidth: 200 }}>
          <p
            style={{
              color: "#007a3d",
              fontWeight: 600,
              marginBottom: 12,
              fontSize: "15px",
            }}
          >
            LIÊN KẾT NHANH
          </p>
          <Space direction="vertical" size="small">
            <Link to={PUBLIC_ROUTES.HOME} style={{ color: "#333" }}>
              Bảng điều khiển
            </Link>
            <Link to={PUBLIC_ROUTES.LOGIN} style={{ color: "#333" }}>
              Đăng nhập quản trị
            </Link>
            <Link
              to={REQUIRE_AUTH_ROUTES.OWNER_PROFILE}
              style={{ color: "#333" }}
            >
              Hồ sơ chủ quán
            </Link>
            <Link
              to={REQUIRE_AUTH_ROUTES.CHANGE_PASSWORD}
              style={{ color: "#333" }}
            >
              Đổi mật khẩu
            </Link>
          </Space>
        </div>

        <div style={{ flex: "1 1 220px", minWidth: 200 }}>
          <p
            style={{
              color: "#007a3d",
              fontWeight: 600,
              marginBottom: 10,
              fontSize: "15px",
            }}
          >
            KÊNH KẾT NỐI
          </p>
          <Space size="large">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#1877f2", fontSize: 20 }}
            >
              <FacebookOutlined />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#ff0000", fontSize: 20 }}
            >
              <YoutubeOutlined />
            </a>
            <a
              href="https://streetfoodgo.vn"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#333", fontSize: 20 }}
            >
              <GlobalOutlined />
            </a>
          </Space>

          <p
            style={{
              color: "#007a3d",
              fontWeight: 600,
              marginTop: 20,
              marginBottom: 10,
              fontSize: "15px",
            }}
          >
            DỊCH VỤ
          </p>
          <ul style={{ listStyleType: "disc", paddingLeft: 18, margin: 0 }}>
            <li>Thuyết minh món ăn tự động</li>
            <li>Đọc menu bằng nhiều giọng nói</li>
            <li>Quản lý nội dung tại dashboard</li>
            <li>Thống kê lượt nghe theo khu vực</li>
          </ul>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: 16,
          color: "var(--color-text-secondary)",
          textAlign: "center",
          marginTop: 32,
          fontSize: "13px",
        }}
      >
        {"(c) " +
          new Date().getFullYear() +
          " STREET FOOD GO - Giải pháp thuyết minh tự động cho quán ăn."}
      </div>
    </div>
  );
}
