import { useOwnerProfile } from "@/hooks/owner";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  PictureOutlined,
  ShopOutlined,
  TagsOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import type { UploadFile, UploadProps } from "antd";
import AddStoreModal from "./components/AddStoreModal";
import StoreFilters from "./components/StoreFilters";
import StoreList from "./components/StoreList";
import {
  categoryOptions,
  DEFAULT_MAIN_COVER_IMAGE,
  DEFAULT_NEW_COVER_IMAGE,
  priceOptions,
} from "./constants";
import type { StoreItem } from "./types";
import { makeId, toBase64 } from "./utils";
import "./index.css";

const { Title, Text } = Typography;

export default function StallPage() {
  const { data: profile } = useOwnerProfile();
  const owner = profile?.owner;
  const [form] = Form.useForm<StoreItem>();
  const [addStoreForm] = Form.useForm<StoreItem>();
  const detailRef = useRef<HTMLDivElement>(null);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriceRange, setFilterPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const defaultStore = useMemo<StoreItem[]>(() => {
    const name = owner?.business_name || "Quán của tôi";
    const location = owner?.business_address || "Chưa cập nhật địa chỉ";

    return [
      {
        id: "store-main",
        name,
        location,
        coverImage: DEFAULT_MAIN_COVER_IMAGE,
        openTime: "08:00",
        closeTime: "22:00",
        category: "Món Việt",
        priceRange: "Tầm trung",
      },
    ];
  }, [owner?.business_address, owner?.business_name]);

  const [stores, setStores] = useState<StoreItem[]>(() => defaultStore);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    () => defaultStore[0]?.id ?? "",
  );

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const kw = keyword.trim().toLowerCase();
      const matchedKeyword =
        !kw ||
        store.name.toLowerCase().includes(kw) ||
        store.location.toLowerCase().includes(kw);
      const matchedCategory =
        filterCategory === "all" || store.category === filterCategory;
      const matchedPrice =
        filterPriceRange === "all" || store.priceRange === filterPriceRange;

      return matchedKeyword && matchedCategory && matchedPrice;
    });
  }, [filterCategory, filterPriceRange, keyword, stores]);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / pageSize));
  const effectiveCurrentPage = Math.min(currentPage, totalPages);
  const effectiveSelectedStoreId = filteredStores.some(
    (store) => store.id === selectedStoreId,
  )
    ? selectedStoreId
    : (filteredStores[0]?.id ?? "");

  const paginatedStores = useMemo(() => {
    const start = (effectiveCurrentPage - 1) * pageSize;
    return filteredStores.slice(start, start + pageSize);
  }, [effectiveCurrentPage, filteredStores, pageSize]);

  const selectedStore = stores.find(
    (store) => store.id === effectiveSelectedStoreId,
  );
  const selectedVisibleStore = filteredStores.some(
    (store) => store.id === effectiveSelectedStoreId,
  );
  const watchedLocation = Form.useWatch("location", form);
  const watchedCoverImage = Form.useWatch("coverImage", form);
  const uploadFileList: UploadFile[] = watchedCoverImage
    ? [
        {
          uid: effectiveSelectedStoreId || "store-cover",
          name: "cover-image",
          status: "done",
          url: watchedCoverImage,
        },
      ]
    : [];
  const mapQuery = encodeURIComponent(
    (watchedLocation as string) || selectedStore?.location || "Việt Nam",
  );
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  useEffect(() => {
    if (selectedStore) {
      form.setFieldsValue(selectedStore);
    }
  }, [form, selectedStore]);

  const handleSelectStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleOpenAddStoreModal = () => {
    addStoreForm.setFieldsValue({
      name: `Quán mới ${stores.length + 1}`,
      location: "Chưa cập nhật địa chỉ",
      coverImage: DEFAULT_NEW_COVER_IMAGE,
      openTime: "09:00",
      closeTime: "21:00",
      category: "Món Việt",
      priceRange: "Tầm trung",
    });
    setIsAddStoreModalOpen(true);
  };

  const handleCreateStore = async () => {
    try {
      const values = await addStoreForm.validateFields();
      const nextStore: StoreItem = {
        ...values,
        id: makeId(),
        coverImage: values.coverImage || DEFAULT_NEW_COVER_IMAGE,
      };

      setStores((prev) => [nextStore, ...prev]);
      setSelectedStoreId(nextStore.id);
      setCurrentPage(1);
      setIsAddStoreModalOpen(false);
      addStoreForm.resetFields();
      message.success("Đã thêm quán mới");
    } catch {
      message.warning("Vui lòng điền đầy đủ thông tin quán mới");
    }
  };

  const handleSaveStore = (values: StoreItem) => {
    if (!effectiveSelectedStoreId) {
      message.warning("Vui lòng chọn quán cần chỉnh sửa");
      return;
    }

    setStores((prev) =>
      prev.map((item) =>
        item.id === effectiveSelectedStoreId
          ? {
              ...item,
              ...values,
              id: effectiveSelectedStoreId,
            }
          : item,
      ),
    );
    message.success("Đã lưu thông tin quán");
  };

  const handleUploadChange: UploadProps["onChange"] = async ({ file }) => {
    if (!file.originFileObj) return;

    try {
      const base64Image = await toBase64(file.originFileObj as File);
      form.setFieldValue("coverImage", base64Image);
      message.success("Đã tải ảnh bìa mới");
    } catch {
      message.error("Không thể đọc file ảnh, vui lòng thử lại");
    }
  };

  const totalStores = stores.length;
  const selectedStoreCategory = selectedStore?.category || "Chưa chọn";
  const selectedOperatingHours = selectedStore
    ? `${selectedStore.openTime} - ${selectedStore.closeTime}`
    : "Chưa có dữ liệu";

  return (
    <div className="owner-store-page">
      <Card className="owner-store-hero-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={14}>
            <div className="owner-store-hero-copy">
              <Text className="owner-store-eyebrow">Store Management</Text>
              <Title level={2} className="owner-store-hero-title">
                Quản lý quán ăn theo trải nghiệm trực quan hơn
              </Title>
              <Text className="owner-store-hero-subtitle">
                Lọc nhanh, duyệt danh sách theo phân trang và nhấn vào từng quán
                để mở form chi tiết ngay lập tức như các dashboard quản trị thực
                tế.
              </Text>
            </div>
          </Col>
          <Col xs={24} lg={10}>
            <div className="owner-store-highlight-grid">
              <div className="owner-store-highlight-card">
                <Text className="owner-store-highlight-label">
                  Tổng số quán
                </Text>
                <Title level={3}>{totalStores}</Title>
              </div>
              <div className="owner-store-highlight-card">
                <Text className="owner-store-highlight-label">
                  Đang hiển thị
                </Text>
                <Title level={3}>{filteredStores.length}</Title>
              </div>
              <div className="owner-store-highlight-card">
                <Text className="owner-store-highlight-label">
                  Danh mục hiện tại
                </Text>
                <Title level={4}>{selectedStoreCategory}</Title>
              </div>
              <div className="owner-store-highlight-card">
                <Text className="owner-store-highlight-label">
                  Giờ hoạt động
                </Text>
                <Title level={4}>{selectedOperatingHours}</Title>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <StoreFilters
            keyword={keyword}
            filterCategory={filterCategory}
            filterPriceRange={filterPriceRange}
            onKeywordChange={(value) => {
              setKeyword(value);
              setCurrentPage(1);
            }}
            onCategoryChange={(value) => {
              setFilterCategory(value);
              setCurrentPage(1);
            }}
            onPriceRangeChange={(value) => {
              setFilterPriceRange(value);
              setCurrentPage(1);
            }}
            onReset={() => {
              setKeyword("");
              setFilterCategory("all");
              setFilterPriceRange("all");
              setCurrentPage(1);
            }}
          />
        </Col>

        <Col xs={24} xl={10}>
          <StoreList
            filteredStores={filteredStores}
            paginatedStores={paginatedStores}
            effectiveSelectedStoreId={effectiveSelectedStoreId}
            effectiveCurrentPage={effectiveCurrentPage}
            pageSize={pageSize}
            onSelectStore={handleSelectStore}
            onOpenAddModal={handleOpenAddStoreModal}
            onPaginationChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        </Col>

        <Col xs={24} xl={14}>
          <div ref={detailRef}>
            <Card className="owner-store-detail-card">
              <div className="owner-store-detail-head">
                <div>
                  <Text className="owner-store-detail-caption">
                    Store Detail Form
                  </Text>
                  <Title level={4} className="owner-store-detail-title">
                    Thông tin chi tiết quán
                  </Title>
                </div>
                {selectedStore ? (
                  <Tag color="orange">Đang chỉnh sửa: {selectedStore.name}</Tag>
                ) : null}
              </div>

              {selectedStore && selectedVisibleStore ? (
                <Form form={form} layout="vertical" onFinish={handleSaveStore}>
                  <div className="owner-store-form-hero">
                    <img
                      src={watchedCoverImage || selectedStore.coverImage}
                      alt={selectedStore.name}
                      className="owner-store-form-hero-image"
                    />
                    <div className="owner-store-form-hero-content">
                      <Title level={4}>{selectedStore.name}</Title>
                      <Text type="secondary">{selectedStore.location}</Text>
                      <div className="owner-store-form-hero-tags">
                        <Tag color="gold">{selectedStore.priceRange}</Tag>
                        <Tag color="blue">{selectedStore.category}</Tag>
                        <Tag>
                          {selectedStore.openTime} - {selectedStore.closeTime}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  <div className="owner-store-section-title">
                    <ShopOutlined /> Thông tin cơ bản
                  </div>
                  <Form.Item
                    name="name"
                    label="Tên quán"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên quán" },
                    ]}
                  >
                    <Input size="large" placeholder="Ví dụ: Quán Ăn Gia Đình" />
                  </Form.Item>

                  <Form.Item
                    name="location"
                    label="Vị trí"
                    rules={[
                      { required: true, message: "Vui lòng nhập vị trí" },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<EnvironmentOutlined />}
                      placeholder="Ví dụ: 12 Nguyễn Huệ, Quận 1"
                    />
                  </Form.Item>

                  <div className="owner-store-map-tools">
                    <Text type="secondary">
                      Chọn vị trí trên Google Maps rồi copy địa chỉ vào ô Vị trí
                      để lưu chính xác.
                    </Text>
                    <Button
                      icon={<GlobalOutlined />}
                      onClick={() =>
                        window.open(
                          mapSearchUrl,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      Chọn vị trí với Google Maps
                    </Button>
                  </div>

                  <div className="owner-store-map-preview">
                    <iframe
                      title="Bản đồ vị trí quán"
                      src={mapEmbedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <Form.Item
                    name="coverImage"
                    label="Ảnh bìa"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng tải ảnh hoặc nhập URL",
                      },
                    ]}
                  >
                    <Upload
                      className="owner-store-upload"
                      listType="picture-card"
                      maxCount={1}
                      accept="image/*"
                      beforeUpload={() => false}
                      fileList={uploadFileList}
                      onChange={handleUploadChange}
                      onRemove={() => {
                        form.setFieldValue("coverImage", "");
                        return true;
                      }}
                    >
                      {!uploadFileList.length && (
                        <div>
                          <UploadOutlined />
                          <div className="owner-store-upload-text">Tải ảnh</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>

                  <Form.Item label="Hoặc dán URL ảnh (tuỳ chọn)">
                    <Input
                      size="large"
                      prefix={<PictureOutlined />}
                      placeholder="https://..."
                      value={watchedCoverImage}
                      onChange={(e) =>
                        form.setFieldValue("coverImage", e.target.value)
                      }
                    />
                  </Form.Item>

                  <div className="owner-store-cover-preview">
                    <img
                      src={watchedCoverImage || selectedStore.coverImage}
                      alt={selectedStore.name}
                    />
                  </div>

                  <Divider />

                  <div className="owner-store-section-title">
                    <ClockCircleOutlined /> Thời gian mở cửa
                  </div>
                  <Row gutter={12}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="openTime"
                        label="Giờ mở cửa"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập giờ mở cửa",
                          },
                        ]}
                      >
                        <Input size="large" placeholder="08:00" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="closeTime"
                        label="Giờ đóng cửa"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập giờ đóng cửa",
                          },
                        ]}
                      >
                        <Input size="large" placeholder="22:00" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <div className="owner-store-section-title">
                    <TagsOutlined /> Danh mục và mức giá
                  </div>
                  <Row gutter={12}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="category"
                        label="Danh mục"
                        rules={[
                          { required: true, message: "Vui lòng chọn danh mục" },
                        ]}
                      >
                        <Select size="large" options={categoryOptions} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="priceRange"
                        label="Mức giá"
                        rules={[
                          { required: true, message: "Vui lòng chọn mức giá" },
                        ]}
                      >
                        <Select size="large" options={priceOptions} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item className="owner-store-actions">
                    <Button type="primary" htmlType="submit" size="large">
                      Lưu thay đổi
                    </Button>
                  </Form.Item>
                </Form>
              ) : (
                <Empty description="Hãy chọn quán để quản lý" />
              )}
            </Card>
          </div>
        </Col>
      </Row>

      <AddStoreModal
        open={isAddStoreModalOpen}
        form={addStoreForm}
        onCancel={() => {
          setIsAddStoreModalOpen(false);
          addStoreForm.resetFields();
        }}
        onCreate={handleCreateStore}
      />
    </div>
  );
}
