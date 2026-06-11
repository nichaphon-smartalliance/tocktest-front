"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  Card,
  Alert,
  Chip,
  Select,
  ListBox,
  Spinner,
} from "@heroui/react";
import { Bot, GitBranch, Zap } from "lucide-react";
import { message } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/api-error";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import { useCommitList } from "@/hooks/analysis";
import type { CommitItem, RiskLevel } from "@/types/app/analysis";

dayjs.extend(relativeTime);
dayjs.locale("th");

const RISK_CONFIG: Record<RiskLevel, { color: "success" | "warning" | "danger" | "accent"; label: string }> = {
  low: { color: "success", label: "ต่ำ" },
  medium: { color: "warning", label: "กลาง" },
  high: { color: "danger", label: "สูง" },
  critical: { color: "danger", label: "วิกฤต" },
};

interface AnalysisContentProps {
  repoId: string;
}

export default function AnalysisContent({ repoId }: AnalysisContentProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const {
    commits,
    total,
    isLoading,
    branches,
    branchesLoading,
    analyze,
    getWhatToTest,
    whatToTestResult,
    isLoadingWhatToTest,
  } = useCommitList(repoId, { pageSize: 30, branch: selectedBranch ?? undefined });

  useEffect(() => {
    setSelected(new Set());
  }, [selectedBranch]);

  // Auto-select first branch — avoids slow DB-only path and loads commits immediately
  useEffect(() => {
    if (!selectedBranch && branches.length > 0) {
      setSelectedBranch(branches[0].name);
    }
  }, [branches, selectedBranch]);

  const selectedShas = useMemo(() => Array.from(selected), [selected]);
  const allSelected = commits.length > 0 && commits.every((c) => selected.has(c.commitSha));

  const toggleOne = (sha: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sha)) next.delete(sha);
      else next.add(sha);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(commits.map((c) => c.commitSha)));
  };

  const handleAnalyze = async (commitSha: string) => {
    setAnalyzingIds((prev) => new Set(prev).add(commitSha));
    try {
      const result = await analyze(commitSha);
      message.success(
        result?.source === "heuristic"
          ? "วิเคราะห์แบบ heuristic (AI offline)"
          : "วิเคราะห์ commit สำเร็จ"
      );
    } catch (error) {
      message.error(getApiErrorMessage(error, "วิเคราะห์ไม่สำเร็จ กรุณาตรวจสอบ GitHub Token"));
    } finally {
      setAnalyzingIds((prev) => {
        const next = new Set(prev);
        next.delete(commitSha);
        return next;
      });
    }
  };

  const handleWhatToTest = async () => {
    if (selectedShas.length === 0) {
      message.warning("กรุณาเลือก commit ที่ต้องการวิเคราะห์");
      return;
    }
    try {
      const result = await getWhatToTest(selectedShas);
      message.success(
        result?.source === "heuristic"
          ? "ได้คำแนะนำแบบ heuristic (AI offline)"
          : "ได้คำแนะนำจาก AI สำเร็จ"
      );
    } catch (error) {
      message.error(getApiErrorMessage(error, "เกิดข้อผิดพลาดในการเชื่อมต่อ AI service"));
    }
  };

  const renderRisk = (v: RiskLevel | null) =>
    v && RISK_CONFIG[v] ? (
      <Chip color={RISK_CONFIG[v].color} size="sm" variant="soft">
        <Chip.Label>{RISK_CONFIG[v].label}</Chip.Label>
      </Chip>
    ) : (
      <Chip size="sm" variant="soft">
        <Chip.Label>ยังไม่วิเคราะห์</Chip.Label>
      </Chip>
    );

  const renderAction = (record: CommitItem) => {
    const isAnalyzed = !!record.analyzedAt;
    const isAnalyzing = analyzingIds.has(record.commitSha);

    const analyzeBtn = (label?: string) => (
      <button
        type="button"
        disabled={isAnalyzing}
        onClick={(e) => {
          e.stopPropagation();
          handleAnalyze(record.commitSha);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] cursor-pointer hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
      >
        {isAnalyzing ? <Spinner size="sm" color="current" /> : <Bot size={14} />}
        {label}
      </button>
    );

    if (!isAnalyzed) return analyzeBtn("วิเคราะห์");

    const analyzedTitle = record.analyzedAt
      ? `วิเคราะห์เมื่อ ${dayjs(record.analyzedAt).fromNow()}`
      : "วิเคราะห์สำเร็จแล้ว";

    return (
      <div className="flex flex-col items-start gap-1.5 min-w-[100px]">
        <Chip color="success" size="sm" variant="soft" title={analyzedTitle}>
          <Chip.Label>วิเคราะห์แล้ว</Chip.Label>
        </Chip>
        <button
          type="button"
          disabled={isAnalyzing}
          title="วิเคราะห์อีกครั้ง"
          onClick={(e) => {
            e.stopPropagation();
            handleAnalyze(record.commitSha);
          }}
          className="inline-flex items-center gap-1 text-xs text-muted cursor-pointer hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? <Spinner size="sm" color="current" /> : <Bot size={12} />}
          อีกครั้ง
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <Card.Content className="flex flex-wrap items-center gap-3 p-4">
          <GitBranch className="size-5 text-sky-500 shrink-0" />
          <div className="flex-1 min-w-[200px]">
            <p className="font-semibold text-sm">เลือก Branch</p>
            <p className="text-xs text-muted">ระบบจะดึง commits จาก branch นี้</p>
          </div>
          <Select
            className="min-w-[200px]"
            placeholder="เลือก branch..."
            selectedKey={selectedBranch}
            onSelectionChange={(key) => setSelectedBranch(key ? String(key) : null)}
            isDisabled={branchesLoading}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {(branches ?? []).map((b) => (
                  <ListBox.Item key={b.name} id={b.name} textValue={b.name}>
                    {b.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </Card.Content>
      </Card>

      <Card>
        <Card.Content className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Zap className="size-5 text-indigo-500 shrink-0" />
            <div className="flex-1 min-w-[200px]">
              <p className="font-semibold text-sm">ควรทดสอบอะไรหลังจาก commits เหล่านี้?</p>
              <p className="text-xs text-muted">เลือก commit จากตารางแล้วถาม AI</p>
            </div>
            <button
              type="button"
              disabled={selectedShas.length === 0 || isLoadingWhatToTest}
              onClick={handleWhatToTest}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingWhatToTest ? <Spinner size="sm" color="current" /> : <Bot size={16} />}
              ถาม AI ({selectedShas.length} commits)
            </button>
          </div>

          {whatToTestResult && (
            <Alert status="accent" className="mt-3">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>คำแนะนำจาก AI</Alert.Title>
                <Alert.Description>
                  {whatToTestResult.recommendations?.length > 0 ? (
                    <ul className="mt-1 list-disc pl-5 text-sm">
                      {whatToTestResult.recommendations.map((r, i) => (
                        <li key={i} className="mb-1">
                          {r}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-muted">ไม่มีคำแนะนำที่ระบุแน่ชัด</span>
                  )}
                  {whatToTestResult.reasoning && (
                    <p className="mt-2 text-xs text-muted">
                      <strong>เหตุผล:</strong> {whatToTestResult.reasoning}
                    </p>
                  )}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Content className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : !selectedBranch ? (
            <div className="flex flex-col items-center py-16 text-center px-4">
              <GitBranch size={48} className="opacity-20 mb-4 text-sky-500" />
              <p className="font-medium mb-1">เลือก branch เพื่อดู commits</p>
              <p className="text-sm text-muted max-w-sm">
                ใช้ตัวเลือก branch ด้านบน ระบบจะดึง commits จาก GitHub และแสดงความเสี่ยง / AI summary
              </p>
            </div>
          ) : commits.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-4">
              <GitBranch size={48} className="opacity-20 mb-4" />
              <p className="font-medium mb-1">ไม่พบ commits ใน branch นี้</p>
              <p className="text-sm text-muted">ลองเปลี่ยน branch หรือตรวจสอบ GitHub Token</p>
            </div>
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Commits analysis table" className="min-w-[800px]">
                  <Table.Header>
                    <Table.Column className="w-10 pr-0">
                      <input
                        type="checkbox"
                        aria-label="Select all"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="size-4 cursor-pointer accent-sky-600"
                      />
                    </Table.Column>
                    <Table.Column isRowHeader>Commit</Table.Column>
                    <Table.Column>การเปลี่ยนแปลง</Table.Column>
                    <Table.Column>ความเสี่ยง</Table.Column>
                    <Table.Column>AI Summary</Table.Column>
                    <Table.Column className="min-w-[110px] w-[110px]" />
                  </Table.Header>
                  <Table.Body>
                    {commits.map((record) => (
                      <Table.Row key={record.commitSha} id={record.commitSha}>
                        <Table.Cell className="pr-0">
                          <input
                            type="checkbox"
                            aria-label={`Select ${record.commitSha.slice(0, 7)}`}
                            checked={selected.has(record.commitSha)}
                            onChange={() => toggleOne(record.commitSha)}
                            className="size-4 cursor-pointer accent-sky-600"
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <div className="font-mono text-xs text-muted">{record.commitSha.slice(0, 7)}</div>
                          <div className="font-medium text-sm">{record.commitMessage ?? "(no message)"}</div>
                          <div className="text-xs text-muted">
                            {record.authorName ?? "unknown"}
                            {record.committedAt ? ` · ${dayjs(record.committedAt).fromNow()}` : ""}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="text-xs">{record.filesChanged} ไฟล์</div>
                          <div className="flex gap-1 text-xs">
                            <span className="text-green-600">+{record.additions}</span>
                            <span className="text-red-600">-{record.deletions}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>{renderRisk(record.riskLevel)}</Table.Cell>
                        <Table.Cell>
                          {record.aiSummary ? (
                            <p className="text-xs line-clamp-2">{record.aiSummary}</p>
                          ) : (
                            <span className="text-xs text-muted">ยังไม่มี AI summary</span>
                          )}
                        </Table.Cell>
                        <Table.Cell>{renderAction(record)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
              <Table.Footer>
                <p className="px-4 py-2 text-xs text-muted">{total} commits</p>
              </Table.Footer>
            </Table>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
