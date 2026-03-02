import { Button, Card, Divider, Space, Typography } from "antd";
import { useState } from "react";
import NarrationEditor from "../../components/owner/NarrationEditor";
import LocationEditor from "../../components/owner/LocationEditor";
import PackageSelector from "../../components/owner/PackageSelector";
import { useGetCurrentUser } from "@/hooks/user";
import { useMySubscription } from "@/hooks/subscription";

const { Title, Text } = Typography;

export default function OwnerDashboard() {
  const { data: user } = useGetCurrentUser();
  const { data: mySub } = useMySubscription();
  const [showNarration, setShowNarration] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showPackages, setShowPackages] = useState(false);

  const shopName = (user?.customer as any)?.shopName || "Chưa có tên quán";
  const shopLocation = (user?.customer as any)?.shopLocation || "Chưa có địa chỉ";
  const narration = (user?.customer as any)?.narrationContent || "Chưa có nội dung thuyết minh";

  const subscriptionName =
    (mySub as any)?.packageName || (user?.customer as any)?.subscription?.name || "Chưa đăng ký";
  const expiresAt = (mySub as any)?.expiresAt || (user?.customer as any)?.subscription_expires_at;
  const expirationText = expiresAt ? new Date(expiresAt).toLocaleDateString() : null;

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Bảng điều khiển chủ quán</Title>

      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        <Card title="Thông tin quán">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Text strong>{shopName}</Text>
              <div style={{ marginTop: 6 }}>
                <Text type="secondary">{shopLocation}</Text>
              </div>
            </div>

            <div>
              <Button onClick={() => setShowLocation(true)}>Chỉnh sửa vị trí</Button>
            </div>
          </div>
        </Card>

        <Card title="Nội dung thuyết minh">
          <div style={{ minHeight: 80 }}>
            <Text>{narration}</Text>
          </div>
          <Divider />
          <Button onClick={() => setShowNarration(true)}>Chỉnh sửa nội dung</Button>
        </Card>

        <Card title="Gói dịch vụ">
          <div>
            <Text>
              Gói hiện tại: <strong>{subscriptionName}</strong>
              {expirationText && (
                <span>
                  {' '} (hết hạn: <strong>{expirationText}</strong>)
                </span>
              )}
            </Text>
          </div>
          <Divider />
          <Button type="primary" onClick={() => setShowPackages(true)}>
            Quản lý gói đăng ký
          </Button>
        </Card>
      </Space>

      <NarrationEditor open={showNarration} onClose={() => setShowNarration(false)} initialValue={narration} />
      <LocationEditor open={showLocation} onClose={() => setShowLocation(false)} initialValue={shopLocation} />
      <PackageSelector open={showPackages} onClose={() => setShowPackages(false)} />
    </div>
  );
}
