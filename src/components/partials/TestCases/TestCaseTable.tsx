"use client";

import { Table, Tag, Button, Popconfirm, Tooltip, Badge, Space } from "antd";
import { EditOutlined, DeleteOutlined, RobotOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import type { TestCase } from "@/types/app/testCase";
import { STATUS_CONFIG, TYPE_CONFIG, PRIORITY_CONFIG } from "./TestCases.config";

dayjs.extend(relativeTime);
dayjs.locale("th");

interface TestCaseTableProps {
  repoId: string;
  testCases: TestCase[];
  total: number;
  isLoading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, size: number) => void;
  onEdit: (tc: TestCase) => void;
  onDelete: (id: string) => void;
}

export default function TestCaseTable({
  testCases,
  total,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
}: TestCaseTableProps) {
  const columns: ColumnsType<TestCase> = [
    {
      title: "ชื่อ Test Case",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: TestCase) => (
        <Space>
          {record.isAiGenerated && (
            <Tooltip title="สร้างด้วย AI">
              <RobotOutlined style={{ color: "#6366f1", fontSize: 12 }} />
            </Tooltip>
          )}
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: keyof typeof STATUS_CONFIG) => {
        const cfg = STATUS_CONFIG[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: "ความสำคัญ",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (p: keyof typeof PRIORITY_CONFIG) => {
        const cfg = PRIORITY_CONFIG[p];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: "ประเภท",
      dataIndex: "testType",
      key: "testType",
      width: 110,
      render: (t: keyof typeof TYPE_CONFIG) => {
        const cfg = TYPE_CONFIG[t];
        return (
          <Tag color={cfg.color} style={{ fontSize: 11 }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "อัปเดต",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 110,
      render: (v: string) => (
        <Tooltip title={dayjs(v).format("DD/MM/YYYY HH:mm")}>
          <span style={{ opacity: 0.5, fontSize: 12 }}>{dayjs(v).fromNow()}</span>
        </Tooltip>
      ),
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_: unknown, record: TestCase) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="ลบ test case นี้?"
            onConfirm={() => onDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={testCases}
      rowKey="id"
      loading={isLoading}
      size="middle"
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (t) => `ทั้งหมด ${t} รายการ`,
        onChange: onPageChange,
      }}
      locale={{ emptyText: "ยังไม่มี test case ในโฟลเดอร์นี้" }}
    />
  );
}
