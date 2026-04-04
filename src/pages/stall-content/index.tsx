import {
  AppstoreAddOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Typography,
  Tag,
  type TableColumnsType,
} from "antd";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import type {
  LanguageCode,
  StallContentCreateRequest,
  StallContentResponse,
  StallContentUpdateRequest,
} from "@/dto/stall-content.dto";
import type { StallContentEditFormValues } from "./edit";
import { useStalls } from "@/hooks/stall/index";
import { useToast } from "@/hooks/layout/useToast";
import { useLoading } from "@/context/LoadingContext";
import {
  useStallContents,
  useCreateStallContent,
  useUpdateStallContent,
  useDeleteStallContent,
} from "@/hooks/stall-content";
import StallContentAddModal from "./add";
import StallContentDetail from "./detail";
import StallContentEditModal from "./edit";
import { LANGUAGE_LABELS } from "@/utils/language.utils";
import "./index.css";

export default function StallContentPage() {
  const showToast = useToast();
  const { showLoading, hideLoading } = useLoading();
  const [addForm] = Form.useForm<StallContentCreateRequest>();
  const [editForm] = Form.useForm<StallContentEditFormValues>();

  const { data: stalls = [] } = useStalls();
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<StallContentResponse | null>(null);
  const [viewingItem, setViewingItem] = useState<StallContentResponse | null>(null);
  const [selectedPlaybackLanguage, setSelectedPlaybackLanguage] = useState<string | undefined>(undefined);

  const { data: stallContents = [], isLoading: isStallContentsLoading } = useStallContents();

  // 1. Tối ưu hóa việc lấy Stall Name: API đã trả về stall_name, chỉ fallback nếu thiếu
  const enrichedStallContents = useMemo(() => {
    return stallContents.map((content) => ({
      ...content,
      display_stall_name: content.stall_name || stalls.find(s => s.id === content.stall_id)?.name || content.stall_id,
    }));
  }, [stallContents, stalls]);

  const createMutation = useCreateStallContent();
  const updateMutation = useUpdateStallContent();
  const deleteMutation = useDeleteStallContent();

  const stallOptions = useMemo(
    () => stalls.map((stall) => ({ label: stall.name || stall.id, value: stall.id })),
    [stalls]
  );

  const languageOptions = useMemo(() => {
    const languages = ["vi", "en", "zh", "ja"];
    return languages.map((code) => ({
      value: code,
      label: LANGUAGE_LABELS[code.toLowerCase()] || code.toUpperCase(),
    }));
  }, []);

  // Handlers
  const openAddModal = () => {
    if (!stalls.length) {
      showToast({ type: "warning", title: "Cảnh báo", message: "Không tìm thấy danh sách quán" });
      return;
    }
    addForm.setFieldsValue({ stall_id: stalls[0]?.id, tts_script: "" });
    setIsAddModalOpen(true);
  };

  const handleCreate = async () => {
    try {
      const values = await addForm.validateFields();
      await createMutation.mutateAsync({
        stallId: values.stall_id,
        payload: { ...values, language_code: "vi" }
      });
      setIsAddModalOpen(false);
      addForm.resetFields();
      showToast({ type: "success", title: "Thành công", message: "Đã thêm nội dung" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const values = await editForm.validateFields();
      showLoading();
      await updateMutation.mutateAsync({
        stallId: editingItem.stall_id,
        contentId: editingItem.id,
        payload: {
          language_code: values.language_code,
          tts_script: values.tts_script?.trim(),
        },
      });
      setIsEditModalOpen(false);
      showToast({ type: "success", title: "Thành công", message: "Đã cập nhật" });
    } catch (err) {
      showToast({ type: "error", title: "Lỗi", message: "Không thể lưu thay đổi" });
    } finally {
      hideLoading();
    }
  };

  const handleDelete = async (item: StallContentResponse) => {
    try {
      await deleteMutation.mutateAsync({ stallId: item.stall_id, contentId: item.id });
      showToast({ type: "success", title: "Đã xóa", message: "Nội dung đã được loại bỏ" });
    } catch {
      showToast({ type: "error", title: "Thất bại", message: "Không thể xóa" });
    }
  };

  const filteredStallContents = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return enrichedStallContents;
    return enrichedStallContents.filter((item) =>
      `${item.display_stall_name} ${item.title} ${item.tts_script}`.toLowerCase().includes(kw)
    );
  }, [keyword, enrichedStallContents]);

  const columns: TableColumnsType<StallContentResponse & { display_stall_name: string }> = [
    {
      title: "Tên quán",
      dataIndex: "display_stall_name",
      key: "display_stall_name",
      fixed: 'left',
      width: 150,
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: "Ngôn ngữ",
      dataIndex: "language_code",
      key: "language_code",
      width: 100,
      render: (code) => <Tag color="blue">{LANGUAGE_LABELS[code] || code.toUpperCase()}</Tag>,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Audio",
      dataIndex: "audio_url",
      key: "audio_url",
      width: 100,
      render: (url) => url ? <a href={url} target="_blank">Nghe</a> : "-",
    },
    {
      title: "Thời lượng",
      dataIndex: "audio_duration",
      key: "audio_duration",
      width: 100,
      render: (d) => d ? `${d}s` : "-",
    },
    {
      title: "Phiên bản",
      dataIndex: "version",
      key: "version",
      width: 90,
      render: (v) => <Tag>v{v}</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      // SỬA LỖI: API trả về giây (Unix), dayjs mặc định là miligiây
      render: (val) => val ? dayjs.unix(val).format("HH:mm DD/MM/YYYY") : "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => {
            setViewingItem(record);
            setSelectedPlaybackLanguage(record.language_code);
            setIsDetailModalOpen(true);
          }}>Xem</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => {
            setEditingItem(record);
            editForm.setFieldsValue({ ...record });
            setIsEditModalOpen(true);
          }}>Sửa</Button>
          <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record)}>
            <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card title="Quản lý nội dung thuyết minh" extra={
        <Button type="primary" icon={<AppstoreAddOutlined />} onClick={openAddModal}>Thêm mới</Button>
      } />

      <Card>
        <Row gutter={16}>
          <Col flex="auto">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm quán hoặc nội dung..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={() => setKeyword("")}>Làm mới</Button>
          </Col>
        </Row>
      </Card>

      <Table
        rowKey="id"
        loading={isStallContentsLoading}
        columns={columns}
        dataSource={filteredStallContents}
        scroll={{ x: 1200 }}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredStallContents.length,
          onChange: (p, s) => { setCurrentPage(p); setPageSize(s); }
        }}
      />

      {/* Modals */}
      <StallContentAddModal
        open={isAddModalOpen}
        form={addForm}
        onCancel={() => setIsAddModalOpen(false)}
        onCreate={handleCreate}
        stallOptions={stallOptions}
      />

      <StallContentEditModal
        open={isEditModalOpen}
        form={editForm}
        stallId={editingItem?.stall_id || ""}
        onCancel={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      <Modal
        title="Chi tiết thuyết minh"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={800}
      >
        {viewingItem && (
          <StallContentDetail
            item={viewingItem}
            selectedLanguage={selectedPlaybackLanguage}
            languageOptions={languageOptions}
            onChangeLanguage={setSelectedPlaybackLanguage}
          />
        )}
      </Modal>
    </Space>
  );
}