import { AppstoreAddOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Pagination, Tag, Typography } from "antd";
import type { StoreItem } from "../types";

const { Text: TypographyText } = Typography;

type StoreListProps = {
  filteredStores: StoreItem[];
  paginatedStores: StoreItem[];
  effectiveSelectedStoreId: string;
  effectiveCurrentPage: number;
  pageSize: number;
  onSelectStore: (storeId: string) => void;
  onOpenAddModal: () => void;
  onPaginationChange: (page: number, size: number) => void;
};

export default function StoreList({
  filteredStores,
  paginatedStores,
  effectiveSelectedStoreId,
  effectiveCurrentPage,
  pageSize,
  onSelectStore,
  onOpenAddModal,
  onPaginationChange,
}: StoreListProps) {
  return (
    <Card
      title="Danh sách quán của tôi"
      extra={
        <Button
          type="primary"
          icon={<AppstoreAddOutlined />}
          onClick={onOpenAddModal}
        >
          Thêm quán mới
        </Button>
      }
      className="owner-store-list-card"
    >
      <TypographyText type="secondary" className="store-result-count">
        Tìm thấy {filteredStores.length} quán phù hợp. Nhấn vào từng quán để mở
        form chi tiết.
      </TypographyText>

      {filteredStores.length === 0 ? (
        <Empty description="Không tìm thấy quán phù hợp bộ lọc" />
      ) : (
        <>
          <div className="store-card-grid">
            {paginatedStores.map((item) => {
              const isActive = effectiveSelectedStoreId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`store-card ${isActive ? "store-card-active" : ""}`}
                  onClick={() => onSelectStore(item.id)}
                >
                  <div className="store-card-cover-wrap">
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      className="store-card-cover"
                    />
                    <span className="store-card-category">{item.category}</span>
                  </div>

                  <div className="store-card-content">
                    <TypographyText strong className="store-card-name">
                      {item.name}
                    </TypographyText>
                    <TypographyText type="secondary" className="store-card-location">
                      {item.location}
                    </TypographyText>
                    <div className="store-card-meta">
                      <Tag color="gold">{item.priceRange}</Tag>
                      <Tag>
                        {item.openTime} - {item.closeTime}
                      </Tag>
                    </div>
                    <div className="store-card-meta store-card-meta-secondary">
                      <Tag bordered={false} color="geekblue">
                        #{item.id.replace("store-", "")}
                      </Tag>
                    </div>
                    <span className="store-card-action">
                      {isActive ? "Đang xem chi tiết" : "Nhấn để xem chi tiết"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="owner-store-pagination">
            <Pagination
              current={effectiveCurrentPage}
              pageSize={pageSize}
              total={filteredStores.length}
              showSizeChanger
              pageSizeOptions={["3", "6", "9", "12"]}
              onChange={onPaginationChange}
              showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} quán`}
            />
          </div>
        </>
      )}
    </Card>
  );
}
