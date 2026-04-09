import { Skeleton, Table } from "antd";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export default function TableSkeleton({ columns = 5, rows = 5 }: TableSkeletonProps) {
  const dataSource = Array.from({ length: rows }).map((_, i) => ({
    key: i,
  }));

  const tableColumns = Array.from({ length: columns }).map((_, i) => ({
    title: <Skeleton.Input active style={{ width: "100%" }} />,
    dataIndex: `col${i}`,
    key: `col${i}`,
    render: () => <Skeleton.Input active style={{ width: "100%" }} />,
  }));

  return (
    <Table
      columns={tableColumns}
      dataSource={dataSource}
      pagination={false}
      loading={false}
    />
  );
}
