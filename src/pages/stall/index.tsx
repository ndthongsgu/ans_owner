import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Image,
  Input,
  Modal,
  Popconfirm,
  Row,
  Skeleton,
  Select,
  Skeleton,
  Space,
  Table,
  Tooltip,
  type TableColumnsType,
  Typography,
  message,
} from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Pencil, Search, Trash2, Plus } from "lucide-react";
import API_ENDPOINTS from "@/services/api-route";
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
import { useQueryClient } from "@tanstack/react-query";

export default function StallPage() {
  const showToast = useToast();
  const { showLoading, hideLoading } = useLoading();
  const { data: stalls = [], isLoading } = useStalls();
  const { data: stallLimit, isLoading: isLoadingLimit } = useStallLimit();
  const createStallMutation = useCreateStall();
  const updateStallMutation = useUpdateStall();
  const deleteStallMutation = useDeleteStall();
  const queryClient = useQueryClient();

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
      // Invalidate stall content queries to reset data in stall-content page
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.OWNER.STALL_CONTENT.AVAILABLE_STALLS],
      });
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
      title: "Ảnh",
      dataIndex: "cover_image",
      key: "cover_image",
      width: 80,
      render: (_, record) => (
        <Image
          src={getCoverImage(record)}
          fallback={DEFAULT_NEW_COVER_IMAGE}
          alt={record.cover_image || "Cover"}
          className="stall-table-thumbnail"
          preview
          style={{ cursor: "pointer" }}
        />
      ),
    },
    {
      title: "Tên quán",
      dataIndex: "stall_name",
      key: "stall_name",
      width: 180,
      render: (stall_name: string) => (
        <Tooltip title={stall_name}>
          <Typography.Text strong ellipsis>
            {stall_name}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 110,
      responsive: ["md"],
      render: (value: string) => (
        <Tooltip title={value}>
          <Typography.Text ellipsis>{value}</Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: "Mức giá",
      dataIndex: "price_range",
      key: "price_range",
      width: 100,
      responsive: ["md"],
      render: (_, record) => (
        <Typography.Text type="success" strong>
          {getPriceRange(record)}
        </Typography.Text>
      ),
    },
    {
      title: "Giờ hoạt động",
      key: "operatingHours",
      width: 130,
      responsive: ["xl"],
      render: (_, record) => (
        <Tooltip
          title={`Mở: ${getOpeningHours(record)} - Đóng: ${getClosingHours(record)}`}
        >
          <Typography.Text type="secondary">
            {getOpeningHours(record)} - {getClosingHours(record)}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size={4} className="stall-content-action-buttons">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              className="stall-action-btn"
              icon={<Eye size={16} />}
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              className="stall-action-btn"
              icon={<Pencil size={16} />}
              onClick={() => handleOpenEditStall(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa quán"
              description="Bạn có chắc chắn muốn xóa quán này?"
              okText="Xóa"
              okType="danger"
              cancelText="Hủy"
              onConfirm={() => handleDeleteStall(record.id)}
            >
              <Button
                type="text"
                size="small"
                className="stall-action-btn"
                danger
                icon={<Trash2 size={16} />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="stall-page-wrap stall-dashboard-theme">
      <main className="stall-dashboard-main">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="stall-header-card">
            <div>
              <h1 className="stall-header-title">Quản lý quán ăn</h1>
              <p className="stall-header-subtitle">
                Giao diện tinh gọn, ưu tiên nội dung chính và dễ thao tác hơn.
              </p>
            </div>
            {hasStallLimit && (
              <div className="stall-stats-container">
                <div className="stall-stat-card">
                  <div className="stall-stat-label">Tổng quán</div>
                  <div className="stall-stat-value">{currentStalls}</div>
                </div>
                <div className="stall-stat-card">
                  <div className="stall-stat-label">Giới hạn</div>
                  <div className="stall-stat-value">{maxStalls}</div>
                </div>
                <div className="stall-stat-card">
                  <div className="stall-stat-label">Còn lại</div>
                  <div className="stall-stat-value">{remainingStalls ?? 0}</div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <Card className="stall-filter-card">
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={10}>
              <Input
                size="large"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                prefix={<SearchOutlined />}
                suffix={<Search size={16} className="stall-input-icon" />}
                placeholder="Tìm theo tên quán hoặc tọa độ"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                size="large"
                value={filterCategory}
                options={categoryFilterOptions}
                onChange={(value) => {
                  setFilterCategory(value);
                  setCurrentPage(1);
                }}
                placeholder="Lọc danh mục"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                size="large"
                value={filterPriceRange}
                options={priceFilterOptions}
                onChange={(value) => {
                  setFilterPriceRange(value);
                  setCurrentPage(1);
                }}
                placeholder="Lọc mức giá"
              />
            </Col>
            <Col xs={24} md="auto" style={{ marginLeft: "auto" }}>
              <Button
                size="large"
                type={reachedStallLimit ? "default" : "primary"}
                danger={reachedStallLimit}
                disabled={reachedStallLimit}
                className="stall-primary-btn"
                icon={<Plus size={16} />}
                onClick={handleOpenAddStallModal}
              >
                Thêm quán
              </Button>
            </Col>
          </Row>
        </Card>

        <Card className="stall-list-card">
          {isLoading ? (
            <div className="stall-skeleton-wrap">
              <Skeleton active paragraph={{ rows: 2 }} />
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ) : (
            <Table
              className="stall-list-table stall-content-table"
              rowKey="id"
              columns={stallColumns}
              dataSource={filteredStalls}
              size="middle"
              scroll={{ x: 980 }}
              rowClassName={(_, index) =>
                index % 2 === 0
                  ? "dashboard-row-striped-even"
                  : "dashboard-row-striped-odd"
              }
              pagination={{
                current: currentPage,
                pageSize,
                total: filteredStalls.length,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trên ${total} quán`,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
              }}
            />
          )}
        </Card>
      </main>

      {/* Modals */}
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
        modalRender={(node) => (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22 }}
          >
            {node}
          </motion.div>
        )}
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
    </div>
  );
}
