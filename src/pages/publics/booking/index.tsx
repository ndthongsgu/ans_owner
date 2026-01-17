import BusCard from "@/components/bus-card";
import SearchPanel from "@/components/search-panel/SearchPanel";
import type { Bus, TripUserQuery, TripUserResponse } from "@/dto/trip.dto";
import { useBookingSelectionStore } from "@/hooks/booking/useBookingSelection";
import { useToast } from "@/hooks/layout/useToast";
import { useSearchTrips } from "@/hooks/trip";
import rootApiService from "@/services/api.service";
import { DeleteOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Pagination,
  Row,
  Select,
  Slider,
  Spin,
  message,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

const { Option } = Select;

const mapTripCarToBus = (trip: TripUserResponse, tripCar: any): Bus => {
  return {
    isCanView: true,
    isCanEdit: false,
    isCanDeactivate: false,
    isCanActivate: false,
    isCanCreate: false,
    isCanImport: false,
    isCanExport: false,
    id: tripCar.id,
    route: trip.route
      ? {
          isCanView: true,
          isCanEdit: false,
          isCanDeactivate: false,
          isCanActivate: false,
          isCanCreate: false,
          isCanImport: false,
          isCanExport: false,
          id: trip.route.id,
          startLocation: trip.route.startLocation,
          endLocation: trip.route.endLocation,
          distanceKm: (trip.route as any)?.distanceKm || 0,
          estimatedDuration: trip.route.estimatedDuration ?? 0,
          createdDate: "",
          updatedDate: "",
          isDeleted: false,
        }
      : {
          isCanView: true,
          isCanEdit: false,
          isCanDeactivate: false,
          isCanActivate: false,
          isCanCreate: false,
          isCanImport: false,
          isCanExport: false,
          id: "",
          startLocation: "",
          endLocation: "",
          distanceKm: 0,
          estimatedDuration: 0,
          createdDate: "",
          updatedDate: "",
          isDeleted: false,
        },
    departureTime: trip.departureTime,
    price: tripCar.price || trip.price,
    availableSeats: tripCar.availableSeats ?? null,
    tripStops: (trip as any).tripStops || [],
    tripCars: [
      {
        isCanView: true,
        isCanEdit: false,
        isCanDeactivate: false,
        isCanActivate: false,
        isCanCreate: false,
        isCanImport: false,
        isCanExport: false,
        id: tripCar.id,
        tripId: tripCar.tripId,
        carId: tripCar.carId || "",
        car: tripCar.car || {
          isCanView: true,
          isCanEdit: false,
          isCanDeactivate: false,
          isCanActivate: false,
          isCanCreate: false,
          isCanImport: false,
          isCanExport: false,
          id: tripCar.id,
          code: "",
          carType: {
            isCanView: true,
            isCanEdit: false,
            isCanDeactivate: false,
            isCanActivate: false,
            isCanCreate: false,
            isCanImport: false,
            isCanExport: false,
            id: "",
            code: "",
            name: tripCar.carType || "Xe",
            description: "",
            seatCount: tripCar.seatCount ?? 0,
            createdDate: "",
            updatedDate: "",
            isDeleted: false,
          },
          licensePlate: "",
          carSeats: [],
          createdDate: "",
          updatedDate: "",
          isDeleted: false,
        },
        price: tripCar.price || trip.price,
        availableSeats: tripCar.availableSeats ?? null,
        createdDate: "",
        updatedDate: "",
        isDeleted: false,
      },
    ],
    createdDate: "",
    updatedDate: "",
    isDeleted: false,
  };
};

interface FilterSidebarProps {
  filters: TripFilters;
  onChange: (filters: TripFilters) => void;
}

interface TripFilters {
  priceRange: [number, number];
  departureTime: string[];
  carTypes: string[];
}

const defaultFilters: TripFilters = {
  priceRange: [100000, 3000000],
  departureTime: [],
  carTypes: [],
};

function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const updateFilters = (key: keyof TripFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Bộ lọc</span>
          <Button
            type="text"
            danger
            icon={
              <DeleteOutlined style={{ color: "red", fontWeight: "bold" }} />
            }
            onClick={() => onChange(defaultFilters)}
          >
            <span style={{ color: "red", fontWeight: "normal" }}>
              Xóa bộ lọc
            </span>
          </Button>
        </div>
      }
      style={{ borderRadius: 12, position: "sticky", top: 20 }}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Khoảng giá</span>
          <span style={{ fontWeight: 500 }}>
            {filters.priceRange[0].toLocaleString()}đ -{" "}
            {filters.priceRange[1].toLocaleString()}đ
          </span>
        </div>
        <Slider
          range
          min={100000}
          max={3000000}
          step={10000}
          tooltip={{ formatter: (value) => `${value?.toLocaleString()}đ` }}
          value={filters.priceRange}
          onChange={(value) => updateFilters("priceRange", value)}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}>Giờ khởi hành</div>
        <Checkbox.Group
          value={filters.departureTime}
          onChange={(value) => updateFilters("departureTime", value)}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          <Checkbox value="morning">Sáng sớm (00:00 - 06:00)</Checkbox>
          <Checkbox value="afternoon">Buổi sáng (06:00 - 12:00)</Checkbox>
          <Checkbox value="evening">Buổi chiều (12:00 - 18:00)</Checkbox>
          <Checkbox value="night">Buổi tối (18:00 - 00:00)</Checkbox>
        </Checkbox.Group>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}>Loại xe</div>
        <Checkbox.Group
          value={filters.carTypes}
          onChange={(value) => updateFilters("carTypes", value)}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          <Checkbox value="limousine">Limousine</Checkbox>
          <Checkbox value="sleeper">Giường nằm</Checkbox>
          <Checkbox value="seat">Ghế ngồi</Checkbox>
        </Checkbox.Group>
      </div>
    </Card>
  );
}

const isTimeInRange = (time: string, ranges: string[]): boolean => {
  if (ranges.length === 0) return true;

  const hour = dayjs(time).hour();

  return ranges.some((range) => {
    switch (range) {
      case "morning":
        return hour >= 0 && hour < 6;
      case "afternoon":
        return hour >= 6 && hour < 12;
      case "evening":
        return hour >= 12 && hour < 18;
      case "night":
        return hour >= 18 && hour < 24;
      default:
        return false;
    }
  });
};

export default function BookingScreen() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const showToast = useToast();
  const searchTripsMutation = useSearchTrips();
  const clearSelection = useBookingSelectionStore((s) => s.clearSelection);

  const [trips, setTrips] = useState<TripUserResponse[]>([]);
  const [filters, setFilters] = useState<TripFilters>(defaultFilters);
  const [sortOrder, setSortOrder] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [currentSearchData, setCurrentSearchData] = useState<any>(null);

  // Dùng ref để track việc đã search từ navigation hay chưa
  const hasSearchedFromNavigation = useRef(false);

  // Lấy search data từ navigation state
  const navigationState = location.state as {
    from?: string;
    to?: string;
    departure?: dayjs.Dayjs | string;
    ticketCount?: number;
  } | null;

  const cars = trips.flatMap(
    (trip) =>
      trip.tripCars?.map((tripCar) => ({
        trip,
        tripCar,
        bus: mapTripCarToBus(trip, tripCar),
      })) || []
  );

  const filteredCars = cars.filter(({ bus, trip, tripCar }) => {
    const priceInRange =
      trip.price >= filters.priceRange[0] &&
      trip.price <= filters.priceRange[1];

    const timeInRange = isTimeInRange(bus.departureTime, filters.departureTime);

    const carTypeMatches =
      filters.carTypes.length === 0 ||
      filters.carTypes.some((filter) => {
        const carTypeName =
          (tripCar as any).car?.carType?.name?.toLowerCase() ||
          (tripCar as any).carType?.toLowerCase() ||
          "";
        switch (filter) {
          case "limousine":
            return carTypeName.includes("limousine");
          case "sleeper":
            return (
              carTypeName.includes("giường") || carTypeName.includes("nằm")
            );
          case "seat":
            return carTypeName.includes("ghế") || carTypeName.includes("ngồi");
          default:
            return false;
        }
      });

    return priceInRange && timeInRange && carTypeMatches;
  });

  const sortedCars = [...filteredCars].sort((a, b) => {
    switch (sortOrder) {
      case "price-asc":
        return a.trip.price - b.trip.price;
      case "price-desc":
        return b.trip.price - a.trip.price;
      case "departure-asc":
        return (
          dayjs(a.bus.departureTime).unix() - dayjs(b.bus.departureTime).unix()
        );
      case "departure-desc":
        return (
          dayjs(b.bus.departureTime).unix() - dayjs(a.bus.departureTime).unix()
        );
      default:
        return 0;
    }
  });

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageCars = sortedCars.slice(startIndex, endIndex);

  const handleSearch = useCallback(
    async (searchData: {
      from: string;
      to: string;
      departure: dayjs.Dayjs | null;
      ticketCount: number;
    }) => {
      showToast({
        title: "Đang tìm kiếm",
        message: "Vui lòng chờ...",
        type: "info",
      });

      try {
        const query: TripUserQuery = {
          startLocation: searchData.from,
          endLocation: searchData.to,
          numberOfSeats: searchData.ticketCount || undefined,
          departureTime: searchData.departure
            ? dayjs(searchData.departure).format("YYYY-MM-DDTHH:mm:ss")
            : undefined,
        };

        const result = await searchTripsMutation.mutateAsync(query);

        setTrips(result || []);
        setCurrentPage(1);
        setCurrentSearchData(searchData);

        const totalCars = (result || []).reduce(
          (sum, trip) => sum + (trip.tripCars?.length || 0),
          0
        );

        if (totalCars === 0) {
          showToast({
            title: "Thông báo",
            message: "Không tìm thấy xe nào phù hợp",
            type: "warning",
          });
        } else {
          showToast({
            title: "Thành công",
            message: `Tìm thấy ${totalCars} xe từ ${result.length} chuyến`,
            type: "success",
          });
        }
      } catch (error: any) {
        console.error("Search error:", error);

        showToast({
          title: "Lỗi",
          message: error?.message || "Có lỗi khi tìm chuyến xe",
          type: "error",
        });
      }
    },
    [searchTripsMutation, showToast]
  );

  // Tạo một key unique cho navigation state để detect changes
  const navigationKey = navigationState
    ? `${navigationState.from}-${navigationState.to}-${navigationState.ticketCount}`
    : null;

  // Handle VNPay payment cancellation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cancelled = params.get("cancelled");
    const orderId = params.get("orderId");
    const code = params.get("code");

    if (cancelled === "true" && orderId) {
      const handleCancelledPayment = async () => {
        try {
          const key = `vn_booking_${orderId}`;
          const payloadRaw = localStorage.getItem(key);

          if (payloadRaw) {
            const bookingMeta = JSON.parse(payloadRaw) as {
              bookingId: string;
              bookingCode: string;
              customerName: string;
              customerPhone: string;
            };

            // Cancel the booking
            await rootApiService.post<unknown>(
              `/user/bookings/cancel-guest/${bookingMeta.bookingId}`
            );

            // Clean up localStorage
            localStorage.removeItem(key);

            // Clear selection
            clearSelection();

            // Show message
            const reason =
              code === "24"
                ? "Bạn đã hủy giao dịch tại VNPay."
                : `Thanh toán không thành công (mã: ${code || "N/A"}).`;
            message.error(reason + " Vé đã được hủy.");
          } else {
            message.warning("Đã hủy thanh toán VNPay. Vui lòng đặt vé lại.");
          }
        } catch (error) {
          console.error("Error handling cancelled payment:", error);
          message.error(
            "Có lỗi khi xử lý việc hủy thanh toán. Vui lòng thử lại."
          );
        }

        // Clean up URL params
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      };

      handleCancelledPayment();
    }
  }, [location.search, clearSelection]);

  // AUTO SEARCH khi có navigation state - SỬ DỤNG navigationKey
  useEffect(() => {
    // Không có navigation state
    if (!navigationKey || !navigationState) {
      return;
    }

    // Kiểm tra đã search chưa
    if (hasSearchedFromNavigation.current) {
      return;
    }

    // Đánh dấu đã search
    hasSearchedFromNavigation.current = true;

    // Chuyển đổi departure
    let departure: dayjs.Dayjs | null = null;
    if (navigationState.departure) {
      try {
        const dateValue =
          (navigationState.departure as any).$d ||
          (navigationState.departure as any);
        departure = dayjs(dateValue);
      } catch (error) {
        console.error("Error parsing departure date:", error);
      }
    }

    // Gọi search
    const searchData = {
      from: navigationState.from || "",
      to: navigationState.to || "",
      departure,
      ticketCount: navigationState.ticketCount || 1,
    };

    if (searchData.from && searchData.to) {
      // Gọi search trong setTimeout để tránh race condition
      setTimeout(() => {
        handleSearch(searchData);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationKey]); // CHỈ phụ thuộc vào navigationKey

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 50 }}>
          <SearchPanel
            defaultValues={currentSearchData || navigationState || undefined}
            onSearch={handleSearch}
            loading={searchTripsMutation.isPending}
          />
        </div>

        <Row gutter={24}>
          <Col xs={24} lg={8}>
            <FilterSidebar filters={filters} onChange={setFilters} />
          </Col>
          <Col xs={24} lg={16}>
            {searchTripsMutation.isPending ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Đang tìm kiếm chuyến xe...</div>
              </div>
            ) : searchTripsMutation.isError ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <Alert
                  message="Có lỗi xảy ra"
                  description="Không thể tải danh sách chuyến xe"
                  type="error"
                  showIcon
                />
              </div>
            ) : filteredCars.length > 0 ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div>Tìm thấy {filteredCars.length} xe</div>
                  <Select
                    value={sortOrder}
                    style={{ width: 220 }}
                    onChange={(value) => setSortOrder(value)}
                    placeholder="Sắp xếp kết quả"
                  >
                    <Option value="">Mặc định</Option>
                    <Option value="price-asc">Giá tăng dần</Option>
                    <Option value="price-desc">Giá giảm dần</Option>
                    <Option value="departure-asc">Chuyến sớm nhất</Option>
                    <Option value="departure-desc">Chuyến muộn nhất</Option>
                  </Select>
                </div>

                {currentPageCars.map(({ bus }, index) => (
                  <BusCard key={`${bus.id}-${index}`} bus={bus} />
                ))}

                {filteredCars.length > pageSize && (
                  <div style={{ textAlign: "center", marginTop: 24 }}>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredCars.length}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} của ${total} xe`
                      }
                    />
                  </div>
                )}
              </>
            ) : trips.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                Nhập thông tin tìm kiếm để xem kết quả
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 60 }}>
                Không tìm thấy xe nào phù hợp với tiêu chí tìm kiếm
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
