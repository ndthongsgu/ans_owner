import { Bus } from "@/assets/icons";
import {
  EnvironmentOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Card, Carousel, Col, Row, Select, Typography } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

const { Option } = Select;
const { Text, Title } = Typography;

const cities = [
  {
    name: "Ho Chi Minh City",
    coords: "10.8231,106.6297",
    vietnameseName: "TP.HCM",
  },
  { name: "Hanoi", coords: "21.0285,105.8542", vietnameseName: "Hà Nội" },
  { name: "Da Nang", coords: "16.0471,108.2068", vietnameseName: "Đà Nẵng" },
  {
    name: "Hai Phong",
    coords: "20.8449,106.6881",
    vietnameseName: "Hải Phòng",
  },
  { name: "Can Tho", coords: "10.0452,105.7469", vietnameseName: "Cần Thơ" },
  {
    name: "Nha Trang",
    coords: "12.2388,109.1967",
    vietnameseName: "Nha Trang",
  },
  { name: "Hue", coords: "16.4637,107.5909", vietnameseName: "Huế" },
  { name: "Vung Tau", coords: "10.4113,107.1440", vietnameseName: "Vũng Tàu" },
  { name: "Bien Hoa", coords: "10.9460,106.8230", vietnameseName: "Biên Hòa" },
  { name: "Nam Dinh", coords: "20.4200,106.1670", vietnameseName: "Nam Định" },
  { name: "Quy Nhon", coords: "13.7829,109.2191", vietnameseName: "Quy Nhơn" },
  {
    name: "Thai Binh",
    coords: "20.4380,106.3370",
    vietnameseName: "Thái Bình",
  },
  { name: "Vinh", coords: "18.6796,105.6816", vietnameseName: "Vinh" },
  {
    name: "Thanh Hoa",
    coords: "19.8056,105.7769",
    vietnameseName: "Thanh Hóa",
  },
  {
    name: "Hai Duong",
    coords: "20.9336,106.3130",
    vietnameseName: "Hải Dương",
  },
  {
    name: "Phan Thiet",
    coords: "10.9330,108.0969",
    vietnameseName: "Phan Thiết",
  },
  { name: "Tra Vinh", coords: "9.7461,106.3586", vietnameseName: "Trà Vinh" },
  { name: "Soc Trang", coords: "9.6042,105.9730", vietnameseName: "Sóc Trăng" },
  { name: "Rach Gia", coords: "10.0158,105.0825", vietnameseName: "Rạch Giá" },
  { name: "Ha Tinh", coords: "18.3432,105.9056", vietnameseName: "Hà Tĩnh" },
  {
    name: "Long Xuyen",
    coords: "10.3740,105.4325",
    vietnameseName: "Long Xuyên",
  },
  {
    name: "Nam Can Tho",
    coords: "10.0452,105.7469",
    vietnameseName: "Cần Thơ",
  },
  { name: "Bac Lieu", coords: "9.2870,105.7210", vietnameseName: "Bạc Liêu" },
];

const overpassServers = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

type BusStation = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address: string;
  operator: string;
  busType: string;
  distance: number;
  phone?: string;
  website?: string;
  city?: string;
};

export default function FilteredBusStationsCarousel() {
  const [busStations, setBusStations] = useState<BusStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Ho Chi Minh City");
  const carouselRef = useRef<any>(null);
  const lastRequestTimeRef = useRef(0);

  const delay = useCallback(
    (ms: number) => new Promise((res) => setTimeout(res, ms)),
    []
  );

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchWithRetry = useCallback(
    async (query: string, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        for (const server of overpassServers) {
          try {
            const now = Date.now();
            const delta = now - lastRequestTimeRef.current;
            if (delta < 2000) await delay(2000 - delta);
            lastRequestTimeRef.current = Date.now();

            const res = await fetch(server, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: `data=${encodeURIComponent(query)}`,
            });

            if (res.status === 429) continue;
            if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
            return await res.json();
          } catch (err) {
            if (i === maxRetries - 1) throw err;
            await delay(Math.pow(2, i) * 1000);
          }
        }
      }
    },
    [delay]
  );

  const isQualityStation = (station: BusStation) => {
    const hasValidName =
      station.name &&
      station.name !== "Bến xe không tên" &&
      station.name.length > 5;
    const hasValidAddress = station.address && station.address.length > 10;
    const hasOperatorInfo = station.operator && station.operator.length > 2;
    return hasValidName && (hasValidAddress || hasOperatorInfo);
  };

  const fetchBusStations = useCallback(async () => {
    setLoading(true);
    try {
      const city = cities.find((c) => c.name === selectedCity);
      if (!city) throw new Error("Thành phố không hợp lệ");
      const [lat, lon] = city.coords.split(",");

      const query = `
      [out:json][timeout:30];
      (
        node["amenity"="bus_station"](around:50000,${lat},${lon});
        node["public_transport"="station"]["bus"="yes"](around:50000,${lat},${lon});
        relation["amenity"="bus_station"](around:50000,${lat},${lon});
        way["amenity"="bus_station"](around:50000,${lat},${lon});
      );
      out center meta tags;
      `;

      const data = await fetchWithRetry(query);

      const stations: BusStation[] = data.elements
        .map((el: any) => {
          const tags = el.tags || {};
          const lat_coord = el.lat || el.center?.lat;
          const lon_coord = el.lon || el.center?.lon;

          return {
            id: el.id.toString(),
            name:
              tags.name ||
              tags["name:vi"] ||
              tags["name:en"] ||
              "Bến xe không tên",
            lat: lat_coord,
            lon: lon_coord,
            address:
              [
                tags["addr:housenumber"],
                tags["addr:street"],
                tags["addr:district"] || tags["addr:suburb"],
                tags["addr:city"] || tags["addr:province"],
              ]
                .filter(Boolean)
                .join(", ") ||
              tags["addr:full"] ||
              "",
            operator: tags.operator || tags.network || tags.brand || "",
            busType: tags.bus || tags["public_transport"] || "yes",
            phone: tags.phone || tags["contact:phone"] || "",
            website: tags.website || tags["contact:website"] || "",
            city: city.vietnameseName,
            distance: calculateDistance(
              parseFloat(lat),
              parseFloat(lon),
              lat_coord,
              lon_coord
            ),
          };
        })
        .filter((s: BusStation) => s.lat && s.lon)
        .filter(isQualityStation)
        .sort((a: BusStation, b: BusStation) => a.distance - b.distance);

      setBusStations(stations.slice(0, 20));
    } catch (err: any) {
      console.error(err);
      setBusStations([]);
    } finally {
      setLoading(false);
    }
  }, [fetchWithRetry, selectedCity]);

  useEffect(() => {
    fetchBusStations();
  }, [selectedCity, fetchBusStations]);

  const chunkedStations = [];
  for (let i = 0; i < busStations.length; i += 4) {
    chunkedStations.push(busStations.slice(i, i + 4));
  }

  return (
    <div style={{ padding: 20, maxWidth: 1400, margin: "0 auto" }}>
      <Title
        level={2}
        style={{
          textAlign: "center",
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "#333",
          marginBottom: 16,
        }}
      >
        Bến xe phổ biến tại{" "}
        {selectedCity === "Ho Chi Minh City"
          ? "TP.HCM"
          : cities.find((c) => c.name === selectedCity)?.vietnameseName}
      </Title>

      <div style={{ textAlign: "end", marginBottom: 20 }}>
        <Select
          value={selectedCity}
          onChange={setSelectedCity}
          style={{ minWidth: 220 }}
        >
          {cities.map((c) => (
            <Option key={c.name} value={c.name}>
              {c.vietnameseName}
            </Option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          Đang tìm bến xe chất lượng...
        </div>
      ) : chunkedStations.length > 0 ? (
        <div style={{ position: "relative" }}>
          <Carousel
            ref={carouselRef}
            dots={false}
            autoplay={false}
            infinite={chunkedStations.length > 1}
          >
            {chunkedStations.map((stationGroup, groupIndex) => (
              <div key={groupIndex}>
                <Row
                  gutter={[16, 16]}
                  style={{ padding: "0 40px", margin: 20 }}
                >
                  {stationGroup.map((station) => (
                    <Col xs={24} sm={12} lg={6} key={station.id}>
                      <Card
                        title={station.name}
                        hoverable
                        style={{
                          height: "100%",
                          marginBottom: 10,
                        }}
                      >
                        <div style={{ textAlign: "center", marginBottom: 8 }}>
                          <img
                            src={Bus}
                            alt={station.name}
                            style={{
                              width: "100%",
                              height: 150,
                              objectFit: "contain",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            marginTop: 20,
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          <Button
                            type="default"
                            size="large"
                            icon={<EnvironmentOutlined />}
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps/search/?api=1&query=${station.lat},${station.lon}`,
                                "_blank"
                              )
                            }
                          >
                            Xem bản đồ
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </Carousel>

          {chunkedStations.length > 1 && (
            <>
              <Button
                icon={<LeftOutlined />}
                onClick={() => carouselRef.current?.prev()}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                  borderRadius: "50%",
                }}
              />
              <Button
                icon={<RightOutlined />}
                onClick={() => carouselRef.current?.next()}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 0,
                  transform: "translate(50%, -50%)",
                  zIndex: 10,
                  borderRadius: "50%",
                }}
              />
            </>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Không tìm thấy bến xe nổi tiếng nào trong khu vực này
          </Text>
        </div>
      )}
    </div>
  );
}
