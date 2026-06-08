"use client";

import { useState } from "react";
import {
  Modal,
  Form,
  DatePicker,
  Button,
  Space,
  message,
  Spin,
  Card,
  Tag,
  Checkbox,
  Alert,
  Typography,
  Divider,
} from "antd";
import { RobotOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAiGenerateTestCases } from "@/hooks/testCase";
import type { GeneratedTestCasePreview } from "@/types/app/testCase";
import { STATUS_CONFIG, TYPE_CONFIG, PRIORITY_CONFIG } from "../TestCases.config";

const { RangePicker } = DatePicker;
const { Text, Paragraph } = Typography;

interface AiGenerateModalProps {
  repoId: string;
  folderId?: string | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AiGenerateModal({ repoId, folderId, open, onClose, onSaved }: AiGenerateModalProps) {
  const [form] = Form.useForm();
  const [previews, setPreviews] = useState<GeneratedTestCasePreview[]>([]);
  const { generate, isGenerating, save, isSaving } = useAiGenerateTestCases(repoId);

  const handleGenerate = async () => {
    const values = await form.validateFields();
    const [from, to] = values.dateRange ?? [];
    try {
      const result = await generate({
        repoId,
        fromDate: from ? dayjs(from).toISOString() : undefined,
        toDate: to ? dayjs(to).toISOString() : undefined,
      });
      setPreviews(result);
    } catch {
      message.error("AI สร้าง test case ไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const handleSave = async () => {
    const selected = previews.filter((p) => p.selected);
    if (selected.length === 0) {
      message.warning("กรุณาเลือก test case อย่างน้อย 1 รายการ");
      return;
    }
    try {
      const toSave = selected.map((p) => ({ ...p, folderId: folderId ?? undefined }));
      await save(toSave);
      message.success(`บันทึก ${selected.length} test case สำเร็จ`);
      setPreviews([]);
      form.resetFields();
      onSaved();
      onClose();
    } catch {
      message.error("บันทึกไม่สำเร็จ");
    }
  };

  const toggleSelect = (index: number) => {
    setPreviews((prev) =>
      prev.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleClose = () => {
    setPreviews([]);
    form.resetFields();
    onClose();
  };

  const selectedCount = previews.filter((p) => p.selected).length;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <Space>
          <RobotOutlined style={{ color: "#6366f1" }} />
          สร้าง Test Case ด้วย AI
        </Space>
      }
      width={800}
      footer={
        previews.length > 0 ? (
          <Space>
            <Text type="secondary">{selectedCount} / {previews.length} รายการที่เลือก</Text>
            <Button onClick={() => setPreviews([])}>เริ่มใหม่</Button>
            <Button type="primary" onClick={handleSave} loading={isSaving} disabled={selectedCount === 0}>
              บันทึก {selectedCount} รายการ
            </Button>
          </Space>
        ) : null
      }
    >
      {previews.length === 0 ? (
        <Form form={form} layout="vertical" requiredMark={false}>
          <Alert
            message="AI จะวิเคราะห์ code changes และสร้าง test case ให้อัตโนมัติ"
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />

          <Form.Item
            name="dateRange"
            label="ช่วงเวลาของ commits"
            extra="เลือกช่วงเวลาที่ต้องการวิเคราะห์"
          >
            <RangePicker
              style={{ width: "100%" }}
              placeholder={["วันเริ่มต้น", "วันสิ้นสุด"]}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Button
            type="primary"
            icon={<RobotOutlined />}
            loading={isGenerating}
            onClick={handleGenerate}
            block
            size="large"
            style={{ marginTop: 8 }}
          >
            {isGenerating ? "AI กำลังวิเคราะห์..." : "สร้าง Test Cases ด้วย AI"}
          </Button>
        </Form>
      ) : (
        <Spin spinning={isSaving}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text>AI สร้าง <b>{previews.length}</b> test case — เลือกรายการที่ต้องการบันทึก</Text>
            <Space>
              <Button size="small" onClick={() => setPreviews((p) => p.map((x) => ({ ...x, selected: true })))}>เลือกทั้งหมด</Button>
              <Button size="small" onClick={() => setPreviews((p) => p.map((x) => ({ ...x, selected: false })))}>ยกเลิกทั้งหมด</Button>
            </Space>
          </div>
          <Divider style={{ margin: "0 0 12px" }} />
          <div style={{ maxHeight: 480, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {previews.map((tc, index) => (
              <Card
                key={index}
                size="small"
                style={{
                  borderRadius: 8,
                  borderColor: tc.selected ? "#6366f1" : undefined,
                  opacity: tc.selected ? 1 : 0.5,
                  cursor: "pointer",
                }}
                onClick={() => toggleSelect(index)}
                styles={{ body: { padding: "10px 14px" } }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Checkbox checked={tc.selected} onChange={() => toggleSelect(index)} onClick={(e) => e.stopPropagation()} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{tc.title}</div>
                    {tc.description && (
                      <Paragraph style={{ margin: "0 0 6px", fontSize: 12, opacity: 0.7 }} ellipsis={{ rows: 2 }}>
                        {tc.description}
                      </Paragraph>
                    )}
                    <Space size={4} wrap>
                      <Tag color={TYPE_CONFIG[tc.testType].color} style={{ fontSize: 11 }}>{TYPE_CONFIG[tc.testType].label}</Tag>
                      <Tag color={PRIORITY_CONFIG[tc.priority].color} style={{ fontSize: 11 }}>{PRIORITY_CONFIG[tc.priority].label}</Tag>
                      {tc.tags.map((tag) => <Tag key={tag} style={{ fontSize: 11 }}>{tag}</Tag>)}
                    </Space>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Spin>
      )}
    </Modal>
  );
}
