"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  TextField,
  Label,
  InputGroup,
  TextArea,
  Button,
  useOverlayState,
} from "@heroui/react";
import { message } from "@/lib/toast";
import type { TestCase, TestCaseFormValues, ModalMode } from "@/types/app/testCase";

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
      className={`border border-gray-300 dark:border-gray-600 rounded-md p-1 flex flex-wrap gap-1 min-h-9 ${
        disabled ? "bg-gray-100 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
      }`}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-0.5 text-sm inline-flex items-center gap-1.5"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange?.(value.filter((t) => t !== tag))}
              className="cursor-pointer text-gray-400 text-xs leading-none"
            >
              ×
            </button>
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
          className="border-none outline-none flex-1 min-w-[120px] text-sm bg-transparent py-0.5"
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
  const modalState = useOverlayState({
    isOpen: open,
    onOpenChange: (isOpen) => {
      if (!isOpen) onClose();
    },
  });

  const isView = mode === "view";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (data) {
        setTitle(data.title);
        setDescription(data.description ?? "");
        setExpectedResult(data.expectedResult ?? "");
        setTags(data.tags ?? []);
      } else {
        setTitle("");
        setDescription("");
        setExpectedResult("");
        setTags([]);
      }
    }
  }, [open, data]);

  const handleOk = async () => {
    if (!title.trim()) {
      message.warning("กรุณากรอกชื่อ");
      return;
    }
    const values: TestCaseFormValues = {
      title: title.trim(),
      description: description || undefined,
      expectedResult: expectedResult || undefined,
      testType: data?.testType ?? "manual",
      status: data?.status ?? "not_tested",
      priority: data?.priority ?? "medium",
      tags,
      folderId: data?.folderId ?? folderId ?? undefined,
    };
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

  const modalTitle =
    mode === "create" ? "สร้าง Test Case ใหม่" : mode === "edit" ? "แก้ไข Test Case" : "รายละเอียด";

  return (
    <Modal state={modalState}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{modalTitle}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <TextField value={title} onChange={setTitle} isRequired isDisabled={isView}>
                <Label>ชื่อ Test Case</Label>
                <InputGroup>
                  <InputGroup.Input placeholder="เช่น ทดสอบ login ด้วย email ที่ไม่ถูกต้อง" />
                </InputGroup>
              </TextField>

              <div className="flex flex-col gap-1">
                <Label>คำอธิบาย</Label>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isView}
                  rows={3}
                  placeholder="บรรยายสิ่งที่ต้องการทดสอบ..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>ผลลัพธ์ที่คาดหวัง</Label>
                <TextArea
                  value={expectedResult}
                  onChange={(e) => setExpectedResult(e.target.value)}
                  disabled={isView}
                  rows={3}
                  placeholder="ระบบควรแสดง..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>แท็ก</Label>
                <TagInput value={tags} onChange={setTags} disabled={isView} />
              </div>
            </Modal.Body>
            <Modal.Footer>
              {isView ? (
                <Button slot="close" variant="secondary">
                  ปิด
                </Button>
              ) : (
                <>
                  <Button slot="close" variant="secondary">
                    ยกเลิก
                  </Button>
                  <Button variant="primary" isDisabled={isLoading} onPress={handleOk}>
                    {isLoading ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                </>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
