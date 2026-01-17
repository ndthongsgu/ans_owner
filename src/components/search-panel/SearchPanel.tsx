import {
  useEndLocationsByStart,
  useLocationSelection,
  type LocationResponse,
} from "@/hooks/route";
import { SwapOutlined } from "@ant-design/icons";
import { Button, Card, Col, DatePicker, Row, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useState } from "react";

const { Option } = Select;

interface SearchPanelProps {
  defaultValues?: {
    from?: string;
    to?: string;
    departure?: Dayjs | string;
    ticketCount?: number;
  };
  onSearch: (data: {
    from: string;
    to: string;
    departure: Dayjs | null;
    ticketCount: number;
  }) => void;
  loading?: boolean;
}

const parseDeparture = (departure: any): Dayjs | null => {
  if (!departure) return null;

  try {
    if (departure.$d) {
      return dayjs(departure.$d);
    }
    return dayjs(departure);
  } catch (error) {
    return null;
  }
};

export default function SearchPanel({
  defaultValues,
  onSearch,
  loading = false,
}: SearchPanelProps) {
  const [from, setFrom] = useState<string | null>(defaultValues?.from || null);
  const [to, setTo] = useState<string | null>(defaultValues?.to || null);

  const { locations, isLoading: locationsLoading } = useLocationSelection();

  const { data: locationsByStart = [], isLoading: endLocationsLoading } =
    useEndLocationsByStart(from || "");

  const [departure, setDeparture] = useState<Dayjs | null>(
    parseDeparture(defaultValues?.departure)
  );

  const [ticketCount, setTicketCount] = useState<number>(
    defaultValues?.ticketCount || 1
  );

  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.from) {
        setFrom(defaultValues.from);
      }
      if (defaultValues.to) {
        setTo(defaultValues.to);
      }
      if (defaultValues.departure) {
        setDeparture(parseDeparture(defaultValues.departure));
      }
      if (defaultValues.ticketCount) {
        setTicketCount(defaultValues.ticketCount);
      }
    }
  }, [defaultValues]);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = () => {
    if (!from || !to) {
      return;
    }

    onSearch({
      from,
      to,
      departure,
      ticketCount,
    });
  };

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        paddingTop: 10,
      }}
    >
      <Card
        style={{
          borderRadius: "16px",
          border: "1px solid var(--color-primary-500)",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          width: "100%",
          position: "relative",
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 40 }}>
          <Col xs={24} sm={12}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>Điểm đi</div>
                <Select
                  size="large"
                  value={from}
                  onChange={(value) => {
                    setFrom(value);
                    setTo(null);
                  }}
                  placeholder="Chọn điểm đi"
                  style={{ width: "100%", height: 48, borderRadius: 10 }}
                  loading={locationsLoading}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={locations.map((location: LocationResponse) => ({
                    value: location.location || "",
                    label: location.location || "",
                  }))}
                />
              </div>

              <Button
                shape="circle"
                icon={<SwapOutlined />}
                onClick={handleSwap}
                disabled={!from || !to}
                style={{
                  position: "absolute",
                  top: "70%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 1,
                  border: "none",
                  borderColor: "#91D5FF",
                  color: "var(--color-primary-800)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>Điểm đến</div>
                <Select
                  size="large"
                  value={to}
                  onChange={setTo}
                  placeholder={
                    !from
                      ? "Vui lòng chọn điểm đi trước"
                      : endLocationsLoading
                      ? "Đang tải..."
                      : "Chọn điểm đến"
                  }
                  disabled={!from}
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 10,
                    opacity: !from ? 0.6 : 1,
                  }}
                  loading={endLocationsLoading}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={locationsByStart.map((location) => ({
                    value: location.location || "",
                    label: location.location || "",
                  }))}
                  notFoundContent={
                    from &&
                    !endLocationsLoading &&
                    locationsByStart.length === 0
                      ? "Không có điểm đến từ địa điểm này"
                      : "Không tìm thấy"
                  }
                />
              </div>
            </div>
          </Col>

          <Col xs={24} sm={6}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Ngày đi</div>
            <DatePicker
              size="large"
              style={{ width: "100%", height: 48, borderRadius: 10 }}
              placeholder="Chọn ngày đi"
              value={departure}
              onChange={setDeparture}
              disabledDate={(current) => {
                return current && current < dayjs().startOf("day");
              }}
            />
          </Col>

          <Col xs={24} sm={6}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>Số vé</div>
            <Select
              size="large"
              value={ticketCount}
              onChange={(val) => setTicketCount(val)}
              style={{ width: "100%", height: 48, borderRadius: 10 }}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Option key={n} value={n}>
                  {n}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <div
          style={{
            position: "absolute",
            bottom: -24,
            left: "50%",
            transform: "translateX(-50%)",
            width: "250px",
          }}
        >
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSearch}
            disabled={!from || !to}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 24,
              backgroundColor: "var(--color-primary-800)",
              border: "none",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {loading ? "Đang tìm kiếm..." : "Tìm chuyến xe"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
