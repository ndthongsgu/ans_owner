import { useOwnerProfile } from "@/hooks/owner";
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
  Descriptions,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Table,
  type TableColumnsType,
  Typography,
  message,
} from "antd";
import { useMemo, useState } from "react";
import {
  categoryOptions,
  DEFAULT_MAIN_COVER_IMAGE,
  DEFAULT_NEW_COVER_IMAGE,
  priceOptions,
} from "@/constants/stall.constants";
import type { StallItem } from "@/dto/stall.dto";
import { makeId } from "@/utils/stall.utils";
import StallAddModal from "./add";
import "./index.css";

const { Text } = Typography;

export default function StallPage() {
  const { data: profile } = useOwnerProfile();
  const owner = profile?.owner;
  const [addStallForm] = Form.useForm<StallItem>();
  const [editStallForm] = Form.useForm<StallItem>();
  const [isAddStallModalOpen, setIsAddStallModalOpen] = useState(false);
  const [isEditStallModalOpen, setIsEditStallModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriceRange, setFilterPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [editingStallId, setEditingStallId] = useState<string | null>(null);
  const [detailStall, setDetailStall] = useState<StallItem | null>(null);

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
      setCurrentPage(1);
      setIsAddStallModalOpen(false);
      addStallForm.resetFields();
      message.success("Đã thêm quán mới");
    } catch {
      message.warning("Vui lòng điền đầy đủ thông tin quán mới");
    }
  };

  const handleOpenEditStall = (stall: StallItem) => {
    setEditingStallId(stall.id);
    editStallForm.setFieldsValue(stall);
    setIsEditStallModalOpen(true);
  };

  const handleUpdateStall = async () => {
    try {
      const values = await editStallForm.validateFields();
      if (!editingStallId) return;

      setStalls((prev) =>
        prev.map((item) =>
          item.id === editingStallId
            ? {
                ...item,
                ...values,
                id: editingStallId,
              }
            : item,
        ),
      );
      setIsEditStallModalOpen(false);
      setEditingStallId(null);
      editStallForm.resetFields();
      message.success("Đã lưu thông tin quán");
    } catch {
      message.warning("Vui lòng nhập đầy đủ thông tin");
    }
  };

  const handleDeleteStall = (stallId: string) => {
    setStalls((prev) => prev.filter((item) => item.id !== stallId));
    message.success("Đã xóa quán");
  };

  const handleOpenDetail = (stall: StallItem) => {
    setDetailStall(stall);
    setIsDetailModalOpen(true);
  };

  const stallColumns: TableColumnsType<StallItem> = [
    {
      title: "Ảnh",
      dataIndex: "coverImage",
      key: "coverImage",
      width: 90,
      render: (coverImage: string, record) => (
        <Image
          src={coverImage}
          alt={record.name}
          className="stall-table-thumbnail"
          preview={false}
        />
      ),
    },
    {
      title: "Tên quán",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (name: string, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{name}</Typography.Text>
          <Text type="secondary">{record.location}</Text>
        </Space>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: "Mức giá",
      dataIndex: "priceRange",
      key: "priceRange",
      width: 120,
      render: (value: string) => <Tag color="gold">{value}</Tag>,
    },
    {
      title: "Giờ mở cửa",
      key: "operatingHours",
      width: 150,
      render: (_, record) => (
        <Tag>
          {record.openTime} - {record.closeTime}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 220,
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
    <Space direction="vertical" size="middle" className="stall-page-wrap">
      <Card>
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
              placeholder="Tìm theo tên quán hoặc địa chỉ"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              size="large"
              value={filterCategory}
              options={[
                { label: "Tất cả danh mục", value: "all" },
                ...categoryOptions,
              ]}
              onChange={(value) => {
                setFilterCategory(value);
                setCurrentPage(1);
              }}
              suffixIcon={<FilterOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              size="large"
              value={filterPriceRange}
              options={[
                { label: "Tất cả mức giá", value: "all" },
                ...priceOptions,
              ]}
              onChange={(value) => {
                setFilterPriceRange(value);
                setCurrentPage(1);
              }}
              suffixIcon={<FilterOutlined />}
            />
          </Col>
          <Col xs={24} md={2}>
            <Button
              block
              size="large"
              onClick={() => {
                setKeyword("");
                setFilterCategory("all");
                setFilterPriceRange("all");
                setCurrentPage(1);
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        title="Danh sách quán của tôi"
        extra={
          <Button
            type="primary"
            icon={<AppstoreAddOutlined />}
            onClick={handleOpenAddStallModal}
          >
            Thêm quán mới
          </Button>
        }
      >
        <Text type="secondary">
          Tìm thấy {filteredStalls.length} quán phù hợp. Quản lý trực tiếp bằng
          các nút thao tác trên từng dòng.
        </Text>

        <Table
          className="stall-list-table"
          rowKey="id"
          columns={stallColumns}
          dataSource={filteredStalls}
          size="middle"
          scroll={{ x: 980 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredStalls.length,
            showSizeChanger: true,
            pageSizeOptions: ["3", "6", "9", "12"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} quán`,
          }}
        />
      </Card>

      <StallAddModal
        open={isAddStallModalOpen}
        form={addStallForm}
        onCancel={() => {
          setIsAddStallModalOpen(false);
          addStallForm.resetFields();
        }}
        onCreate={handleCreateStall}
      />

      <Modal
        title="Chỉnh sửa quán"
        open={isEditStallModalOpen}
        onCancel={() => {
          setIsEditStallModalOpen(false);
          setEditingStallId(null);
          editStallForm.resetFields();
        }}
        onOk={handleUpdateStall}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={editStallForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên quán"
            rules={[{ required: true, message: "Vui lòng nhập tên quán" }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="location"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input size="large" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select size="large" options={categoryOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priceRange"
                label="Mức giá"
                rules={[{ required: true, message: "Vui lòng chọn mức giá" }]}
              >
                <Select size="large" options={priceOptions} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="openTime"
                label="Giờ mở cửa"
                rules={[
                  { required: true, message: "Vui lòng nhập giờ mở cửa" },
                ]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="closeTime"
                label="Giờ đóng cửa"
                rules={[
                  { required: true, message: "Vui lòng nhập giờ đóng cửa" },
                ]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="coverImage" label="URL ảnh bìa">
            <Input size="large" placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết quán"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setDetailStall(null);
        }}
        footer={null}
      >
        {detailStall ? (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Image src={detailStall.coverImage} alt={detailStall.name} />
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Tên quán">
                {detailStall.name}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {detailStall.location}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {detailStall.category}
              </Descriptions.Item>
              <Descriptions.Item label="Mức giá">
                {detailStall.priceRange}
              </Descriptions.Item>
              <Descriptions.Item label="Giờ hoạt động">
                {detailStall.openTime} - {detailStall.closeTime}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        ) : null}
      </Modal>
    </Space>
  );
}
