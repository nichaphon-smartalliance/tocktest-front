"use client";

import { memo, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button, Pagination, Spinner, Table, Tooltip } from "@heroui/react";
import { Pencil, Trash2, Bot } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import type { TestCase, TestStatus, TestType, PriorityLevel } from "@/types/app/testCase";
import { STATUS_CONFIG, TYPE_CONFIG, PRIORITY_CONFIG } from "./TestCases.config";
import { CHIP_PICKER_WIDTH, configToChipOptions, InlineChipPicker } from "./InlineChipPicker";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

dayjs.extend(relativeTime);

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

interface TestCaseRowProps {
  record: TestCase;
  
  onEdit: (tc: TestCase) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TestStatus) => Promise<void>;
  onPriorityChange: (id: string, priority: PriorityLevel) => Promise<void>;
  onTypeChange: (id: string, testType: TestType) => Promise<void>;
}

const STATUS_CHIP_OPTIONS = configToChipOptions(STATUS_CONFIG);
const PRIORITY_CHIP_OPTIONS = configToChipOptions(PRIORITY_CONFIG);
const TYPE_CHIP_OPTIONS = configToChipOptions(TYPE_CONFIG);

const TestCaseRow = memo(function TestCaseRow({
  record,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onTypeChange,
}: TestCaseRowProps) {
  const t = useTranslations("testCases");
  const locale = useLocale();
  const statusOptions = useMemo(
    () => STATUS_CHIP_OPTIONS.map((o) => ({ value: o.value, color: o.color, label: t(o.labelKey) })),
    [t],
  );
  const priorityOptions = useMemo(
    () => PRIORITY_CHIP_OPTIONS.map((o) => ({ value: o.value, color: o.color, label: t(o.labelKey) })),
    [t],
  );
  const typeOptions = useMemo(
    () => TYPE_CHIP_OPTIONS.map((o) => ({ value: o.value, color: o.color, label: t(o.labelKey) })),
    [t],
  );
  return (
    <Table.Row id={record.id}>
      <Table.Cell>
        <div className="flex items-center gap-2">
          {record.isAiGenerated && (
            <Tooltip>
              <Tooltip.Trigger>
                <Bot size={12} className="text-indigo-500 shrink-0" />
              </Tooltip.Trigger>
              <Tooltip.Content>{t("aiTooltip")}</Tooltip.Content>
            </Tooltip>
          )}
          <span className="font-medium">{record.title}</span>
        </div>
      </Table.Cell>
      <Table.Cell className="w-[130px]">
        <InlineChipPicker
          value={record.status}
          options={statusOptions}
          chipWidth={CHIP_PICKER_WIDTH.status}
          ariaLabel={t("changeStatus")}
          errorMsg={t("updateStatusError")}
          onChange={(status) => onStatusChange(record.id, status)}
        />
      </Table.Cell>
      <Table.Cell className="w-[120px]">
        <InlineChipPicker
          value={record.priority}
          options={priorityOptions}
          chipWidth={CHIP_PICKER_WIDTH.priority}
          ariaLabel={t("changePriority")}
          errorMsg={t("updatePriorityError")}
          onChange={(priority) => onPriorityChange(record.id, priority)}
        />
      </Table.Cell>
      <Table.Cell className="w-[130px]">
        <InlineChipPicker
          value={record.testType}
          options={typeOptions}
          chipWidth={CHIP_PICKER_WIDTH.type}
          ariaLabel={t("changeType")}
          errorMsg={t("updateTypeError")}
          onChange={(testType) => onTypeChange(record.id, testType)}
        />
      </Table.Cell>
      <Table.Cell>
        <Tooltip>
          <Tooltip.Trigger>
            <span className="text-xs text-muted whitespace-nowrap">{dayjs(record.updatedAt).locale(locale).fromNow()}</span>
          </Tooltip.Trigger>
          <Tooltip.Content>{dayjs(record.updatedAt).format("DD/MM/YYYY HH:mm")}</Tooltip.Content>
        </Tooltip>
      </Table.Cell>
      <Table.Cell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            isIconOnly
            size="sm"
            aria-label={t("delete")}
            className="text-[var(--text-primary)]"
            onPress={() => onEdit(record)}
          >
            <Pencil size={14} />
          </Button>
          <ConfirmDialog
            title={t("deleteConfirm")}
            confirmLabel={t("delete")}
            confirmVariant="danger"
            onConfirm={() => onDelete(record.id)}
            trigger={
              <Button variant="ghost" isIconOnly size="sm" aria-label={t("deleteAria")}>
                <Trash2 size={14} className="text-red-500" />
              </Button>
            }
          />
        </div>
      </Table.Cell>
    </Table.Row>
  );
});

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
  const t = useTranslations("testCases");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginationItems = useMemo(() => {
    const start = Math.max(1, page - 3);
    const end = Math.min(totalPages, page + 3);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : testCases.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center px-4">
          <p className="font-medium mb-1">{t("empty")}</p>
          <p className="text-sm text-muted max-w-xs">
            {t("emptyHint")}
          </p>
        </div>
      ) : (
        <Table className="flex-1">
          <Table.ScrollContainer>
            <Table.Content aria-label="Test cases" className="min-w-[760px] w-full table-fixed">
              <Table.Header>
                <Table.Column isRowHeader className="w-auto">{t("colName")}</Table.Column>
                <Table.Column className="w-[130px]">{t("colStatus")}</Table.Column>
                <Table.Column className="w-[120px]">{t("colPriority")}</Table.Column>
                <Table.Column className="w-[130px]">{t("colType")}</Table.Column>
                <Table.Column className="w-[110px]">{t("colUpdated")}</Table.Column>
                <Table.Column className="w-[80px]" />
              </Table.Header>
              <Table.Body>
                {testCases.map((record) => (
                  <TestCaseRow
                    key={record.id}
                    record={record}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onPriorityChange={onPriorityChange}
                    onTypeChange={onTypeChange}
                  />
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
          <Table.Footer>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] px-4 py-3">
              <p className="text-xs text-muted whitespace-nowrap">{t("totalItems", { count: total })}</p>
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
                  {paginationItems.map((pageNumber) => (
                    <Pagination.Item key={pageNumber}>
                      <Pagination.Link
                        isActive={pageNumber === page}
                        onPress={() => onPageChange(pageNumber, pageSize)}
                      >
                        {pageNumber}
                      </Pagination.Link>
                    </Pagination.Item>
                  ))}
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
