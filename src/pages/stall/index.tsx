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
import AddStallModal from "@/components/stall/AddStallModal";
import StallFilters from "@/components/stall/StallFilters";
import StallList from "@/components/stall/StallList";
import {
  categoryOptions,
  DEFAULT_MAIN_COVER_IMAGE,
  DEFAULT_NEW_COVER_IMAGE,
  priceOptions,
} from "@/constants/stall.constants";
import type { StallItem } from "@/dto/stall.dto";
import { makeId, toBase64 } from "@/utils/stall.utils";
import "./index.css";

const { Title, Text } = Typography;

export default function StallPage() {
  const { data: profile } = useOwnerProfile();
  const owner = profile?.owner;
  const [form] = Form.useForm<StallItem>();
  const [addStallForm] = Form.useForm<StallItem>();
  const detailRef = useRef<HTMLDivElement>(null);
  const [isAddStallModalOpen, setIsAddStallModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriceRange, setFilterPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const defaultStall = useMemo<StallItem[]>(() => {
    const name = owner?.business_name || "Quán của tôi";
    const location = owner?.business_address || "Chưa cập nhật địa chỉ";

    return [
      {
        id: "stall-main",
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

  const [stalls, setStalls] = useState<StallItem[]>(() => defaultStall);
  const [selectedStallId, setSelectedStallId] = useState<string>(
    () => defaultStall[0]?.id ?? "",
  );

  const filteredStalls = useMemo(() => {
    return stalls.filter((stall) => {
      const kw = keyword.trim().toLowerCase();
      const matchedKeyword =
        !kw ||
        stall.name.toLowerCase().includes(kw) ||
        stall.location.toLowerCase().includes(kw);
      const matchedCategory =
        filterCategory === "all" || stall.category === filterCategory;
      const matchedPrice =
        filterPriceRange === "all" || stall.priceRange === filterPriceRange;

      return matchedKeyword && matchedCategory && matchedPrice;
    });
  }, [filterCategory, filterPriceRange, keyword, stalls]);

  const totalPages = Math.max(1, Math.ceil(filteredStalls.length / pageSize));
  const effectiveCurrentPage = Math.min(currentPage, totalPages);
  const effectiveSelectedStallId = filteredStalls.some(
    (stall) => stall.id === selectedStallId,
  )
    ? selectedStallId
    : (filteredStalls[0]?.id ?? "");

  const paginatedStalls = useMemo(() => {
    const start = (effectiveCurrentPage - 1) * pageSize;
    return filteredStalls.slice(start, start + pageSize);
  }, [effectiveCurrentPage, filteredStalls, pageSize]);

  const selectedStall = stalls.find(
    (stall) => stall.id === effectiveSelectedStallId,
  );
  const selectedVisibleStall = filteredStalls.some(
    (stall) => stall.id === effectiveSelectedStallId,
  );
  const watchedLocation = Form.useWatch("location", form);
  const watchedCoverImage = Form.useWatch("coverImage", form);
  const uploadFileList: UploadFile[] = watchedCoverImage
    ? [
        {
          uid: effectiveSelectedStallId || "stall-cover",
          name: "cover-image",
          status: "done",
          url: watchedCoverImage,
        },
      ]
    : [];
  const mapQuery = encodeURIComponent(
    (watchedLocation as string) || selectedStall?.location || "Việt Nam",
  );
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  useEffect(() => {
    if (selectedStall) {
      form.setFieldsValue(selectedStall);
    }
  }, [form, selectedStall]);

  const handleSelectStall = (stallId: string) => {
    setSelectedStallId(stallId);
    window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleOpenAddStallModal = () => {
    addStallForm.setFieldsValue({
      name: `Quán mới ${stalls.length + 1}`,
      location: "Chưa cập nhật địa chỉ",
      coverImage: DEFAULT_NEW_COVER_IMAGE,
      openTime: "09:00",
      closeTime: "21:00",
      category: "Món Việt",
      priceRange: "Tầm trung",
    });
    setIsAddStallModalOpen(true);
  };

  const handleCreateStall = async () => {
    try {
      const values = await addStallForm.validateFields();
      const nextStall: StallItem = {
        ...values,
        id: makeId(),
        coverImage: values.coverImage || DEFAULT_NEW_COVER_IMAGE,
      };

      setStalls((prev) => [nextStall, ...prev]);
      setSelectedStallId(nextStall.id);
      setCurrentPage(1);
      setIsAddStallModalOpen(false);
      addStallForm.resetFields();
      message.success("Đã thêm quán mới");
    } catch {
      message.warning("Vui lòng điền đầy đủ thông tin quán mới");
    }
  };

  const handleSaveStall = (values: StallItem) => {
    if (!effectiveSelectedStallId) {
      message.warning("Vui lòng chọn quán cần chỉnh sửa");
      return;
    }

    setStalls((prev) =>
      prev.map((item) =>
        item.id === effectiveSelectedStallId
          ? {
              ...item,
              ...values,
              id: effectiveSelectedStallId,
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

  const totalStalls = stalls.length;
  const selectedStallCategory = selectedStall?.category || "Chưa chọn";
  const selectedOperatingHours = selectedStall
    ? `${selectedStall.openTime} - ${selectedStall.closeTime}`
    : "Chưa có dữ liệu";

  return (
    <div className="owner-store-page">
      <Card className="owner-store-hero-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={14}>
            <div className="owner-store-hero-copy">
              <Text className="owner-store-eyebrow">Stall Management</Text>
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
                <Title level={3}>{totalStalls}</Title>
              </div>
              <div className="owner-store-highlight-card">
                <Text className="owner-store-highlight-label">
                  Đang hiển thị
                </Text>
                <Title level={3}>{filteredStalls.length}</Title>
              </div>
              <div className="owner-store-highlight-card">
                <Text className="owner-store-highlight-label">
                  Danh mục hiện tại
                </Text>
                <Title level={4}>{selectedStallCategory}</Title>
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
          <StallFilters
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
          <StallList
            filteredStalls={filteredStalls}
            paginatedStalls={paginatedStalls}
            effectiveSelectedStallId={effectiveSelectedStallId}
            effectiveCurrentPage={effectiveCurrentPage}
            pageSize={pageSize}
            onSelectStall={handleSelectStall}
            onOpenAddModal={handleOpenAddStallModal}
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
                    Stall Detail Form
                  </Text>
                  <Title level={4} className="owner-store-detail-title">
                    Thông tin chi tiết quán
                  </Title>
                </div>
                {selectedStall ? (
                  <Tag color="orange">Đang chỉnh sửa: {selectedStall.name}</Tag>
                ) : null}
              </div>

              {selectedStall && selectedVisibleStall ? (
                <Form form={form} layout="vertical" onFinish={handleSaveStall}>
                  <div className="owner-store-form-hero">
                    <img
                      src={watchedCoverImage || selectedStall.coverImage}
                      alt={selectedStall.name}
                      className="owner-store-form-hero-image"
                    />
                    <div className="owner-store-form-hero-content">
                      <Title level={4}>{selectedStall.name}</Title>
                      <Text type="secondary">{selectedStall.location}</Text>
                      <div className="owner-store-form-hero-tags">
                        <Tag color="gold">{selectedStall.priceRange}</Tag>
                        <Tag color="blue">{selectedStall.category}</Tag>
                        <Tag>
                          {selectedStall.openTime} - {selectedStall.closeTime}
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
                      src={watchedCoverImage || selectedStall.coverImage}
                      alt={selectedStall.name}
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

      <AddStallModal
        open={isAddStallModalOpen}
        form={addStallForm}
        onCancel={() => {
          setIsAddStallModalOpen(false);
          addStallForm.resetFields();
        }}
        onCreate={handleCreateStall}
      />
    </div>
  );
}
