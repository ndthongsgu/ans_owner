import {
  EnvironmentOutlined,
  FacebookOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { Space } from "antd";

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
        <div style={{ flex: "1 1 260px", minWidth: 240 }}>
          <p
            style={{
              color: "#007a3d",
              fontWeight: 600,
              marginBottom: 6,
              fontSize: "15px",
            }}
          >
            TRUNG TÂM TỔNG ĐÀI & CSKH
          </p>
          <p
            style={{
              color: "#ff4d00",
              fontSize: "24px",
              fontWeight: 700,
              margin: "0 0 16px",
            }}
          >
            1900 1234
          </p>

          <p
            style={{
              color: "#007a3d",
              fontWeight: 600,
              marginBottom: 6,
              fontSize: "15px",
            }}
          >
            CÔNG TY DU LỊCH VIETTRAVEL
          </p>
          <p style={{ margin: 0 }}>
            <EnvironmentOutlined /> 123 Lê Lợi, Quận 1, TP.HCM
          </p>
          <p style={{ margin: 0 }}>
            <MailOutlined /> info@xeviet.vn
          </p>
          <p style={{ margin: 0 }}>
            <PhoneOutlined /> 028 3838 6852
          </p>
        </div>

        <div style={{ flex: "1 1 240px", minWidth: 200 }}>
          <p
            style={{
              color: "#007a3d",
              fontWeight: 600,
              marginBottom: 12,
              fontSize: "15px",
            }}
          >
            TẢI ỨNG DỤNG VIETTRAVEL
          </p>
          <Space direction="vertical" size="small">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="CH Play"
              style={{ height: 40, cursor: "pointer" }}
            />
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="App Store"
              style={{ height: 40, cursor: "pointer" }}
            />
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
            KẾT NỐI VỚI CHÚNG TÔI
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
              href="https://xeviet.vn"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#333", fontSize: 20 }}
            >
              <GlobalOutlined />
            </a>
          </Space>
        </div>

        <div style={{ flex: "1 1 200px", minWidth: 180 }}>
          <p
            style={{
              color: "#007a3d",
              fontWeight: 600,
              marginBottom: 10,
              fontSize: "15px",
            }}
          >
            DỊCH VỤ XE VIETTRAVEL
          </p>
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: 18,
              margin: 0,
              color: "#333",
            }}
          >
            <li>
              <a
                href="#vechungtoi"
                style={{ color: "#333", textDecoration: "none" }}
              >
                Về chúng tôi
              </a>
            </li>
            <li>
              <a
                href="#lichtrinh"
                style={{ color: "#333", textDecoration: "none" }}
              >
                Lịch trình
              </a>
            </li>
            <li>
              <a
                href="#tuyendung"
                style={{ color: "#333", textDecoration: "none" }}
              >
                Tuyển dụng
              </a>
            </li>
            <li>
              <a
                href="#tintuc"
                style={{ color: "#333", textDecoration: "none" }}
              >
                Tin tức & sự kiện
              </a>
            </li>
          </ul>
        </div>

        <div style={{ flex: "1 1 200px", minWidth: 180 }}>
          <p
            style={{
              color: "#007a3d",
              fontWeight: 600,
              marginBottom: 10,
              fontSize: "15px",
            }}
          >
            HỖ TRỢ KHÁCH HÀNG
          </p>
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: 18,
              margin: 0,
              color: "#333",
            }}
          >
            <li>
              <a
                href="#tracuu"
                style={{ color: "#333", textDecoration: "none" }}
              >
                Tra cứu vé xe
              </a>
            </li>
            <li>
              <a
                href="#dieukhoan"
                style={{ color: "#333", textDecoration: "none" }}
              >
                Điều khoản sử dụng
              </a>
            </li>
            <li>
              <a
                href="#huongdan"
                style={{ color: "#333", textDecoration: "none" }}
              >
                Hướng dẫn đặt vé online
              </a>
            </li>
            <li>
              <a
                href="#napthe"
                style={{ color: "#333", textDecoration: "none" }}
              >
                Hướng dẫn nạp tiền
              </a>
            </li>
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
        © {new Date().getFullYear()} Công ty Du Lịch VietTravel — Giải pháp đặt
        vé xe toàn diện cho bạn.
      </div>
    </div>
  );
}
