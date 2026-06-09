"use client";

import { useState } from "react";
import { Button, Segmented, Input } from "antd";
import { PlusOutlined, RobotOutlined, SearchOutlined } from "@ant-design/icons";
import FolderTree from "./FolderTree";
import TestCaseTable from "./TestCaseTable";
import { TestCaseModal, AiGenerateModal } from "./Modal";
import { useTestCaseList } from "@/hooks/testCase";
import type { TestCase, ModalMode, TestCaseFormValues, TestStatus, TestType, PriorityLevel } from "@/types/app/testCase";

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
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#6b7280", flexShrink: 0 }}>สถานะ</span>
              <Segmented
                size="small"
                value={statusFilter ?? "all"}
                onChange={(v) => { setStatusFilter(v === "all" ? undefined : v as TestStatus); setPage(1); }}
                options={[
                  { value: "all", label: "ทั้งหมด" },
                  { value: "not_tested", label: "ยังไม่ทดสอบ" },
                  { value: "pass", label: "ผ่าน" },
                  { value: "fail", label: "ไม่ผ่าน" },
                  { value: "blocked", label: "ติดขัด" },
                ]}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#6b7280", flexShrink: 0 }}>ประเภท</span>
              <Segmented
                size="small"
                value={typeFilter ?? "all"}
                onChange={(v) => { setTypeFilter(v === "all" ? undefined : v as TestType); setPage(1); }}
                options={[
                  { value: "all", label: "ทั้งหมด" },
                  { value: "manual", label: "Manual" },
                  { value: "automated", label: "Auto" },
                  { value: "ui", label: "UI" },
                  { value: "api", label: "API" },
                  { value: "integration", label: "Integration" },
                ]}
              />
            </div>
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
