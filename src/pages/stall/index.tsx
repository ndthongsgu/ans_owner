import {
  AppstoreAddOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Image,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  type TableColumnsType,
  Typography,
  message,
} from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_NEW_COVER_IMAGE } from "@/constants/stall.constants";
import type { StallResponse } from "@/dto/stall.dto";
import { useLoading } from "@/context/LoadingContext";
import { useToast } from "@/hooks/layout/useToast";
import { reverseGeocode } from "@/services/location.service";
import { formatCoordinates, normalizeCoordinate } from "@/utils/location.utils";
import { hourValueToString } from "@/utils/stall.utils";
import {
  useStalls,
  useCreateStall,
  useUpdateStall,
  useDeleteStall,
  useStallLimit,
} from "@/hooks/stall/index";
import StallAddModal, { type StallAddFormValues } from "./add";
import StallEditModal, { type StallEditSubmitValues } from "./edit/index";
import StallDetail from "./detail";
import { normalizeStallCoverImage } from "@/utils/stall.utils";
import "./index.css";

export default function StallPage() {
  const showToast = useToast();
  const { showLoading, hideLoading } = useLoading();
  const { data: stalls = [], isLoading } = useStalls();
  const { data: stallLimit, isLoading: isLoadingLimit } = useStallLimit();
  const createStallMutation = useCreateStall();
  const updateStallMutation = useUpdateStall();
  const deleteStallMutation = useDeleteStall();

  const [isAddStallModalOpen, setIsAddStallModalOpen] = useState(false);
  const [isEditStallModalOpen, setIsEditStallModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriceRange, setFilterPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [editingStall, setEditingStall] = useState<StallResponse | null>(null);
  const [detailStall, setDetailStall] = useState<StallResponse | null>(null);
  const [resolvedAddressByKey, setResolvedAddressByKey] = useState<
    Record<string, string>
  >({});
  const pendingAddressLookupRef = useRef<Set<string>>(new Set());
  const resolvedAddressByKeyRef = useRef<Record<string, string>>({});

  useEffect(() => {
    resolvedAddressByKeyRef.current = resolvedAddressByKey;
  }, [resolvedAddressByKey]);

  const getCoordinateKey = (stall: StallResponse): string | null => {
    if (
      typeof stall.latitude !== "number" ||
      !Number.isFinite(stall.latitude) ||
      typeof stall.longitude !== "number" ||
      !Number.isFinite(stall.longitude)
    ) {
      return null;
    }

    const lat = normalizeCoordinate(stall.latitude, 6);
    const lng = normalizeCoordinate(stall.longitude, 6);
    return `${lat},${lng}`;
  };

  const getStallAddress = useCallback(
    (stall: StallResponse) => {
      const location = (stall as unknown as { location?: string }).location;
      if (location && location.trim().length > 0) {
        return location;
      }

      const key = getCoordinateKey(stall);
      if (key && resolvedAddressByKey[key]) {
        return resolvedAddressByKey[key];
      }

      if (key) {
        const [lat, lng] = key.split(",").map((value) => Number(value));
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return formatCoordinates(lat, lng, 6);
        }
      }

      return "Chưa cập nhật địa chỉ";
    },
    [resolvedAddressByKey],
  );

  const getCoverImage = (stall: StallResponse) => {
    return normalizeStallCoverImage(stall.cover_image);
  };

  const getPriceRange = (stall: StallResponse) =>
    stall.price_range || "Chưa cập nhật";

  const getOpeningHours = (stall: StallResponse) => {
    try {
      return hourValueToString(stall.opening_hours);
    } catch {
      return "--:--";
    }
  };

  const getClosingHours = (stall: StallResponse) => {
    try {
      return hourValueToString(stall.close_hours);
    } catch {
      return "--:--";
    }
  };

  const closeAddStallModal = () => {
    setIsAddStallModalOpen(false);
  };

  const closeEditStallModal = () => {
    setIsEditStallModalOpen(false);
    setEditingStall(null);
  };

  const closeDetailStallModal = () => {
    setIsDetailModalOpen(false);
    setDetailStall(null);
  };

  const handleKnownUpsertError = (error: unknown) => {
    if (
      error instanceof Error &&
      error.message === "missing-location-coordinates"
    ) {
      showToast({
        type: "warning",
        title: "Thiếu tọa độ",
        message: "Thiếu tọa độ vị trí. Vui lòng nhập hoặc chọn trên bản đồ",
      });
      return true;
    }

    if (error instanceof Error && error.message === "invalid-hour-format") {
      showToast({
        type: "warning",
        title: "Sai định dạng giờ",
        message: "Giờ mở/đóng cửa phải đúng định dạng HH:mm",
      });
      return true;
    }

    if (
      error instanceof Error &&
      error.message === "invalid-operating-hours-order"
    ) {
      showToast({
        type: "warning",
        title: "Giờ hoạt động chưa hợp lệ",
        message: "Giờ đóng cửa phải sau giờ mở cửa và không được bằng nhau",
      });
      return true;
    }

    if (
      error &&
      typeof error === "object" &&
      "errorFields" in error &&
      Array.isArray(error.errorFields) &&
      error.errorFields.length > 0
    ) {
      showToast({
        type: "warning",
        title: "Thiếu thông tin",
        message: "Vui lòng điền đầy đủ thông tin cần thiết",
      });
      return true;
    }

    return false;
  };

  const resolveCoordinatesForPayload = (values: {
    latitude?: number;
    longitude?: number;
  }) => {
    const currentLat = values.latitude;
    const currentLng = values.longitude;

    if (
      typeof currentLat === "number" &&
      Number.isFinite(currentLat) &&
      typeof currentLng === "number" &&
      Number.isFinite(currentLng)
    ) {
      return {
        latitude: Number(currentLat.toFixed(6)),
        longitude: Number(currentLng.toFixed(6)),
      };
    }

    throw new Error("missing-location-coordinates");
  };

  const ensureOperatingHoursOrder = (
    opening_hours: unknown,
    close_hours: unknown,
  ) => {
    const openingText = hourValueToString(opening_hours);
    const closingText = hourValueToString(close_hours);

    if (closingText <= openingText) {
      throw new Error("invalid-operating-hours-order");
    }

    return { opening_hours: openingText, close_hours: closingText };
  };

  const filteredStalls = useMemo(() => {
    return stalls.filter((stall) => {
      const kw = keyword.trim().toLowerCase();
      const address = getStallAddress(stall).toLowerCase();
      const category = stall.category || "";
      const price_range = getPriceRange(stall);
      const matchedKeyword =
        !kw ||
        stall.stall_name.toLowerCase().includes(kw) ||
        address.includes(kw);
      const matchedCategory =
        filterCategory === "all" || category === filterCategory;
      const matchedPrice =
        filterPriceRange === "all" || price_range === filterPriceRange;

      return matchedKeyword && matchedCategory && matchedPrice;
    });
  }, [filterCategory, filterPriceRange, getStallAddress, keyword, stalls]);

  const totalCategories = useMemo(
    () =>
      new Set(
        stalls.map((stall) => (stall.category || "").trim()).filter(Boolean),
      ).size,
    [stalls],
  );

  const visibleStalls = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredStalls.slice(start, end);
  }, [currentPage, filteredStalls, pageSize]);

  useEffect(() => {
    const uniqueCandidatesByKey = new Map<
      string,
      { lat: number; lng: number }
    >();

    visibleStalls.forEach((stall) => {
      const location = (stall as unknown as { location?: string }).location;
      const key = getCoordinateKey(stall);

      if (!key || (location && location.trim().length > 0)) {
        return;
      }

      if (
        resolvedAddressByKeyRef.current[key] ||
        pendingAddressLookupRef.current.has(key)
      ) {
        return;
      }

      uniqueCandidatesByKey.set(key, {
        lat: stall.latitude as number,
        lng: stall.longitude as number,
      });
      pendingAddressLookupRef.current.add(key);
    });

    const candidates = Array.from(uniqueCandidatesByKey.entries()).map(
      ([key, coordinates]) => ({ key, ...coordinates }),
    );

    if (!candidates.length) {
      return;
    }

    let active = true;

    void Promise.all(
      candidates.map(async ({ key, lat, lng }) => {
        const address = await reverseGeocode(lat, lng);
        return { key, address };
      }),
    )
      .then((results) => {
        if (!active) {
          return;
        }

        setResolvedAddressByKey((prev) => {
          const next = { ...prev };
          results.forEach(({ key, address }) => {
            next[key] = address;
          });
          return next;
        });
      })
      .finally(() => {
        candidates.forEach(({ key }) => {
          pendingAddressLookupRef.current.delete(key);
        });
      });

    return () => {
      active = false;
    };
  }, [visibleStalls]);

  const categoryFilterOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        stalls.map((stall) => (stall.category || "").trim()).filter(Boolean),
      ),
    );

    return [
      { label: "Tất cả danh mục", value: "all" },
      ...categories.map((category) => ({ label: category, value: category })),
    ];
  }, [stalls]);

  const priceFilterOptions = useMemo(() => {
    const prices = Array.from(
      new Set(
        stalls.map((stall) => getPriceRange(stall).trim()).filter(Boolean),
      ),
    );

    return [
      { label: "Tất cả mức giá", value: "all" },
      ...prices.map((price) => ({ label: price, value: price })),
    ];
  }, [stalls]);

  const currentStalls = stallLimit?.current_stalls ?? stalls.length;
  const maxStalls = stallLimit?.max_stalls;
  const remainingStalls = stallLimit?.remaining_stalls ?? null;
  const hasStallLimit =
    typeof maxStalls === "number" &&
    Number.isFinite(maxStalls) &&
    maxStalls > 0;
  const reachedStallLimit =
    hasStallLimit &&
    (typeof remainingStalls === "number"
      ? remainingStalls <= 0
      : currentStalls >= maxStalls);

  const occupancyPercent = useMemo(() => {
    if (!hasStallLimit || !maxStalls) {
      return null;
    }

    return Math.min(100, Math.round((currentStalls / maxStalls) * 100));
  }, [currentStalls, hasStallLimit, maxStalls]);

  const handleOpenAddStallModal = () => {
    if (isLoadingLimit) {
      showToast({
        type: "info",
        title: "Đang kiểm tra giới hạn quán",
        message:
          "Hệ thống đang tải số lượng quán khả dụng theo gói hiện tại. Vui lòng thử lại sau vài giây.",
      });
      return;
    }

    if (reachedStallLimit) {
      showToast({
        type: "warning",
        title: "Đã đạt giới hạn quán",
        message: `Gói hiện tại cho phép tối đa ${maxStalls} quán. Bạn đang có ${currentStalls} quán và còn ${remainingStalls ?? 0} lượt thêm. Vui lòng nâng cấp gói để thêm quán mới.`,
      });
      return;
    }

    setIsAddStallModalOpen(true);
  };

  const handleCreateStall = async (values: StallAddFormValues) => {
    try {
      const coordinates = resolveCoordinatesForPayload(values);
      const operatingHours = ensureOperatingHoursOrder(
        values.opening_hours,
        values.close_hours,
      );
      const normalizedPriceRange = String(values.price_range ?? "").trim();
      const payloadValues = { ...values };
      delete payloadValues.location;

      showLoading();
      try {
        await createStallMutation.mutateAsync({
          ...payloadValues,
          ...coordinates,
          opening_hours: operatingHours.opening_hours,
          close_hours: operatingHours.close_hours,
          cover_image: values.cover_image,
          price_range: normalizedPriceRange,
        });
      } finally {
        hideLoading();
      }
      setCurrentPage(1);
      closeAddStallModal();
      showToast({
        type: "success",
        title: "Thành công",
        message: "Đã thêm quán mới",
      });
    } catch (error) {
      if (!handleKnownUpsertError(error)) {
        showToast({
          type: "error",
          title: "Tạo quán thất bại",
          message: "Có lỗi xảy ra khi tạo quán. Vui lòng thử lại",
        });
      }
    }
  };

  const handleOpenEditStall = (stall: StallResponse) => {
    setEditingStall(stall);
    setIsEditStallModalOpen(true);
  };

  const handleUpdateStall = async (values: StallEditSubmitValues) => {
    try {
      if (!editingStall?.id) return;
      const coordinates = resolveCoordinatesForPayload(values);
      const operatingHours = ensureOperatingHoursOrder(
        values.opening_hours,
        values.close_hours,
      );
      const normalizedPriceRange = String(values.price_range ?? "").trim();

      await updateStallMutation.mutateAsync({
        ...values,
        ...coordinates,
        opening_hours: operatingHours.opening_hours,
        close_hours: operatingHours.close_hours,
        cover_image: values.cover_image,
        price_range: normalizedPriceRange,
        id: editingStall.id,
      });
      closeEditStallModal();
      showToast({
        type: "success",
        title: "Thành công",
        message: "Đã lưu thông tin quán",
      });
    } catch (error) {
      if (!handleKnownUpsertError(error)) {
        showToast({
          type: "error",
          title: "Cập nhật thất bại",
          message: "Có lỗi xảy ra khi cập nhật quán. Vui lòng thử lại",
        });
      }
    }
  };

  const handleDeleteStall = async (stallId: string) => {
    try {
      await deleteStallMutation.mutateAsync(stallId);
      message.success("Đã xóa quán");
    } catch {
      message.error("Không thể xóa quán. Vui lòng thử lại.");
    }
  };

  const handleOpenDetail = (stall: StallResponse) => {
    setDetailStall(stall);
    setIsDetailModalOpen(true);
  };

  const stallColumns: TableColumnsType<StallResponse> = [
    {
      title: "Thumbnail",
      dataIndex: "cover_image",
      key: "cover_image",
      width: 90,
      render: (_, record) => (
        <Image
          src={getCoverImage(record)}
          fallback={DEFAULT_NEW_COVER_IMAGE}
          alt={record.cover_image}
          className="stall-table-thumbnail"
          preview={false}
        />
      ),
    },
    {
      title: "Tên quán",
      dataIndex: "stall_name",
      key: "stall_name",
      width: 180,
      render: (stall_name: string) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{stall_name}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (value: string) => <Typography.Text>{value}</Typography.Text>,
    },
    {
      title: "Mức giá",
      dataIndex: "price_range",
      key: "price_range",
      width: 120,
      render: (_, record) => (
        <Typography.Text>{getPriceRange(record)}</Typography.Text>
      ),
    },
    {
      title: "Giờ hoạt động",
      key: "operatingHours",
      width: 150,
      render: (_, record) => (
        <Typography.Text>
          {getOpeningHours(record)} - {getClosingHours(record)}
        </Typography.Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 300,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleOpenDetail(record)}
          >
            Xem chi tiết
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditStall(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa quán"
            description="Bạn có chắc chắn muốn xóa quán này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDeleteStall(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" className="stall-page-wrap">
      <section className="stall-hero">
        <div className="stall-hero-content">
          <Typography.Text className="stall-hero-kicker">
            Owner Control Center
          </Typography.Text>
          <Typography.Title level={2} className="stall-hero-title">
            Tăng doanh thu bằng dashboard quản lý quán trực quan
          </Typography.Title>
          <Typography.Paragraph className="stall-hero-description">
            Một màn hình duy nhất để theo dõi danh mục, cập nhật quán, kiểm soát
            giới hạn gói và ra quyết định nhanh theo dữ liệu thời gian thực.
          </Typography.Paragraph>
          <Space wrap className="stall-hero-badges">
            <span className="stall-hero-badge">Realtime quản lý quán</span>
            <span className="stall-hero-badge">Chỉnh sửa siêu nhanh</span>
            <span className="stall-hero-badge">Tối ưu cho mobile</span>
          </Space>
          <Space wrap>
            <Button
              size="large"
              type={reachedStallLimit ? "default" : "primary"}
              danger={reachedStallLimit}
              disabled={reachedStallLimit}
              icon={<AppstoreAddOutlined />}
              onClick={handleOpenAddStallModal}
            >
              Thêm quán mới
            </Button>
            {hasStallLimit ? (
              <Typography.Text
                className="stall-hero-limit"
                type={reachedStallLimit ? "danger" : "secondary"}
              >
                Đã dùng {currentStalls}/{maxStalls} quán, còn{" "}
                {remainingStalls ?? 0}
              </Typography.Text>
            ) : null}
          </Space>
        </div>
      </section>

      <Row gutter={[16, 16]} className="stall-kpi-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stall-kpi-card">
            <Typography.Text type="secondary">Tổng quán</Typography.Text>
            <Typography.Title level={3} className="stall-kpi-value">
              {stalls.length}
            </Typography.Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stall-kpi-card">
            <Typography.Text type="secondary">
              Hiển thị hiện tại
            </Typography.Text>
            <Typography.Title level={3} className="stall-kpi-value">
              {filteredStalls.length}
            </Typography.Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stall-kpi-card">
            <Typography.Text type="secondary">Danh mục</Typography.Text>
            <Typography.Title level={3} className="stall-kpi-value">
              {totalCategories}
            </Typography.Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stall-kpi-card">
            <Typography.Text type="secondary">Có thể thêm</Typography.Text>
            <Typography.Title level={3} className="stall-kpi-value">
              {hasStallLimit ? (remainingStalls ?? 0) : "-"}
            </Typography.Title>
            {occupancyPercent !== null ? (
              <Typography.Text className="stall-kpi-subtext" type="secondary">
                Dung lượng gói đã dùng {occupancyPercent}%
              </Typography.Text>
            ) : null}
          </Card>
        </Col>
      </Row>

      <Card className="stall-panel-card">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} lg={10}>
            <Input
              size="large"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              prefix={<SearchOutlined />}
              placeholder="Tìm theo tên quán hoặc tọa độ"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={7}>
            <Select
              size="large"
              value={filterCategory}
              options={categoryFilterOptions}
              onChange={(value) => {
                setFilterCategory(value);
                setCurrentPage(1);
              }}
              suffixIcon={<FilterOutlined />}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} lg={7}>
            <Select
              size="large"
              value={filterPriceRange}
              options={priceFilterOptions}
              onChange={(value) => {
                setFilterPriceRange(value);
                setCurrentPage(1);
              }}
              suffixIcon={<FilterOutlined />}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
      </Card>

      <Card className="stall-panel-card stall-table-panel">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 7 }} />
        ) : (
          <Table
            className="stall-list-table"
            rowKey="id"
            columns={stallColumns}
            dataSource={filteredStalls}
            size="middle"
            scroll={{ x: 980 }}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize,
              total: filteredStalls.length,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "50", "100"],
              showTotal: (total) => `Tổng cộng ${total} quán`,
              responsive: true,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            locale={{
              emptyText: (
                <div className="stall-empty-state">
                  <Typography.Text strong>
                    Chưa có quán phù hợp bộ lọc
                  </Typography.Text>
                  <Typography.Paragraph type="secondary">
                    Thử đổi danh mục, mức giá hoặc tạo quán mới để bắt đầu.
                  </Typography.Paragraph>
                </div>
              ),
            }}
          />
        )}
      </Card>
      <StallAddModal
        open={isAddStallModalOpen}
        onCancel={closeAddStallModal}
        onSubmit={handleCreateStall}
        submitting={createStallMutation.isPending}
      />
      <StallEditModal
        open={isEditStallModalOpen}
        stall={editingStall}
        onCancel={closeEditStallModal}
        onSubmit={handleUpdateStall}
        submitting={updateStallMutation.isPending}
      />
      <Modal
        title="Chi tiết quán"
        open={isDetailModalOpen}
        onCancel={closeDetailStallModal}
        footer={null}
      >
        {detailStall ? (
          <StallDetail
            stall={detailStall}
            getStallAddress={getStallAddress}
            getPriceRange={getPriceRange}
            getOpeningHours={getOpeningHours}
            getClosingHours={getClosingHours}
          />
        ) : null}
      </Modal>
    </Space>
  );
}
