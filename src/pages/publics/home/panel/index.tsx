import { Demo } from "@/assets/videos";
import SearchPanel from "@/components/search-panel/SearchPanel";
import { useToast } from "@/hooks/layout/useToast";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

export default function PanelSection() {
  const showToast = useToast();
  const navigate = useNavigate();

  const handleSearch = async (searchData: {
    from: string;
    to: string;
    departure: dayjs.Dayjs | null;
    ticketCount: number;
  }) => {
    if (!searchData.from || !searchData.to) {
      showToast({
        type: "error",
        title: "Thông tin chưa đầy đủ",
        message: "Vui lòng nhập đầy đủ thông tin tìm kiếm",
      });
      return;
    }

    navigate("/booking", {
      state: searchData,
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: -150,
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      }}
    >
      <div
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          textAlign: "center",
          width: "100%",
          height: 350,
        }}
      >
        <video
          src={Demo}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
          }}
        />
      </div>

      <SearchPanel onSearch={handleSearch} />
    </div>
  );
}
