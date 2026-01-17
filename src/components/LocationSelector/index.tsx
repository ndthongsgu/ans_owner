import { Select } from "antd";
import { useEffect, useState } from "react";
import GlobalLoading from "../loading";

const { Option } = Select;

interface LocationSelectorProps {
  value?: number | null;
  onChange?: (province: { id: number; name: string } | null) => void;
  placeholder?: string;
}

export default function LocationSelector({
  value,
  onChange,
  placeholder = "Chọn tỉnh/thành phố",
}: LocationSelectorProps) {
  interface Province {
    id: number;
    name: string;
    name_en: string;
    full_name: string;
    full_name_en: string;
    latitude: string;
    longitude: string;
  }

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0 && data.data) {
          setProvinces(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi fetch provinces:", err);
        setLoading(false);
        fetch("https://provinces.open-api.vn/api/p/")
          .then((res) => res.json())
          .then((fallbackData) => {
            const mappedData = fallbackData.map(
              (item: {
                code: number;
                name: string;
                name_en: string;
                full_name: string;
                full_name_en: string;
              }) => ({
                id: item.code,
                name: item.name,
                name_en: item.name_en || "",
                full_name: item.full_name || item.name,
                full_name_en: item.full_name_en || item.name_en || "",
                latitude: "",
                longitude: "",
              })
            );
            setProvinces(mappedData);
          })
          .catch((fallbackErr) => {
            console.error("Lỗi fallback API:", fallbackErr);
          });
      });
  }, []);

  if (loading) return <GlobalLoading />;

  return (
    <Select
      style={{
        width: "100%",
        height: 48,
        borderRadius: 10,
      }}
      allowClear
      showSearch
      placeholder={placeholder}
      value={value || undefined}
      onChange={(provinceId) => {
        const selected = provinces.find((p) => p.id === provinceId);
        onChange?.(selected ? { id: selected.id, name: selected.name } : null);
      }}
      optionFilterProp="children"
      filterOption={(input, option) =>
        typeof option?.children === "string" &&
        (option.children as string).toLowerCase().includes(input.toLowerCase())
      }
    >
      {provinces.map((p) => (
        <Option key={p.id} value={p.id}>
          {p.full_name || p.name}
        </Option>
      ))}
    </Select>
  );
}
