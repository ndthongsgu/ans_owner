import { CarOutlined, TruckOutlined } from "@ant-design/icons";

const services = [
  {
    name: "Xe khách",
    icon: <CarOutlined style={{ fontSize: 32, color: "#fff" }} />,
    bgColor: "#FFA500",
    description: "Dịch vụ thuê xe riêng, linh hoạt theo nhu cầu",
  },
  {
    name: "Mua vé ",
    icon: <TruckOutlined style={{ fontSize: 32, color: "#fff" }} />,
    bgColor: "#FF4500",
    description: "Đặt vé xe trực tuyến tiện lợi, nhanh chóng",
  },
  {
    name: "Giao hàng",
    icon: <TruckOutlined style={{ fontSize: 32, color: "#fff" }} />,
    bgColor: "#32CD32",
    description: "Gửi hàng nhanh chóng, an toàn đến mọi nơi",
  },
  {
    name: "Xe dịch vụ",
    icon: <TruckOutlined style={{ fontSize: 32, color: "#fff" }} />,
    bgColor: "#1E90FF",
    description: "Dịch vụ xe buýt nội thành tiện lợi, giá rẻ",
  },
];

export default function SocialLinkPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F9FAFB",
        padding: "32px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "#047857",
          marginBottom: "12px",
          textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        KẾT NỐI VIET TRAVEL GROUP
      </h1>
      <p
        style={{
          color: "#4B5563",
          textAlign: "center",
          maxWidth: "720px",
          marginBottom: "48px",
          fontSize: "1rem",
          lineHeight: "1.6",
        }}
      >
        Kết nối đa dạng hệ sinh thái VIET TRAVEL Group qua App VIET TRAVEL: mua
        vé xe khách, xe buýt, xe hợp đồng, giao hàng,... mọi dịch vụ trong tầm
        tay bạn.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "32px",
          width: "100%",
          maxWidth: "960px",
        }}
      >
        {services.map((service) => (
          <div
            key={service.name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
              borderRadius: "20px",
              padding: "24px",
              transition: "all 0.35s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px) scale(1.05)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.08)";
            }}
          >
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${service.bgColor}, #fff)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              {service.icon}
            </div>
            <span
              style={{
                textAlign: "center",
                color: "#111827",
                fontWeight: "600",
                fontSize: "1.05rem",
                marginBottom: "6px",
              }}
            >
              {service.name}
            </span>
            <span
              style={{
                textAlign: "center",
                color: "#6B7280",
                fontSize: "0.85rem",
                lineHeight: "1.4",
              }}
            >
              {service.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
