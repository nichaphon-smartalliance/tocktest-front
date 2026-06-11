"use client";

import { useState, useEffect, useMemo } from "react";
import type { Selection } from "@heroui/react";
import {
  Table,
  Card,
  Button,
  Alert,
  Chip,
  Select,
  ListBox,
  Checkbox,
  Spinner,
  Tooltip,
} from "@heroui/react";
import { Bot, GitBranch, Zap } from "lucide-react";
import { message } from "@/lib/toast";
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
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
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
    setSelectedKeys(new Set());
  }, [selectedBranch]);

  const selectedShas = useMemo(() => {
    if (selectedKeys === "all") return commits.map((c) => c.commitSha);
    return Array.from(selectedKeys as Set<string>);
  }, [selectedKeys, commits]);

  const handleAnalyze = async (commitSha: string) => {
    setAnalyzingIds((prev) => new Set(prev).add(commitSha));
    try {
      await analyze(commitSha);
      message.success("วิเคราะห์ commit สำเร็จ");
    } catch (error) {
      console.error("Analyze error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || "วิเคราะห์ไม่สำเร็จ กรุณาตรวจสอบ GitHub Token");
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
      await getWhatToTest(selectedShas);
      message.success("ได้คำแนะนำจาก AI สำเร็จ");
    } catch (error) {
      console.error("What to test error:", error);
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ AI service");
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

    if (!isAnalyzed) {
      return (
        <Button
          size="sm"
          variant="secondary"
          isDisabled={isAnalyzing}
          onPress={() => handleAnalyze(record.commitSha)}
        >
          {isAnalyzing ? <Spinner size="sm" color="current" /> : <Bot size={14} />}
          วิเคราะห์
        </Button>
      );
    }

    return (
      <Tooltip>
        <Tooltip.Trigger>
          <Chip color="success" size="sm" variant="soft">
            <Chip.Label>วิเคราะห์แล้ว</Chip.Label>
          </Chip>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {record.analyzedAt
            ? `วิเคราะห์เมื่อ ${dayjs(record.analyzedAt).fromNow()}`
            : "วิเคราะห์สำเร็จแล้ว"}
        </Tooltip.Content>
      </Tooltip>
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
            <Button
              variant="primary"
              isDisabled={selectedShas.length === 0 || isLoadingWhatToTest}
              onPress={handleWhatToTest}
            >
              {isLoadingWhatToTest ? <Spinner size="sm" color="current" /> : <Bot size={16} />}
              ถาม AI ({selectedShas.length} commits)
            </Button>
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
          ) : (
            <Table>
              <Table.ScrollContainer>
                <Table.Content
                  aria-label="Commits analysis table"
                  className="min-w-[800px]"
                  selectedKeys={selectedKeys}
                  selectionMode="multiple"
                  onSelectionChange={setSelectedKeys}
                >
                  <Table.Header>
                    <Table.Column className="w-10 pr-0">
                      <Checkbox aria-label="Select all" slot="selection">
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox>
                    </Table.Column>
                    <Table.Column isRowHeader>Commit</Table.Column>
                    <Table.Column>การเปลี่ยนแปลง</Table.Column>
                    <Table.Column>ความเสี่ยง</Table.Column>
                    <Table.Column>AI Summary</Table.Column>
                    <Table.Column className="w-28" />
                  </Table.Header>
                  <Table.Body>
                    {commits.map((record) => (
                      <Table.Row key={record.commitSha} id={record.commitSha}>
                        <Table.Cell className="pr-0">
                          <Checkbox
                            aria-label={`Select ${record.commitSha.slice(0, 7)}`}
                            slot="selection"
                            variant="secondary"
                          >
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                          </Checkbox>
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
