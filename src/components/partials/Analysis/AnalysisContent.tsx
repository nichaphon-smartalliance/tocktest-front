"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Alert,
  Space,
  Typography,
  Tooltip,
  Card,
  Select,
} from "antd";
import { message } from "@/lib/antd-static";
import { RobotOutlined, ThunderboltOutlined, BranchesOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";
import { useCommitList } from "@/hooks/analysis";
import type { CommitItem, RiskLevel } from "@/types/app/analysis";

dayjs.extend(relativeTime);
dayjs.locale("th");

const RISK_CONFIG: Record<RiskLevel, { color: string; label: string }> = {
  low: { color: "green", label: "ต่ำ" },
  medium: { color: "orange", label: "กลาง" },
  high: { color: "red", label: "สูง" },
  critical: { color: "volcano", label: "วิกฤต" },
};

interface AnalysisContentProps {
  repoId: string;
}

const { Paragraph, Text } = Typography;

export default function AnalysisContent({ repoId }: AnalysisContentProps) {
  const [selectedShas, setSelectedShas] = useState<string[]>([]);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>();
  
  // Professional Fix: Optimistically tracks commits analyzed during this session
  const [localAnalyzedShas, setLocalAnalyzedShas] = useState<Set<string>>(new Set());

  // Capture the full hook context object to check for mutation features
  const commitHookContext = useCommitList(repoId, { pageSize: 30, branch: selectedBranch });

  const { 
    commits, 
    total, 
    isLoading, 
    branches, 
    branchesLoading, 
    analyze, 
    getWhatToTest, 
    whatToTestResult, 
    isLoadingWhatToTest 
  } = commitHookContext;

  // Clear selected commits when switching branches to prevent sending stale data to the API
  useEffect(() => {
    setSelectedShas([]);
  }, [selectedBranch]);

  const handleAnalyze = async (commitSha: string) => {
    // Set loading state for this specific row button
    setAnalyzingIds((prev) => {
      const next = new Set(prev);
      next.add(commitSha);
      return next;
    });

    try {
      await analyze(commitSha);
      
      // Update local state so the UI instantly changes without waiting for server response cycles
      setLocalAnalyzedShas((prev) => {
        const next = new Set(prev);
        next.add(commitSha);
        return next;
      });

      message.success("วิเคราะห์ commit สำเร็จ");

      // Defensive Programming: Try executing background refetch methods if provided by the hook
      const contextAny = commitHookContext as any;
      if (typeof contextAny.mutate === "function") contextAny.mutate();
      if (typeof contextAny.refresh === "function") contextAny.refresh();
      if (typeof contextAny.reload === "function") contextAny.reload();

    } catch (error: any) {
      console.error("Analyze error:", error);
      const backendMessage = error.response?.data?.message || "วิเคราะห์ไม่สำเร็จ กรุณาตรวจสอบ GitHub Token";
      message.error(backendMessage);
    } finally {
      // Remove loading state safely
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
    } catch (error: any) {
      console.error("What to test error:", error);
      const backendMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ AI service";
      message.error(backendMessage);
    }
  };

  const columns: ColumnsType<CommitItem> = [
    {
      title: "Commit",
      key: "commit",
      render: (_, record) => (
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.6 }}>{record.commitSha.slice(0, 7)}</div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{record.commitMessage}</div>
          <div style={{ fontSize: 11, opacity: 0.5 }}>{record.authorName} · {dayjs(record.committedAt).fromNow()}</div>
        </div>
      ),
    },
    {
      title: "การเปลี่ยนแปลง",
      key: "changes",
      width: 140,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 12 }}>{r.filesChanged} ไฟล์</Text>
          <Space size={4}>
            <Text style={{ fontSize: 11, color: "#16a34a" }}>+{r.additions}</Text>
            <Text style={{ fontSize: 11, color: "#dc2626" }}>-{r.deletions}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "ความเสี่ยง",
      dataIndex: "riskLevel",
      key: "riskLevel",
      width: 90,
      render: (v: RiskLevel | null) =>
        v && RISK_CONFIG[v] ? (
          <Tag color={RISK_CONFIG[v].color}>{RISK_CONFIG[v].label}</Tag>
        ) : (
          <Tag>ยังไม่วิเคราะห์</Tag>
        ),
    },
    {
      title: "AI Summary",
      dataIndex: "aiSummary",
      key: "aiSummary",
      render: (v: string | null) =>
        v ? (
          <Paragraph style={{ margin: 0, fontSize: 12 }} ellipsis={{ rows: 2, expandable: true, symbol: "อ่านเพิ่ม" }}>
            {v}
          </Paragraph>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>ยังไม่มี AI summary</Text>
        ),
    },
    {
      title: "",
      key: "action",
      width: 110,
      render: (_, record) => {
        // Evaluates against both the DB timestamp and the immediate runtime transaction log
        const isAnalyzed = !!record.analyzedAt || localAnalyzedShas.has(record.commitSha);

        return !isAnalyzed ? (
          <Button
            size="small"
            icon={<RobotOutlined />}
            loading={analyzingIds.has(record.commitSha)}
            onClick={() => handleAnalyze(record.commitSha)}
          >
            วิเคราะห์
          </Button>
        ) : (
          <Tooltip title={record.analyzedAt ? `วิเคราะห์เมื่อ ${dayjs(record.analyzedAt).fromNow()}` : "วิเคราะห์สำเร็จแล้ว"}>
            <Tag color="green" style={{ cursor: "default" }}>วิเคราะห์แล้ว</Tag>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div>
      {/* Branch selector */}
      <Card style={{ marginBottom: 16, borderRadius: 8 }} styles={{ body: { padding: 16 } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <BranchesOutlined style={{ color: "#0ea5e9", fontSize: 20 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>เลือก Branch</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>ระบบจะดึง commits จากไปนี้</div>
          </div>
          <Select
            style={{ minWidth: 200 }}
            placeholder="เลือก branch..."
            loading={branchesLoading}
            value={selectedBranch}
            onChange={setSelectedBranch}
            allowClear
            options={branches?.map((b) => ({
              label: b.name,
              value: b.name,
            })) || []}
          />
        </div>
      </Card>

      {/* What to test assistant */}
      <Card style={{ marginBottom: 16, borderRadius: 8 }} styles={{ body: { padding: 16 } }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <ThunderboltOutlined style={{ color: "#6366f1", fontSize: 20 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>ควรทดสอบอะไรหลังจาก commits เหล่านี้?</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>เลือก commit จากตารางแล้วถาม AI</div>
          </div>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            loading={isLoadingWhatToTest}
            onClick={handleWhatToTest}
            disabled={selectedShas.length === 0}
          >
            ถาม AI ({selectedShas.length} commits)
          </Button>
        </div>

        {/* Clean and safe recommendations layout */}
        {whatToTestResult && (
          <Alert
            style={{ marginTop: 12 }}
            type="info"
            message={
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>คำแนะนำจาก AI</div>
                {whatToTestResult.recommendations?.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {whatToTestResult.recommendations.map((r, i) => (
                      <li key={i} style={{ marginBottom: 4, fontSize: 13 }}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: 13, opacity: 0.6 }}>ไม่มีคำแนะนำที่ระบุแน่ชัด</div>
                )}
                {whatToTestResult.reasoning && (
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                    <strong>เหตุผล:</strong> {whatToTestResult.reasoning}
                  </div>
                )}
              </div>
            }
          />
        )}
      </Card>

      <Table
        columns={columns}
        dataSource={commits}
        rowKey="commitSha"
        loading={isLoading}
        rowSelection={{
          selectedRowKeys: selectedShas,
          onChange: (keys) => setSelectedShas(keys as string[]),
        }}
        size="middle"
        pagination={{ total, showTotal: (t) => `${t} commits` }}
      />
    </div>
  );
}