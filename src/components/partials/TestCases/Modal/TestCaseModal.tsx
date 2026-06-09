"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Segmented,
  Button,
  Space,
} from "antd";
import { message } from "@/lib/antd-static";
import type { TestCase, TestCaseFormValues, ModalMode } from "@/types/app/testCase";

const { TextArea } = Input;

function TagInput({
  value = [],
  onChange,
  disabled,
}: {
  value?: string[];
  onChange?: (v: string[]) => void;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) onChange?.([...value, tag]);
    setInput("");
  };

  return (
    <div
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: 6,
        padding: "4px 8px",
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        minHeight: 36,
        background: disabled ? "#f5f5f5" : "#fff",
      }}
    >
      {value.map((tag) => (
        <span
          key={tag}
          style={{
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            borderRadius: 4,
            padding: "1px 8px",
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#374151",
          }}
        >
          {tag}
          {!disabled && (
            <span
              onClick={() => onChange?.(value.filter((t) => t !== tag))}
              style={{ cursor: "pointer", color: "#9ca3af", fontSize: 12, lineHeight: 1 }}
            >
              ×
            </span>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            } else if (e.key === "Backspace" && !input && value.length > 0) {
              onChange?.(value.slice(0, -1));
            }
          }}
          onBlur={addTag}
          placeholder={value.length === 0 ? "พิมพ์แล้วกด Enter เพื่อเพิ่มแท็ก" : ""}
          style={{
            border: "none",
            outline: "none",
            flex: 1,
            minWidth: 120,
            fontSize: 14,
            background: "transparent",
            padding: "1px 0",
          }}
        />
      )}
    </div>
  );
}

interface TestCaseModalProps {
  open: boolean;
  mode: ModalMode;
  repoId: string;
  folderId?: string | null;
  data?: TestCase | null;
  onClose: () => void;
  onCreate: (values: TestCaseFormValues) => Promise<void>;
  onUpdate: (id: string, values: Partial<TestCaseFormValues>) => Promise<void>;
  isLoading: boolean;
}

export default function TestCaseModal({
  open,
  mode,
  folderId,
  data,
  onClose,
  onCreate,
  onUpdate,
  isLoading,
}: TestCaseModalProps) {
  const [form] = Form.useForm<TestCaseFormValues>();
  const isView = mode === "view";

  useEffect(() => {
    if (open) {
      if (data) {
        form.setFieldsValue({
          title: data.title,
          description: data.description ?? undefined,
          expectedResult: data.expectedResult ?? undefined,
          testType: data.testType,
          status: data.status,
          priority: data.priority,
          tags: data.tags,
          folderId: data.folderId ?? folderId ?? undefined,
        });
      } else {
        form.resetFields();
        if (folderId) form.setFieldValue("folderId", folderId);
        form.setFieldsValue({ testType: "manual", status: "not_tested", priority: "medium" });
      }
    }
  }, [open, data, folderId, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      if (mode === "edit" && data) {
        await onUpdate(data.id, values);
        message.success("อัปเดต test case สำเร็จ");
      } else {
        await onCreate(values);
        message.success("สร้าง test case สำเร็จ");
      }
      onClose();
    } catch {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={mode === "create" ? "สร้าง Test Case ใหม่" : mode === "edit" ? "แก้ไข Test Case" : "รายละเอียด"}
      width={700}
      footer={
        isView ? (
          <Button onClick={onClose}>ปิด</Button>
        ) : (
          <Space>
            <Button onClick={onClose}>ยกเลิก</Button>
            <Button type="primary" onClick={handleOk} loading={isLoading}>
              บันทึก
            </Button>
          </Space>
        )
      }
    >
      <Form form={form} layout="vertical" disabled={isView} requiredMark={false}>
        <Form.Item name="title" label="ชื่อ Test Case" rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}>
          <Input placeholder="เช่น ทดสอบ login ด้วย email ที่ไม่ถูกต้อง" />
        </Form.Item>

        <Form.Item name="description" label="คำอธิบาย">
          <TextArea rows={3} placeholder="บรรยายสิ่งที่ต้องการทดสอบ..." />
        </Form.Item>

        <Form.Item name="expectedResult" label="ผลลัพธ์ที่คาดหวัง">
          <TextArea rows={3} placeholder="ระบบควรแสดง..." />
                  
        </Form.Item>

        <div style={{ display: "flex", gap: 24 }}>

        </div>

        <Form.Item name="tags" label="แท็ก">
          <TagInput />
        </Form.Item>
      </Form>
    </Modal>
  );
}
