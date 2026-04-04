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
  const [selectedStallId] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<StallContentResponse | null>(
    null,
  );
  const [viewingItem, setViewingItem] = useState<StallContentResponse | null>(
    null,
  );
  const [selectedPlaybackLanguage, setSelectedPlaybackLanguage] = useState<
    string | undefined
  >(undefined);

  const effectiveStallId = selectedStallId || stalls[0]?.id;

  const { data: stallContents = [], isLoading: isStallContentsLoading } =
    useStallContents();

  const createMutation = useCreateStallContent();
  const updateMutation = useUpdateStallContent();
  const deleteMutation = useDeleteStallContent();

  const stallOptions = useMemo(
    () =>
      stalls.map((stall) => ({
        label: stall.name || stall.id,
        value: stall.id,
      })),
    [stalls],
  );

  const getStallNameById = (stallId?: string | null) => {
    if (!stallId) {
      return "";
    }

    return stalls.find((stall) => stall.id === stallId)?.name || stallId;
  };

  const availableStalls = stalls;
  const defaultStallId = stalls[0]?.id || "";

  const languageOptions = useMemo(() => {
    const languages = ["vi", "en", "zh", "ja"];
    return languages.map((code) => ({
      value: code,
      label: LANGUAGE_LABELS[code.toLowerCase()] || code.toUpperCase(),
    }));
  }, []);

  const openAddModal = () => {
    if (!availableStalls.length) {
      showToast({
        type: "warning",
        title: "Không có quán khả dụng",
        message: "Không còn quán trong danh sách để thêm nội dung",
      });
      return;
    }

    addForm.setFieldsValue({
      stall_id: defaultStallId,
      tts_script: "",
    });
    setIsAddModalOpen(true);
  };

  const handleCreate = async () => {
    if (!effectiveStallId) return;

    try {
      const values = await addForm.validateFields();
      const payload: StallContentCreateRequest = {
        stall_id: values.stall_id,
        language_code: "vi",
        tts_script: values.tts_script.trim(),
      };

      await createMutation.mutateAsync({
        stallId: values.stall_id,
        payload,
      });

      setIsAddModalOpen(false);
      addForm.resetFields();
      showToast({
        type: "success",
        title: "Thành công",
        message: "Đã thêm nội dung thuyết minh",
      });
    } catch {
      showToast({
        type: "warning",
        title: "Thiếu thông tin",
        message: "Vui lòng nhập đầy đủ thông tin trước khi lưu",
      });
    }
  };

  const openEditModal = (data: StallContentResponse) => {
    editForm.setFieldsValue({
      id: data?.id,
      stall_id: data.stall_id,
      stall_name: data.stall_name || getStallNameById(data.stall_id),
      language_code: (data.language_code || "vi") as LanguageCode,
      tts_script: data.tts_script || "",
    });

    setEditingItem(data);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) {
      return;
    }

    try {
      const values = await editForm.validateFields();

      const contentId = values.id || editingItem.id;
      const stallId =
        values.stall_id || editingItem.stall_id || effectiveStallId;

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
        language_code:
          values.language_code || (editingItem.language_code as LanguageCode),
        tts_script: values.tts_script ? values.tts_script.trim() : undefined,
      };

      showLoading();
      try {
        await updateMutation.mutateAsync({
          stallId,
          contentId,
          payload,
        });
      } finally {
        hideLoading();
      }

      setIsEditModalOpen(false);
      setEditingItem(null);
      editForm.resetFields();
      showToast({
        type: "success",
        title: "Thành công",
        message: "Đã cập nhật nội dung thuyết minh",
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
          message: "Vui lòng nhập đầy đủ nội dung thuyết minh trước khi lưu",
        });
        return;
      }

      const apiMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (
          error as {
            response?: { data?: { message?: string; error?: string } };
          }
        ).response?.data
          ? (
              error as {
                response?: { data?: { message?: string; error?: string } };
              }
            ).response?.data?.message ||
            (
              error as {
                response?: { data?: { message?: string; error?: string } };
              }
            ).response?.data?.error
          : undefined;

      showToast({
        type: "error",
        title: "Không thể lưu",
        message:
          apiMessage ||
          "Lưu nội dung thất bại. Vui lòng thử lại hoặc kiểm tra dữ liệu gửi lên",
      });
    }
  };

  const handleDelete = async (item: StallContentResponse) => {
    if (!effectiveStallId) return;

    try {
      const contentId = item.id;

      if (!contentId) {
        showToast({
          type: "error",
          title: "Thiếu contentId",
          message:
            "Backend chưa trả về contentId/id hợp lệ cho bản ghi nên không thể xóa",
        });
        return;
      }

      await deleteMutation.mutateAsync({
        stallId: effectiveStallId,
        contentId,
      });
      showToast({
        type: "success",
        title: "Đã xóa",
        message: "Nội dung thuyết minh đã được xóa",
      });
    } catch {
      showToast({
        type: "error",
        title: "Xóa thất bại",
        message: "Không thể xóa nội dung, vui lòng thử lại",
      });
    }
  };

  const openDetailModal = (item: StallContentResponse) => {
    const preferredLanguage = item.language_code?.trim() || undefined;

    setSelectedPlaybackLanguage(preferredLanguage);
    setViewingItem(item);
    setIsDetailModalOpen(true);
  };

  const filteredStallContents = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return stallContents;

    return stallContents.filter((item) => {
      const searchable =
        `${item.stall_name || ""} ${item.language_code || ""} ${item.tts_script || ""}`.toLowerCase();
      return searchable.includes(kw);
    });
  }, [keyword, stallContents]);

  const columns: TableColumnsType<StallContentResponse> = [
    {
      title: "Tên quán",
      dataIndex: "stall_name",
      key: "stall_name",
      width: 120,
      render: (value: string) => (
        <Typography.Text strong>{value}</Typography.Text>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "tts_script",
      key: "tts_script",
      width: 380,
      render: (value: string) => (
        <Typography.Text strong>{value}</Typography.Text>
      ),
    },
    {
      title: "Thời gian tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (value: number | undefined) =>
        value ? dayjs(value).format("HH:mm:ss DD/MM/YYYY") : "-",
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 160,
      render: (value: number | undefined) =>
        value ? dayjs(value).format("HH:mm:ss DD/MM/YYYY") : "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 260,
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
          <Popconfirm
            title="Xóa nội dung"
            description="Bạn có chắc chắn muốn xóa nội dung này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record)}
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
    <Space
      direction="vertical"
      size="middle"
      className="stall-content-page-wrap"
    >
      <Card
        title="Quản lý nội dung thuyết minh"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<AppstoreAddOutlined />}
              onClick={openAddModal}
            >
              Thêm nội dung
            </Button>
          </Space>
        }
      />

      <Card>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={12}>
            <Input
              size="large"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              prefix={<SearchOutlined />}
              placeholder="Tìm theo nội dung thuyết minh"
            />
          </Col>
          <Col xs={24} md={6}>
            <Button
              block
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => {
                setKeyword("");
                setCurrentPage(1);
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          className="stall-content-table"
          rowKey="id"
          loading={isStallContentsLoading}
          columns={columns}
          dataSource={filteredStallContents}
          scroll={{ x: 1080 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredStallContents.length,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <StallContentAddModal
        open={isAddModalOpen}
        form={addForm}
        onCancel={() => {
          setIsAddModalOpen(false);
          addForm.resetFields();
          editForm.resetFields();
        }}
        onCreate={handleCreate}
        stallOptions={stallOptions}
      />

      <StallContentEditModal
        open={isEditModalOpen}
        form={editForm}
        stallId={editingItem?.stall_id || effectiveStallId}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
          editForm.resetFields();
        }}
        onSave={handleSaveEdit}
      />

      <Modal
        title="Chi tiết nội dung thuyết minh"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setViewingItem(null);
          setSelectedPlaybackLanguage(undefined);
        }}
        footer={null}
        width={900}
      >
        {viewingItem ? (
          <StallContentDetail
            item={viewingItem}
            selectedLanguage={selectedPlaybackLanguage}
            languageOptions={languageOptions}
            onChangeLanguage={setSelectedPlaybackLanguage}
          />
        ) : null}
      </Modal>
    </Space>
  );
}
