"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button, SearchField, Select, ListBox } from "@heroui/react";
import { Plus, Bot, Download } from "lucide-react";
import { getTestCasesExportUrl } from "@/lib/api/api-main";
import FolderTree from "./FolderTree";
import TestCaseTable from "./TestCaseTable";
import AiGenerateModal from "./Modal/AiGenerateModal";

const TestCaseModal = dynamic(() => import("./Modal/TestCaseModal"), { ssr: false });
import { useTestCaseList } from "@/hooks/testCase";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { message } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/api-error";
import type { TestCase, ModalMode, TestCaseFormValues, TestStatus, TestType, PriorityLevel } from "@/types/app/testCase";

const ALL = "__all__";

const STATUS_OPTIONS = [
  { value: ALL, label: "ทุกสถานะ" },
  { value: "not_tested", label: "ยังไม่ทดสอบ" },
  { value: "pass", label: "ผ่าน" },
  { value: "fail", label: "ไม่ผ่าน" },
  { value: "blocked", label: "ติดขัด" },
];

const PRIORITY_OPTIONS = [
  { value: ALL, label: "ทุกความสำคัญ" },
  { value: "low", label: "ต่ำ" },
  { value: "medium", label: "กลาง" },
  { value: "high", label: "สูง" },
  { value: "critical", label: "วิกฤต" },
];

const TYPE_OPTIONS = [
  { value: ALL, label: "ทุกประเภท" },
  { value: "manual", label: "Manual" },
  { value: "automated", label: "Automated" },
  { value: "ui", label: "UI" },
  { value: "api", label: "API" },
  { value: "integration", label: "Integration" },
];

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
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState<TestStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | undefined>();
  const [typeFilter, setTypeFilter] = useState<TestType | undefined>();

  const { testCases, total, isLoading, create, isCreating, update, isUpdating, remove, refetch } =
    useTestCaseList(repoId, {
      folderId: selectedFolderId ?? undefined,
      status: statusFilter,
      testType: typeFilter,
      priority: priorityFilter,
      search: debouncedSearch || undefined,
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
    try {
      await remove(id);
      message.success("ลบ test case สำเร็จ");
    } catch (error) {
      message.error(getApiErrorMessage(error, "ลบไม่สำเร็จ"));
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:h-[calc(100vh-200px)]">
      <div className="w-full md:w-[200px] shrink-0 max-h-48 md:max-h-none rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto md:overflow-hidden">
        <FolderTree
          repoId={repoId}
          selectedFolderId={selectedFolderId}
          onSelectFolder={(id) => {
            setSelectedFolderId(id);
            setPage(1);
          }}
        />
      </div>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchField
            aria-label="ค้นหา test case"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            className="w-[200px]"
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="ค้นหา..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>

          <Select
            placeholder="สถานะ"
            selectedKey={statusFilter ?? null}
            onSelectionChange={(key) => {
              setStatusFilter(key && key !== ALL ? (String(key) as TestStatus) : undefined);
              setPage(1);
            }}
            className="w-[140px]"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {STATUS_OPTIONS.map((o) => (
                  <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
                    {o.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          <Select
            placeholder="ความสำคัญ"
            selectedKey={priorityFilter ?? null}
            onSelectionChange={(key) => {
              setPriorityFilter(key && key !== ALL ? (String(key) as PriorityLevel) : undefined);
              setPage(1);
            }}
            className="w-[140px]"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {PRIORITY_OPTIONS.map((o) => (
                  <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
                    {o.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          <Select
            placeholder="ประเภท"
            selectedKey={typeFilter ?? null}
            onSelectionChange={(key) => {
              setTypeFilter(key && key !== ALL ? (String(key) as TestType) : undefined);
              setPage(1);
            }}
            className="w-[140px]"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {TYPE_OPTIONS.map((o) => (
                  <ListBox.Item key={o.value} id={o.value} textValue={o.label}>
                    {o.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          <div className="flex-1" />
          <Button
            variant="secondary"
            size="sm"
            onPress={() => {
              const url = getTestCasesExportUrl(repoId, "playwright");
              const a = document.createElement("a");
              a.href = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4004") + url;
              a.download = "";
              a.click();
            }}
          aria-label="Export as Playwright .spec.ts"
          >
            <Download size={14} />
            Export Playwright
          </Button>
          <Button variant="secondary" onPress={() => setAiModalOpen(true)}>
            <Bot size={16} />
            สร้างด้วย AI
          </Button>
          <Button variant="primary" onPress={openCreate}>
            <Plus size={16} />
            Test Case ใหม่
          </Button>
        </div>

        <TestCaseTable
          repoId={repoId}
          testCases={testCases}
          total={total}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          onPageChange={(p, s) => {
            setPage(p);
            setPageSize(s);
          }}
          onEdit={openEdit}
          onDelete={handleDelete}
          onStatusChange={(id, status) => handleUpdate(id, { status })}
          onPriorityChange={(id, priority) => handleUpdate(id, { priority })}
          onTypeChange={(id, testType) => handleUpdate(id, { testType })}
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
