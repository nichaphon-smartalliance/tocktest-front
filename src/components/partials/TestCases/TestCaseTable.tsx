"use client";

import {
  Table,
  Button,
  Tooltip,
  Spinner,
  Pagination,
} from "@heroui/react";
import { message } from "@/lib/toast";
import { Pencil, Trash2, Bot } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import type { TestCase, TestStatus, TestType, PriorityLevel } from "@/types/app/testCase";
import { STATUS_CONFIG, TYPE_CONFIG, PRIORITY_CONFIG } from "./TestCases.config";
import { InlineChipPicker, configToChipOptions } from "./InlineChipPicker";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : testCases.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center px-4">
          <p className="font-medium mb-1">ยังไม่มี test case</p>
          <p className="text-sm text-muted max-w-xs">
            กด &quot;Test Case ใหม่&quot; เพื่อสร้างเอง หรือ &quot;สร้างด้วย AI&quot; ให้ระบบช่วยร่าง
          </p>
        </div>
      ) : (
        <Table className="flex-1">
          <Table.ScrollContainer>
            <Table.Content aria-label="Test cases" className="min-w-[700px]">
              <Table.Header>
                <Table.Column isRowHeader>ชื่อ Test Case</Table.Column>
                <Table.Column className="w-[130px]">สถานะ</Table.Column>
                <Table.Column className="w-[120px]">ความสำคัญ</Table.Column>
                <Table.Column className="w-[120px]">ประเภท</Table.Column>
                <Table.Column className="w-[110px]">อัปเดต</Table.Column>
                <Table.Column className="w-[80px]" />
              </Table.Header>
              <Table.Body>
                {testCases.map((record) => (
                  <Table.Row key={record.id} id={record.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        {record.isAiGenerated && (
                          <Tooltip>
                            <Tooltip.Trigger>
                              <Bot size={12} className="text-indigo-500 shrink-0" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>สร้างด้วย AI</Tooltip.Content>
                          </Tooltip>
                        )}
                        <span className="font-medium">{record.title}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <InlineChipPicker
                        value={record.status}
                        options={configToChipOptions(STATUS_CONFIG)}
                        ariaLabel="เปลี่ยนสถานะ"
                        errorMsg="อัปเดตสถานะไม่สำเร็จ"
                        onChange={(status) => onStatusChange(record.id, status)}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <InlineChipPicker
                        value={record.priority}
                        options={configToChipOptions(PRIORITY_CONFIG)}
                        ariaLabel="เปลี่ยนความสำคัญ"
                        errorMsg="อัปเดตความสำคัญไม่สำเร็จ"
                        onChange={(priority) => onPriorityChange(record.id, priority)}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <InlineChipPicker
                        value={record.testType}
                        options={configToChipOptions(TYPE_CONFIG)}
                        ariaLabel="เปลี่ยนประเภท"
                        errorMsg="อัปเดตประเภทไม่สำเร็จ"
                        onChange={(testType) => onTypeChange(record.id, testType)}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Tooltip>
                        <Tooltip.Trigger>
                          <span className="text-xs text-muted">
                            {dayjs(record.updatedAt).fromNow()}
                          </span>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          {dayjs(record.updatedAt).format("DD/MM/YYYY HH:mm")}
                        </Tooltip.Content>
                      </Tooltip>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          isIconOnly
                          size="sm"
                          aria-label="แก้ไข"
                          className="text-[var(--text-primary)]"
                          onPress={() => onEdit(record)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <ConfirmDialog
                          title="ลบ test case นี้?"
                          confirmLabel="ลบ"
                          confirmVariant="danger"
                          onConfirm={() => onDelete(record.id)}
                          trigger={
                            <Button variant="ghost" isIconOnly size="sm" aria-label="ลบ test case">
                              <Trash2 size={14} className="text-red-500" />
                            </Button>
                          }
                        />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
          <Table.Footer>
            <div className="flex items-center justify-between px-4 py-2">
              <p className="text-xs text-muted">ทั้งหมด {total} รายการ</p>
              <Pagination>
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.Previous
                      isDisabled={page <= 1}
                      onPress={() => onPageChange(page - 1, pageSize)}
                    >
                      <Pagination.PreviousIcon />
                    </Pagination.Previous>
                  </Pagination.Item>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <Pagination.Item key={p}>
                        <Pagination.Link
                          isActive={p === page}
                          onPress={() => onPageChange(p, pageSize)}
                        >
                          {p}
                        </Pagination.Link>
                      </Pagination.Item>
                    );
                  })}
                  <Pagination.Item>
                    <Pagination.Next
                      isDisabled={page >= totalPages}
                      onPress={() => onPageChange(page + 1, pageSize)}
                    >
                      <Pagination.NextIcon />
                    </Pagination.Next>
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            </div>
          </Table.Footer>
        </Table>
      )}
    </div>
  );
}
