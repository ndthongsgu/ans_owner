import { Button, Card, List, Modal, Tag, message, Spin } from "antd";
import { useState } from "react";
import QrPaymentModal from "@/components/payment/QrPaymentModal";
import { useListPackages, usePurchasePackage } from "@/hooks/subscription";
import type { PackageDto } from "@/dto/subscription.dto";

export default function PackageSelector({ open, onClose }: any) {
  const { data: packages, isLoading } = useListPackages();
  const purchaseMutation = usePurchasePackage();
  const [current, setCurrent] = useState<PackageDto | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const handleConfirm = async () => {
    if (!current) return;
    try {
      await purchaseMutation.mutateAsync(current.id);
      message.success("Đăng ký gói thành công");
      setQrOpen(false);
      onClose();
    } catch (err: any) {
      message.error(err?.message || "Lỗi đăng ký");
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={640} title="Chọn gói dịch vụ">
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin />
        </div>
      ) : (
        <List
          dataSource={(packages as PackageDto[]) || []}
          renderItem={(p: any) => (
            <List.Item>
              <Card style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {p.name}{" "}
                      <Tag color="green">
                        {p.price === 0 ? "Miễn phí" : p.price.toLocaleString() + "đ"}
                      </Tag>
                    </div>
                    <div style={{ color: "#666" }}>{p.description}</div>
                    {p.features && Array.isArray(p.features) && (
                      <div style={{ marginTop: 6 }}>
                        {p.features.map((f: string, idx: number) => (
                          <Tag key={idx}>{f}</Tag>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Button
                      type="primary"
                      loading={(purchaseMutation as any).isLoading && current?.id === p.id}
                      onClick={() => {
                        setCurrent(p);
                        setQrOpen(true);
                      }}
                    >
                      Đăng ký
                    </Button>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}

      <QrPaymentModal
        open={qrOpen}
        method={"momo"}
        amount={current?.price || 0}
        onClose={() => setQrOpen(false)}
        onConfirmPaid={handleConfirm}
      />
    </Modal>
  );
}
