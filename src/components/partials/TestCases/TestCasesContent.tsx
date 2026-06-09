"use client";

import { useState } from "react";
import { Button, Input } from "antd";
import { PlusOutlined, RobotOutlined, SearchOutlined } from "@ant-design/icons";
import FolderTree from "./FolderTree";
import TestCaseTable from "./TestCaseTable";
import { TestCaseModal, AiGenerateModal } from "./Modal";
import { useTestCaseList } from "@/hooks/testCase";
import { STATUS_CONFIG, TYPE_CONFIG } from "./TestCases.config";
import type { TestCase, ModalMode, TestCaseFormValues, TestStatus, TestType, PriorityLevel } from "@/types/app/testCase";

// Maps Ant Design tag color names → chip palette
const CHIP_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  green:    { bg: "#f6ffed", border: "#b7eb8f", text: "#389e0d" },
  red:      { bg: "#fff2f0", border: "#ffccc7", text: "#cf1322" },
  orange:   { bg: "#fff7e6", border: "#ffd591", text: "#d46b08" },
  default:  { bg: "#f5f5f5", border: "#d9d9d9", text: "#595959" },
  blue:     { bg: "#e6f4ff", border: "#91caff", text: "#0958d9" },
  purple:   { bg: "#f9f0ff", border: "#d3adf7", text: "#531dab" },
  cyan:     { bg: "#e6fffb", border: "#87e8de", text: "#08979c" },
  geekblue: { bg: "#f0f5ff", border: "#adc6ff", text: "#1d39c4" },
  magenta:  { bg: "#fff0f6", border: "#ffadd2", text: "#c41d7f" },
};

function Chip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const palette = color ? CHIP_COLORS[color] : undefined;

  const style = (() => {
    if (active && palette)  return { bg: palette.bg,  border: palette.border,  text: palette.text,  weight: 600 };
    if (active)             return { bg: "#111827",   border: "#111827",        text: "#ffffff",     weight: 600 };
    if (hovered)            return { bg: "#f3f4f6",   border: "#d1d5db",        text: "#374151",     weight: 400 };
    return                         { bg: "transparent", border: "#e5e7eb",      text: "#6b7280",     weight: 400 };
  })();

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "3px 11px",
        borderRadius: 20,
        border: `1px solid ${style.border}`,
        background: style.bg,
        color: style.text,
        fontSize: 12,
        fontWeight: style.weight,
        lineHeight: "18px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        outline: "none",
        userSelect: "none",
        transition: "background 0.12s, border-color 0.12s, color 0.12s",
      }}
    >
      {label}
    </button>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; color?: string }[];
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        minWidth: 44,
        flexShrink: 0,
      }}>
        {label}
      </span>
      <Chip
        label="ทั้งหมด"
        active={value === undefined}
        onClick={() => onChange(undefined)}
      />
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          active={value === opt.value}
          color={opt.color}
          onClick={() => onChange(opt.value)}
        />
      ))}
    </div>
  );
}

interface TestCasesContentProps {
  repoId: string;
}

export default function TestCasesContent({ repoId }: TestCasesContentProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editTarget, setEditTarget] = useState<TestCase | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TestStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<TestType | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | undefined>();

  const { testCases, total, isLoading, create, isCreating, update, isUpdating, remove, refetch } =
    useTestCaseList(repoId, {
      folderId: selectedFolderId ?? undefined,
      status: statusFilter,
      testType: typeFilter,
      priority: priorityFilter,
      search: search || undefined,
      page,
      pageSize,
    });

  const openCreate = () => {
    setEditTarget(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (tc: TestCase) => {
    setEditTarget(tc);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCreate = async (values: TestCaseFormValues) => {
    await create({ ...values, folderId: selectedFolderId ?? undefined });
  };

  const handleUpdate = async (id: string, values: Partial<TestCaseFormValues>) => {
    await update({ id, values });
  };

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  const statusOptions = Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label,
    color: cfg.color,
  }));

  const typeOptions = Object.entries(TYPE_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label,
    color: cfg.color,
  }));

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 200px)" }}>
      {/* Folder sidebar */}
      <div
        style={{
          width: 200,
          flexShrink: 0,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          backgroundColor: "inherit",
        }}
      >
        <FolderTree
          repoId={repoId}
          selectedFolderId={selectedFolderId}
          onSelectFolder={(id) => {
            setSelectedFolderId(id);
            setPage(1);
          }}
        />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Action row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Input
              placeholder="ค้นหา..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: 200 }}
              allowClear
            />
            <div style={{ flex: 1 }} />
            <Button
              icon={<RobotOutlined />}
              onClick={() => setAiModalOpen(true)}
              style={{ borderColor: "#6366f1", color: "#6366f1" }}
            >
              สร้างด้วย AI
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Test Case ใหม่
            </Button>
          </div>

          {/* Filter rows */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: "8px 10px",
              background: "#fafafa",
              border: "1px solid #f0f0f0",
              borderRadius: 8,
            }}
          >
            <FilterRow
              label="สถานะ"
              options={statusOptions}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v as TestStatus | undefined); setPage(1); }}
            />
            <div style={{ height: 1, background: "#f0f0f0" }} />
            <FilterRow
              label="ประเภท"
              options={typeOptions}
              value={typeFilter}
              onChange={(v) => { setTypeFilter(v as TestType | undefined); setPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        <TestCaseTable
          repoId={repoId}
          testCases={testCases}
          total={total}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          onPageChange={(p, s) => { setPage(p); setPageSize(s); }}
          onEdit={openEdit}
          onDelete={handleDelete}
          onStatusChange={(id, status) => handleUpdate(id, { status })}
        />
      </div>

      <TestCaseModal
        open={modalOpen}
        mode={modalMode}
        repoId={repoId}
        folderId={selectedFolderId}
        data={editTarget}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        isLoading={isCreating || isUpdating}
      />

      <AiGenerateModal
        repoId={repoId}
        folderId={selectedFolderId}
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onSaved={refetch}
      />
    </div>
  );
}
