import {
  AppstoreAddOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Table,
  type TableColumnsType,
  Typography,
  message,
} from "antd";
import { useMemo, useState } from "react";
import "./index.css";

const { Text } = Typography;

type StallContentFormValues = {
  title: string;
  category: string;
  audience: string;
  durationMinutes: number;
  isActive: boolean;
  summary: string;
  script: string;
};

type StallNarrationItem = StallContentFormValues & {
  id: string;
  updatedAt: string;
};

const categoryOptions = [
  { label: "Món chính", value: "Món chính" },
  { label: "Món ăn nhẹ", value: "Món ăn nhẹ" },
  { label: "Đồ uống", value: "Đồ uống" },
  { label: "Tráng miệng", value: "Tráng miệng" },
];

const audienceOptions = [
  { label: "Khách gia đình", value: "Khách gia đình" },
  { label: "Khách du lịch", value: "Khách du lịch" },
  { label: "Khách văn phòng", value: "Khách văn phòng" },
  { label: "Khách quốc tế", value: "Khách quốc tế" },
];

const initialContents: StallNarrationItem[] = [
  {
    id: "content-1",
    title: "Giới thiệu món Bún Bò Huế",
    category: "Món chính",
    audience: "Khách du lịch",
    durationMinutes: 2,
    isActive: true,
    summary: "Giới thiệu nguồn gốc món bún bò và điểm đặc trưng của nước dùng.",
    script:
      "Bún bò Huế là món ăn mang hương vị đậm đà miền Trung với nước dùng ninh từ xương, sả và mắm ruốc. Quán sử dụng bò tươi mỗi ngày để giữ vị ngọt tự nhiên.",
    updatedAt: "Cập nhật: 20/03/2026",
  },
  {
    id: "content-2",
    title: "Câu chuyện Cà phê sữa đá",
    category: "Đồ uống",
    audience: "Khách văn phòng",
    durationMinutes: 1,
    isActive: true,
    summary: "Nội dung ngắn kể về văn hóa cà phê phin Việt Nam.",
    script:
      "Cà phê sữa đá tại quán được pha phin trực tiếp, tạo độ đậm vừa phải, kết hợp sữa đặc để cân bằng vị đắng và thơm. Đây là lựa chọn phù hợp cho buổi sáng hoặc sau bữa ăn.",
    updatedAt: "Cập nhật: 19/03/2026",
  },
  {
    id: "content-3",
    title: "Khuyến nghị món tráng miệng theo mùa",
    category: "Tráng miệng",
    audience: "Khách gia đình",
    durationMinutes: 1,
    isActive: false,
    summary: "Gợi ý các món tráng miệng thay đổi theo nguyên liệu mùa vụ.",
    script:
      "Mỗi mùa quán cập nhật một món tráng miệng mới để giữ sự tươi mới cho thực đơn. Nội dung thuyết minh này giúp khách hiểu lý do lựa chọn nguyên liệu theo mùa.",
    updatedAt: "Cập nhật: 17/03/2026",
  },
];

const buildId = () => `content-${Date.now()}`;

export default function StallContentPage() {
  const [form] = Form.useForm<StallContentFormValues>();

  const [contents, setContents] =
    useState<StallNarrationItem[]>(initialContents);
  const [keyword, setKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<StallNarrationItem | null>(
    null,
  );

  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      const kw = keyword.trim().toLowerCase();
      const matchedKeyword =
        !kw ||
        item.title.toLowerCase().includes(kw) ||
        item.summary.toLowerCase().includes(kw);
      const matchedCategory =
        filterCategory === "all" || item.category === filterCategory;
      const matchedStatus =
        filterStatus === "all" ||
        (filterStatus === "active" ? item.isActive : !item.isActive);

      return matchedKeyword && matchedCategory && matchedStatus;
    });
  }, [contents, filterCategory, filterStatus, keyword]);

  const openCreateModal = () => {
    setEditingId(null);
    form.setFieldsValue({
      title: `Nội dung mới ${contents.length + 1}`,
      category: "Món chính",
      audience: "Khách gia đình",
      durationMinutes: 2,
      isActive: true,
      summary: "Nội dung mẫu để khởi tạo nhanh.",
      script: "Nhập nội dung thuyết minh chi tiết tại đây.",
    });
    setIsUpsertModalOpen(true);
  };

  const openEditModal = (record: StallNarrationItem) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsUpsertModalOpen(true);
  };

  const openDetailModal = (record: StallNarrationItem) => {
    setViewingItem(record);
    setIsDetailModalOpen(true);
  };

  const handleSubmitUpsert = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        setContents((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...values,
                  updatedAt: "Cập nhật: hôm nay",
                }
              : item,
          ),
        );
        message.success("Đã cập nhật nội dung thuyết minh");
      } else {
        const newItem: StallNarrationItem = {
          ...values,
          id: buildId(),
          updatedAt: "Cập nhật: hôm nay",
        };
        setContents((prev) => [newItem, ...prev]);
        message.success("Đã tạo nội dung thuyết minh mới");
      }

      setCurrentPage(1);
      setIsUpsertModalOpen(false);
      setEditingId(null);
      form.resetFields();
    } catch {
      message.warning("Vui lòng nhập đầy đủ thông tin bắt buộc");
    }
  };

  const contentColumns: TableColumnsType<StallNarrationItem> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{record.title}</Typography.Text>
          <Text type="secondary" className="stall-content-summary-text">
            {record.summary}
          </Text>
        </Space>
      ),
    },
    {
      title: "Nhóm",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (value: string) => <Tag color="purple">{value}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 130,
      render: (value: boolean) => (
        <Tag color={value ? "green" : "default"}>
          {value ? "Đang bật" : "Tạm tắt"}
        </Tag>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "durationMinutes",
      key: "durationMinutes",
      width: 120,
      render: (value: number) => (
        <Tag icon={<SoundOutlined />}>{value} phút</Tag>
      ),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => openDetailModal(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý nội dung thuyết minh"
      extra={
        <Button
          type="primary"
          icon={<AppstoreAddOutlined />}
          onClick={openCreateModal}
        >
          Thêm nội dung
        </Button>
      }
    >
      <Text type="secondary">
        Toàn bộ dữ liệu được quản lý trên một bảng duy nhất để theo dõi, lọc và
        cập nhật nhanh.
      </Text>

      <div className="stall-content-toolbar">
        <Input
          size="large"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setCurrentPage(1);
          }}
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tiêu đề hoặc tóm tắt"
          className="stall-content-toolbar-search"
        />

        <Select
          size="large"
          value={filterCategory}
          options={[{ label: "Tất cả nhóm", value: "all" }, ...categoryOptions]}
          onChange={(value) => {
            setFilterCategory(value);
            setCurrentPage(1);
          }}
          suffixIcon={<FilterOutlined />}
          className="stall-content-toolbar-select"
        />

        <Select
          size="large"
          value={filterStatus}
          options={[
            { label: "Tất cả trạng thái", value: "all" },
            { label: "Đang kích hoạt", value: "active" },
            { label: "Tạm tắt", value: "inactive" },
          ]}
          onChange={(value) => {
            setFilterStatus(value);
            setCurrentPage(1);
          }}
          suffixIcon={<FilterOutlined />}
          className="stall-content-toolbar-select"
        />

        <Button
          size="large"
          icon={<ReloadOutlined />}
          onClick={() => {
            setKeyword("");
            setFilterCategory("all");
            setFilterStatus("all");
            setCurrentPage(1);
          }}
        >
          Reset
        </Button>
      </div>

      <Table
        className="stall-content-table"
        rowKey="id"
        columns={contentColumns}
        dataSource={filteredContents}
        size="middle"
        scroll={{ x: 980 }}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredContents.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} / ${total} nội dung`,
        }}
      />

      <Modal
        title={
          editingId
            ? "Chỉnh sửa nội dung thuyết minh"
            : "Thêm nội dung thuyết minh"
        }
        open={isUpsertModalOpen}
        onCancel={() => {
          setIsUpsertModalOpen(false);
          setEditingId(null);
          form.resetFields();
        }}
        onOk={handleSubmitUpsert}
        okText={editingId ? "Lưu thay đổi" : "Tạo nội dung"}
        cancelText="Hủy"
        width={860}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div className="stall-content-modal-grid">
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input
                size="large"
                placeholder="Ví dụ: Giới thiệu món Bún Bò Huế"
              />
            </Form.Item>

            <Form.Item
              name="durationMinutes"
              label="Thời lượng (phút)"
              rules={[{ required: true, message: "Vui lòng nhập thời lượng" }]}
            >
              <InputNumber
                size="large"
                min={1}
                max={60}
                className="stall-content-full-width"
              />
            </Form.Item>
          </div>

          <div className="stall-content-modal-grid">
            <Form.Item
              name="category"
              label="Nhóm nội dung"
              rules={[
                { required: true, message: "Vui lòng chọn nhóm nội dung" },
              ]}
            >
              <Select size="large" options={categoryOptions} />
            </Form.Item>

            <Form.Item
              name="audience"
              label="Đối tượng ưu tiên"
              rules={[{ required: true, message: "Vui lòng chọn đối tượng" }]}
            >
              <Select size="large" options={audienceOptions} />
            </Form.Item>
          </div>

          <Form.Item
            name="summary"
            label="Tóm tắt ngắn"
            rules={[{ required: true, message: "Vui lòng nhập tóm tắt" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="2-3 câu mô tả nhanh nội dung"
            />
          </Form.Item>

          <Form.Item
            name="script"
            label="Nội dung thuyết minh"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung thuyết minh" },
            ]}
          >
            <Input.TextArea
              rows={7}
              placeholder="Nhập kịch bản thuyết minh chi tiết"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch checkedChildren="Đang bật" unCheckedChildren="Tạm tắt" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết nội dung thuyết minh"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setViewingItem(null);
        }}
        footer={null}
        width={760}
      >
        {viewingItem ? (
          <Space
            direction="vertical"
            size="middle"
            className="stall-content-detail-wrap"
          >
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Tiêu đề">
                {viewingItem.title}
              </Descriptions.Item>
              <Descriptions.Item label="Nhóm nội dung">
                <Tag color="purple">{viewingItem.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đối tượng">
                {viewingItem.audience}
              </Descriptions.Item>
              <Descriptions.Item label="Thời lượng">
                <Tag icon={<SoundOutlined />}>
                  {viewingItem.durationMinutes} phút
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={viewingItem.isActive ? "green" : "default"}>
                  {viewingItem.isActive ? "Đang bật" : "Tạm tắt"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật">
                {viewingItem.updatedAt}
              </Descriptions.Item>
              <Descriptions.Item label="Tóm tắt">
                {viewingItem.summary}
              </Descriptions.Item>
            </Descriptions>

            <Card size="small" title="Nội dung thuyết minh">
              <Text>{viewingItem.script}</Text>
            </Card>
          </Space>
        ) : null}
      </Modal>
    </Card>
  );
}
