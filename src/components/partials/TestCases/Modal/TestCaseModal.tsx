"use client";

import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Space,
} from "antd";
import type { TestCase, TestCaseFormValues, ModalMode } from "@/types/app/testCase";

const { TextArea } = Input;

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

        <Space style={{ width: "100%" }} styles={{ item: { flex: 1 } }}>
          <Form.Item name="testType" label="ประเภท" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select options={[
              { value: "manual", label: "Manual" },
              { value: "automated", label: "Automated" },
              { value: "ui", label: "UI" },
              { value: "api", label: "API" },
              { value: "integration", label: "Integration" },
            ]} />
          </Form.Item>

          <Form.Item name="status" label="สถานะ" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select options={[
              { value: "not_tested", label: "ยังไม่ทดสอบ" },
              { value: "pass", label: "ผ่าน" },
              { value: "fail", label: "ไม่ผ่าน" },
              { value: "blocked", label: "ติดขัด" },
            ]} />
          </Form.Item>

          <Form.Item name="priority" label="ความสำคัญ" rules={[{ required: true }]} style={{ flex: 1 }}>
            <Select options={[
              { value: "low", label: "ต่ำ" },
              { value: "medium", label: "กลาง" },
              { value: "high", label: "สูง" },
              { value: "critical", label: "วิกฤต" },
            ]} />
          </Form.Item>
        </Space>

        <Form.Item name="tags" label="แท็ก">
          <Select mode="tags" placeholder="พิมพ์แล้วกด Enter เพื่อเพิ่มแท็ก" style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
