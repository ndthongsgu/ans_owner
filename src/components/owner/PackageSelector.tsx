import { Button, Card, List, Modal, Tag } from "antd";
import { useState } from "react";
import QrPaymentModal from "@/components/payment/QrPaymentModal";

const packages = [
  { id: "free", name: "Miễn phí", price: 0, description: "Dùng thử cơ bản" },
  { id: "basic", name: "Cơ bản", price: 49000, description: "Gói hàng tháng" },
  { id: "pro", name: "Pro", price: 99000, description: "Gói nâng cao" },
];

export default function PackageSelector({ open, onClose }: any) {
  const [current, setCurrent] = useState<any>(null);
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={640} title="Chọn gói dịch vụ">
      <List
        dataSource={packages}
        renderItem={(p) => (
          <List.Item>
            <Card style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name} <Tag color="green">{p.price === 0 ? "Miễn phí" : p.price.toLocaleString() + 'đ'}</Tag></div>
                  <div style={{ color: '#666' }}>{p.description}</div>
                </div>
                <div>
                  <Button type="primary" onClick={() => { setCurrent(p); setQrOpen(true); }}>
                    Đăng ký
                  </Button>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />

      <QrPaymentModal
        open={qrOpen}
        method={"momo"}
        amount={current?.price || 0}
        onClose={() => setQrOpen(false)}
        onConfirmPaid={() => {
          // TODO: call backend to attach subscription to user
          setQrOpen(false);
          onClose();
        }}
      />
    </Modal>
  );
}
