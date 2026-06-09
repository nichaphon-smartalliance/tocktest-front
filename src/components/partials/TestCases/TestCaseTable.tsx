"use client";

import { useState } from "react";
import { Table, Tag, Button, Popconfirm, Tooltip, Badge, Space, Dropdown } from "antd";
import { message } from "@/lib/antd-static";
import { EditOutlined, DeleteOutlined, RobotOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import type { TestCase, TestStatus, TestType, PriorityLevel } from "@/types/app/testCase";
import { STATUS_CONFIG, TYPE_CONFIG, PRIORITY_CONFIG } from "./TestCases.config";

dayjs.extend(relativeTime);
dayjs.locale("th");

function InlineTagCell<T extends string>({
  value,
  config,
  record,
  errorMsg,
  onChange,
}: {
  value: T;
  config: Record<string, { label: string; color: string }>;
  record: TestCase;
  errorMsg: string;
  onChange: (id: string, value: T) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const cfg = config[value];

  const handleSelect = async (v: T) => {
    if (v === value) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      await onChange(record.id, v);
    } catch {
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dropdown
      open={open}
      onOpenChange={(v) => { if (!loading) setOpen(v); }}
      trigger={["click"]}
      popupRender={() => (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            padding: 4,
            minWidth: 120,
          }}
        >
          {(Object.keys(config) as T[]).map((k) => (
            <div
              key={k}
              onClick={() => handleSelect(k)}
              style={{
                padding: "5px 10px",
                borderRadius: 5,
                cursor: "pointer",
                background: k === value ? "#f3f4f6" : "transparent",
              }}
            >
              <Tag color={config[k].color} style={{ margin: 0 }}>
                {config[k].label}
              </Tag>
            </div>
          ))}
        </div>
      )}
    >
      <Tag
        color={cfg.color}
        style={{ cursor: loading ? "wait" : "pointer", userSelect: "none", opacity: loading ? 0.6 : 1 }}
      >
        {cfg.label}
      </Tag>
    </Dropdown>
  );
}

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
  onStatusChange: (id: string, status: TestStatus) => Promise<void>;
  onPriorityChange: (id: string, priority: PriorityLevel) => Promise<void>;
  onTypeChange: (id: string, testType: TestType) => Promise<void>;
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
  onStatusChange,
  onPriorityChange,
  onTypeChange,
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
      width: 130,
      render: (status: TestStatus, record: TestCase) => (
        <InlineTagCell
          value={status}
          config={STATUS_CONFIG}
          record={record}
          errorMsg="อัปเดตสถานะไม่สำเร็จ"
          onChange={onStatusChange}
        />
      ),
    },
    {
      title: "ความสำคัญ",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (priority: PriorityLevel, record: TestCase) => (
        <InlineTagCell
          value={priority}
          config={PRIORITY_CONFIG}
          record={record}
          errorMsg="อัปเดตความสำคัญไม่สำเร็จ"
          onChange={onPriorityChange}
        />
      ),
    },
    {
      title: "ประเภท",
      dataIndex: "testType",
      key: "testType",
      width: 120,
      render: (testType: TestType, record: TestCase) => (
        <InlineTagCell
          value={testType}
          config={TYPE_CONFIG}
          record={record}
          errorMsg="อัปเดตประเภทไม่สำเร็จ"
          onChange={onTypeChange}
        />
      ),
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
