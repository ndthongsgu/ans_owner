import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Select } from "antd";
import { categoryOptions, priceOptions } from "@/constants/stall.constants";

type StallFiltersProps = {
  keyword: string;
  filterCategory: string;
  filterPriceRange: string;
  onKeywordChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriceRangeChange: (value: string) => void;
  onReset: () => void;
};

export default function StallFilters({
  keyword,
  filterCategory,
  filterPriceRange,
  onKeywordChange,
  onCategoryChange,
  onPriceRangeChange,
  onReset,
}: StallFiltersProps) {
  return (
    <Card className="owner-store-filter-card">
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} md={10}>
          <Input
            size="large"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên quán hoặc địa chỉ"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            size="large"
            value={filterCategory}
            options={[
              { label: "Tất cả danh mục", value: "all" },
              ...categoryOptions,
            ]}
            onChange={onCategoryChange}
            suffixIcon={<FilterOutlined />}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            size="large"
            value={filterPriceRange}
            options={[
              { label: "Tất cả mức giá", value: "all" },
              ...priceOptions,
            ]}
            onChange={onPriceRangeChange}
            suffixIcon={<FilterOutlined />}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} md={2}>
          <Button block size="large" onClick={onReset}>
            Reset
          </Button>
        </Col>
      </Row>
    </Card>
  );
}
