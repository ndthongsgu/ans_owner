import { error } from "@/assets/animations";
import Lottie from "lottie-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

export default function NotFound(): JSX.Element {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "1.5rem",
        overflow: "hidden",
        zIndex: 1,
        backgroundColor: "#f9fafb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "472px",
          textAlign: "center",
          margin: "0 auto",
        }}
      >
        <Lottie
          animationData={error}
          loop
          style={{ width: "100%", height: "auto" }}
        />

        <p
          style={{
            marginTop: "2.5rem",
            marginBottom: "1.5rem",
            fontSize: "1rem",
            color: "#4b5563",
            lineHeight: 1.5,
          }}
        >
          Có vẻ như chúng tôi không thể tìm thấy trang bạn đang tìm kiếm!
        </p>

        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
            backgroundColor: "#ffffff",
            padding: "0.875rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#374151",
            textDecoration: "none",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              "#f3f4f6";
            (e.currentTarget as HTMLAnchorElement).style.color = "#111827";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              "#ffffff";
            (e.currentTarget as HTMLAnchorElement).style.color = "#374151";
          }}
        >
          <i className="pi pi-home"></i>
          <span style={{ marginLeft: "0.5rem" }}>Trở về trang chủ</span>
        </Link>
      </div>
    </div>
  );
}
