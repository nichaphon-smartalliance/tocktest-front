"use client";

import { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Alert,
  Space,
  Typography,
  Tooltip,
  Spin,
  Card,
  Collapse,
} from "antd";
import { message } from "@/lib/antd-static";
import { RobotOutlined, ThunderboltOutlined } from "@ant-design/icons";
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
  const { commits, total, isLoading, analyze, isAnalyzing, getWhatToTest, whatToTestResult, isLoadingWhatToTest } =
    useCommitList(repoId, { pageSize: 30 });

  const handleAnalyze = async (commitSha: string) => {
    try {
      await analyze(commitSha);
      message.success("วิเคราะห์ commit สำเร็จ");
    } catch {
      message.error("วิเคราะห์ไม่สำเร็จ");
    }
  };

  const handleWhatToTest = async () => {
    if (selectedShas.length === 0) {
      message.warning("กรุณาเลือก commit ที่ต้องการวิเคราะห์");
      return;
    }
    try {
      await getWhatToTest(selectedShas);
    } catch {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
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
        <Space orientation="vertical" size={2}>
          <Text style={{ fontSize: 12 }}>📁 {r.filesChanged} ไฟล์</Text>
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
        v ? (
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
      render: (_, record) =>
        !record.analyzedAt ? (
          <Button
            size="small"
            icon={<RobotOutlined />}
            loading={isAnalyzing}
            onClick={() => handleAnalyze(record.commitSha)}
          >
            วิเคราะห์
          </Button>
        ) : (
          <Tooltip title={`วิเคราะห์เมื่อ ${dayjs(record.analyzedAt).fromNow()}`}>
            <Tag color="green" style={{ cursor: "default" }}>✓ วิเคราะห์แล้ว</Tag>
          </Tooltip>
        ),
    },
  ];

  return (
    <div>
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

        {whatToTestResult && (
          <Alert
            style={{ marginTop: 12 }}
            type="info"
            title={
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>คำแนะนำจาก AI</div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {whatToTestResult.recommendations.map((r, i) => (
                    <li key={i} style={{ marginBottom: 4, fontSize: 13 }}>{r}</li>
                  ))}
                </ul>
                {whatToTestResult.reasoning && (
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>{whatToTestResult.reasoning}</div>
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
          getCheckboxProps: (record) => ({ value: record.commitSha }),
        }}
        size="middle"
        pagination={{ total, showTotal: (t) => `${t} commits` }}
      />
    </div>
  );
}
