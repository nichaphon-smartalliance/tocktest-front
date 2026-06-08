"use client";

import { useState } from "react";
import {
  Button,
  Space,
  Tag,
  Spin,
  Empty,
  Timeline,
  Typography,
  Tooltip,
  message,
  Popconfirm,
} from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined, RobotOutlined, HistoryOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { useProjectDoc } from "@/hooks/docs";

dayjs.locale("th");

const { Text } = Typography;

interface DocsContentProps {
  repoId: string;
}

export default function DocsContent({ repoId }: DocsContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const { doc, isLoading, versions, update, isUpdating, autoUpdate, isAutoUpdating } =
    useProjectDoc(repoId);

  const startEdit = () => {
    setEditContent(doc?.content ?? "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await update(editContent);
      message.success("บันทึก Docs สำเร็จ");
      setIsEditing(false);
    } catch {
      message.error("บันทึกไม่สำเร็จ");
    }
  };

  const handleAutoUpdate = async () => {
    try {
      await autoUpdate();
      message.success("AI อัปเดต Docs สำเร็จ");
    } catch {
      message.error("AI อัปเดตไม่สำเร็จ");
    }
  };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {/* Doc content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {doc && (
            <Tag>v{doc.version}</Tag>
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>
            {doc ? `อัปเดตเมื่อ ${dayjs(doc.updatedAt).format("DD MMM YYYY HH:mm")}` : ""}
          </Text>
          <div style={{ flex: 1 }} />

          {!isEditing ? (
            <Space>
              <Popconfirm
                title="AI จะวิเคราะห์ code และอัปเดต Docs อัตโนมัติ ดำเนินการหรือไม่?"
                onConfirm={handleAutoUpdate}
                okText="ดำเนินการ"
                cancelText="ยกเลิก"
              >
                <Button icon={<RobotOutlined />} loading={isAutoUpdating}>
                  AI Auto Update
                </Button>
              </Popconfirm>
              <Button icon={<HistoryOutlined />} onClick={() => setShowHistory((v) => !v)}>
                ประวัติ
              </Button>
              <Button type="primary" icon={<EditOutlined />} onClick={startEdit}>
                แก้ไข
              </Button>
            </Space>
          ) : (
            <Space>
              <Button icon={<CloseOutlined />} onClick={() => setIsEditing(false)}>
                ยกเลิก
              </Button>
              <Button type="primary" icon={<SaveOutlined />} loading={isUpdating} onClick={handleSave}>
                บันทึก
              </Button>
            </Space>
          )}
        </div>

        <Spin spinning={isLoading}>
          {!isLoading && !doc ? (
            <Empty
              description="ยังไม่มี Project Docs"
              style={{ padding: "60px 0" }}
            >
              <Button type="primary" onClick={startEdit}>สร้าง Docs</Button>
            </Empty>
          ) : isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{
                width: "100%",
                minHeight: 500,
                padding: 16,
                fontFamily: "'Fira Code', monospace",
                fontSize: 14,
                lineHeight: 1.6,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                resize: "vertical",
                outline: "none",
              }}
              placeholder="เขียน Docs ในรูปแบบ Markdown..."
            />
          ) : (
            <div
              style={{
                padding: 24,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                minHeight: 400,
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                lineHeight: 1.8,
                fontSize: 14,
              }}
            >
              {doc?.content || "ยังไม่มีเนื้อหา"}
            </div>
          )}
        </Spin>
      </div>

      {/* Version history */}
      {showHistory && (
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>ประวัติเวอร์ชัน</div>
          <Timeline
            items={versions.map((v) => ({
              children: (
                <div>
                  <div style={{ fontWeight: 500 }}>v{v.version}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>
                    {dayjs(v.updatedAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                </div>
              ),
              color: v.version === doc?.version ? "blue" : "gray",
            }))}
          />
        </div>
      )}
    </div>
  );
}
