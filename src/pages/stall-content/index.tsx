import {
  AppstoreAddOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
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
  Skeleton,
  Space,
  Table,
  Typography,
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

  const [editingItem, setEditingItem] = useState<StallContentResponse | null>(
    null,
  );
  const [viewingItem, setViewingItem] = useState<StallContentResponse | null>(
    null,
  );
  const [selectedPlaybackLanguage, setSelectedPlaybackLanguage] = useState<
    string | undefined
  >(undefined);

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
    if (!editingItem) {
      return;
    }

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
        `${item.stall_name || ""} ${item.tts_script || ""}`.toLowerCase();
      return searchable.includes(kw);
    });
  }, [keyword, stallContents]);

  const scriptedChars = useMemo(
    () =>
      stallContents.reduce(
        (sum, item) => sum + (item.tts_script?.length || 0),
        0,
      ),
    [stallContents],
  );

  const averageScriptLength = useMemo(() => {
    if (!stallContents.length) {
      return 0;
    }

    return Math.round(scriptedChars / stallContents.length);
  }, [scriptedChars, stallContents.length]);

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
      render: (value: number | undefined) => formatUnixTimestamp(value),
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 160,
      render: (value: number | undefined) => formatUnixTimestamp(value),
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
      size="large"
      className="stall-content-page-wrap"
    >
      <section className="stall-content-hero">
        <div className="stall-content-hero-content">
          <Typography.Text className="stall-content-hero-kicker">
            Audio Story Experience
          </Typography.Text>
          <Typography.Title level={2} className="stall-content-hero-title">
            Biến mỗi quán thành một trải nghiệm kể chuyện bán được
          </Typography.Title>
          <Typography.Paragraph className="stall-content-hero-description">
            Quản lý kịch bản thuyết minh theo ngôn ngữ, tối ưu nội dung theo
            từng điểm bán và theo dõi mức độ phong phú của hệ thống chỉ trong
            một trang.
          </Typography.Paragraph>
          <Space wrap className="stall-content-hero-badges">
            <span className="stall-content-hero-badge">Đa ngôn ngữ</span>
            <span className="stall-content-hero-badge">Tối ưu conversion</span>
            <span className="stall-content-hero-badge">Chuẩn hoá vận hành</span>
          </Space>
          <Button
            type="primary"
            size="large"
            icon={<AppstoreAddOutlined />}
            onClick={openAddModal}
          >
            Thêm nội dung
          </Button>
        </div>
      </section>

      <Row gutter={[16, 16]} className="stall-content-kpi-row">
        <Col xs={24} sm={12} lg={8}>
          <Card className="stall-content-kpi-card">
            <Typography.Text type="secondary">Bản thuyết minh</Typography.Text>
            <Typography.Title level={3} className="stall-content-kpi-value">
              {stallContents.length}
            </Typography.Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stall-content-kpi-card">
            <Typography.Text type="secondary">
              Hiển thị theo lọc
            </Typography.Text>
            <Typography.Title level={3} className="stall-content-kpi-value">
              {filteredStallContents.length}
            </Typography.Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stall-content-kpi-card">
            <Typography.Text type="secondary">
              Tổng ký tự script
            </Typography.Text>
            <Typography.Title level={3} className="stall-content-kpi-value">
              {scriptedChars}
            </Typography.Title>
            <Typography.Text
              className="stall-content-kpi-subtext"
              type="secondary"
            >
              Trung bình {averageScriptLength} ký tự / nội dung
            </Typography.Text>
          </Card>
        </Col>
      </Row>

      <Card className="stall-content-panel-card">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={14}>
            <Input
              size="large"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              prefix={<SearchOutlined />}
              placeholder="Tìm theo nội dung thuyết minh"
              allowClear
            />
          </Col>
        </Row>
      </Card>

      <Card className="stall-content-panel-card stall-content-table-panel">
        {isStallContentsLoading ? (
          <Skeleton active paragraph={{ rows: 7 }} />
        ) : (
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
              showTotal: (total) => `Tổng cộng ${total} nội dung`,
              responsive: true,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            locale={{
              emptyText: (
                <div className="stall-content-empty-state">
                  <Typography.Text strong>
                    Chưa có nội dung phù hợp
                  </Typography.Text>
                  <Typography.Paragraph type="secondary">
                    Hãy tạo script mới hoặc điều chỉnh từ khóa để tìm nhanh hơn.
                  </Typography.Paragraph>
                </div>
              ),
            }}
          />
        )}
      </Card>

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
