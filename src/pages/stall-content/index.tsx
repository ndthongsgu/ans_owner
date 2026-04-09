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
import type {
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
  useAvailableStallsWithoutContent,
  useCreateStallContent,
  useUpdateStallContent,
  useDeleteStallContent,
} from "@/hooks/stall-content";
import StallContentAddModal from "./add";
import StallContentDetail from "./detail";
import StallContentEditModal from "./edit";
import { LANGUAGE_LABELS } from "@/utils/language.utils";
import { formatUnixTimestamp } from "@/utils/date.utils";
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

  const { data: stallContents = [], isLoading: isStallContentsLoading } =
    useStallContents();

  const { data: availableStalls = [], refetch: refetchAvailableStalls } =
    useAvailableStallsWithoutContent();

  const stallOptions = useMemo(
    () =>
      availableStalls.map((stall) => ({
        label: stall.stall_name,
        value: stall.id,
      })),
    [availableStalls],
  );

  const createMutation = useCreateStallContent();
  const updateMutation = useUpdateStallContent();
  const deleteMutation = useDeleteStallContent();

  const languageOptions = useMemo(() => {
    const languages = ["vi", "en", "zh", "ja", "ko"];
    return languages.map((code) => ({
      value: code,
      label: LANGUAGE_LABELS[code.toLowerCase()] || code.toUpperCase(),
    }));
  }, []);

  const openAddModal = async () => {
    try {
      const { data: availableStalls = [] } = await refetchAvailableStalls();

      const usedStallIds = new Set(
        stallContents.map((item) => item.id).filter(Boolean),
      );

      const nextOptions = availableStalls
        .filter((stall) => !usedStallIds.has(stall.id))
        .map((stall) => ({
          label: stall.stall_name,
          value: stall.id,
        }));

      if (!nextOptions.length) {
        showToast({
          type: "warning",
          title: "Không còn quán khả dụng",
          message:
            "Tất cả quán đã có nội dung trong hệ thống hoặc chưa có quán khả dụng.",
        });
        return;
      }

      setIsAddModalOpen(true);
    } catch {
      showToast({
        type: "error",
        title: "Lỗi tải dữ liệu",
        message: "Không thể lấy danh sách quán khả dụng. Vui lòng thử lại.",
      });
    }
  };

  const handleCreate = async () => {
    try {
      const values = await addForm.validateFields();
      const selectedStallId = values.stall_id?.trim();

      if (!selectedStallId) {
        showToast({
          type: "warning",
          title: "Thiếu thông tin",
          message: "Vui lòng chọn quán trước khi tạo nội dung",
        });
        return;
      }

      const isSelectableStall = stallOptions.some(
        (option) => option.value === selectedStallId,
      );
      if (!isSelectableStall) {
        showToast({
          type: "warning",
          title: "Quán không hợp lệ",
          message:
            "Quán này đã có nội dung hoặc không còn trong danh sách khả dụng",
        });
        return;
      }

      const hasExistingContent = stallContents.some(
        (item) => item.stall_id === selectedStallId,
      );
      if (hasExistingContent) {
        showToast({
          type: "warning",
          title: "Quán đã có nội dung",
          message: "Vui lòng chọn quán khác để tạo nội dung mới",
        });
        return;
      }

      const payload: StallContentCreateRequest = {
        stall_id: selectedStallId,
        stall_name:
          stallOptions.find((option) => option.value === selectedStallId)
            ?.label ||
          stalls.find((item) => item.id === selectedStallId)?.stall_name ||
          selectedStallId,
        tts_script: values.tts_script.trim(),
      };

      showLoading();
      try {
        await createMutation.mutateAsync({
          stallId: selectedStallId,
          payload,
        });
      } finally {
        hideLoading();
      }

      setIsAddModalOpen(false);
      addForm.resetFields();
      showToast({
        type: "success",
        title: "Thành công",
        message: "Đã thêm nội dung thuyết minh",
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "errorFields" in error &&
        Array.isArray((error as { errorFields?: unknown[] }).errorFields)
      ) {
        showToast({
          type: "warning",
          title: "Thiếu thông tin",
          message: "Vui lòng nhập đầy đủ thông tin trước khi lưu",
        });
        return;
      }

      showToast({
        type: "error",
        title: "Tạo thất bại",
        message: "Không thể tạo nội dung thuyết minh. Vui lòng thử lại.",
      });
    }
  };

  const openEditModal = (data: StallContentResponse) => {
    editForm.setFieldsValue({
      id: data?.id,
      stall_name: data.stall_name,
      tts_script: data.tts_script,
    });

    setEditingItem(data);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const values = await editForm.validateFields();

      const contentId = values.id || editingItem.id;
      const stallId = values.stall_id || editingItem.stall_id;

      if (!stallId) {
        showToast({
          type: "error",
          title: "Thiếu stallId",
          message:
            "Backend chưa trả về stallId hợp lệ cho bản ghi nên không thể cập nhật",
        });
        return;
      }

      if (!contentId) {
        showToast({
          type: "error",
          title: "Thiếu contentId",
          message:
            "Backend chưa trả về contentId/id hợp lệ cho bản ghi nên không thể cập nhật",
        });
        return;
      }

      const payload: StallContentUpdateRequest = {
        stall_id: stallId,
        stall_name: values.stall_name.trim(),
        tts_script: values.tts_script.trim(),
      };

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
      const contentId = item.id;
      const stallId = item.stall_id;

      if (!contentId) {
        showToast({
          type: "error",
          title: "Thiếu contentId",
          message:
            "Backend chưa trả về contentId/id hợp lệ cho bản ghi nên không thể xóa",
        });
        return;
      }

      if (!stallId) {
        showToast({
          type: "error",
          title: "Thiếu stallId",
          message:
            "Backend chưa trả về stallId hợp lệ cho bản ghi nên không thể xóa",
        });
        return;
      }

      await deleteMutation.mutateAsync({
        stallId,
        contentId,
      });
      showToast({
        type: "success",
        title: "Đã xóa",
        message: "Nội dung thuyết minh đã được xóa",
      });
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

    return stallContents.filter((item) => {
      const searchable =
        `${item.stall_name || ""} ${item.tts_script || ""}`.toLowerCase();
      return searchable.includes(kw);
    });
  }, [keyword, stallContents]);

  const columns: TableColumnsType<StallContentResponse> = [
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
      title: "Thời gian tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (value: number | undefined) => formatUnixTimestamp(value),
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
      render: (value: number | undefined) => formatUnixTimestamp(value),
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
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
        }}
        onCreate={handleCreate}
        stallOptions={stallOptions}
      />

      <StallContentEditModal
        open={isEditModalOpen}
        form={editForm}
        stallId={editingItem?.stall_id}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
          editForm.resetFields();
        }}
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