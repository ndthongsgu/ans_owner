import {
  Card,
  Col,
  Empty,
  Modal,
  Row,
  Spin,
  Tag,
  Typography,
  Button,
} from "antd";
import { formatUnixTimestamp } from "@/utils/date.utils";
import { HistoryOutlined } from "@ant-design/icons";
import type { PackageDto } from "@/dto/subscription.dto";

const { Title, Text } = Typography;

interface PurchaseHistoryModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  myPurchases: PackageDto[] | undefined;
  activePackageId: string | null | undefined;
  onActivate: (transactionId: string) => void;
  isActivating: boolean;
}

export default function PurchaseHistoryModal({
  open,
  onClose,
  isLoading,
  myPurchases,
  activePackageId,
  onActivate,
  isActivating,
}: PurchaseHistoryModalProps) {
  return (
    <Modal
      title={
        <div
          className="subscription-history-modal-title"
          style={{ display: "flex", alignItems: "center" }}
        >
          <HistoryOutlined style={{ marginRight: 10, color: "#6366f1" }} />
          Lịch sử gói đã mua
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={820}
      className="subscription-history-modal"
    >
      {isLoading ? (
        <div
          className="subscription-loading"
          style={{ textAlign: "center", padding: 40 }}
        >
          <Spin size="large" />
        </div>
      ) : !myPurchases || myPurchases.length === 0 ? (
        <Empty
          description="Bạn chưa mua gói nào"
          style={{ padding: "40px 0" }}
        />
      ) : (
        <Row gutter={[16, 16]} style={{ padding: "8px 0" }}>
          {myPurchases.map((pkg) => {
            const isActive = activePackageId === pkg.id;
            const transactionId = (pkg as any).transaction_id || pkg.id;
            return (
              <Col xs={24} md={12} key={pkg.id}>
                <Card
                  className={`subscription-history-item-card${isActive ? " is-active" : ""}`}
                >
                  <div
                    className="subscription-history-item-top"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div className="subscription-history-item-info">
                      <Title level={5} style={{ margin: "0 0 4px" }}>
                        {pkg.name}
                      </Title>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                          marginBottom: 6,
                        }}
                      >
                        <Tag color="blue">Mã: {pkg.code}</Tag>
                        <Tag color="geekblue">Tối đa {pkg.max_stalls} quán</Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {pkg.description || "Không có mô tả"}
                      </Text>
                    </div>
                    {isActive && (
                      <Tag color="gold" style={{ flexShrink: 0 }}>
                        Đang dùng
                      </Tag>
                    )}
                  </div>
                  <div
                    className="subscription-history-item-footer"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      marginTop: 16,
                    }}
                  >
                    <div>
                      <Text strong style={{ fontSize: 18, color: "#1e293b" }}>
                        {pkg.price?.toLocaleString("vi-VN")}đ
                      </Text>
                      {pkg.created_at && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Ngày mua:{" "}
                            {formatUnixTimestamp(
                              pkg.created_at,
                              "",
                              "DD/MM/YYYY",
                            )}
                          </Text>
                        </div>
                      )}
                    </div>
                    {isActive ? (
                      <Button type="default" disabled size="small">
                        Đang hoạt động
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        size="small"
                        className="subscription-btn-use"
                        loading={isActivating}
                        onClick={() => onActivate(transactionId)}
                      >
                        Kích hoạt lại
                      </Button>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Modal>
  );
}
