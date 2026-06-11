"use client";

import { useState } from "react";
import {
  Button,
  Chip,
  Spinner,
  Alert,
  TextArea,
} from "@heroui/react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { message } from "@/lib/toast";
import {
  ArrowLeft,
  Bot,
  History,
  Trash2,
  Pencil,
  Save,
  X,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { useProjectDoc } from "@/hooks/docs";

dayjs.locale("th");

interface DocsContentProps {
  repoId: string;
}

export default function DocsContent({ repoId }: DocsContentProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const { doc, isLoading, versions, update, isUpdating, autoUpdate, isAutoUpdating, deleteDoc, isDeleting } =
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
    } catch (error) {
      console.error("Save Docs Error:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const backendMessage = err?.response?.data?.message || err?.message || "บันทึกไม่สำเร็จ";
      message.error(`บันทึกไม่สำเร็จ: ${backendMessage}`);
    }
  };

  const handleAutoUpdate = async () => {
    try {
      await autoUpdate();
      message.success("AI อัปเดต Docs สำเร็จ");
    } catch {
      message.error("AI อัปเดตไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า AI");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc();
      message.success("ลบ Docs สำเร็จ");
      setIsEditing(false);
      setShowHistory(false);
    } catch {
      message.error("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            <ArrowLeft size={16} />
            กลับ
          </Button>
          {doc && (
            <Chip size="sm" variant="soft">
              <Chip.Label>v{doc.version}</Chip.Label>
            </Chip>
          )}
          <span className="text-xs text-muted">
            {doc ? `อัปเดตเมื่อ ${dayjs(doc.updatedAt).format("DD MMM YYYY HH:mm")}` : ""}
          </span>
          <div className="flex-1" />

          {!isEditing ? (
            <div className="flex items-center gap-2 flex-wrap">
              <ConfirmDialog
                title="AI Auto Update"
                description="AI จะวิเคราะห์ code และอัปเดต Docs อัตโนมัติ ดำเนินการหรือไม่?"
                confirmLabel="ดำเนินการ"
                onConfirm={handleAutoUpdate}
                trigger={
                  <Button variant="secondary" size="sm" isDisabled={isAutoUpdating}>
                    <Bot size={14} />
                    AI Auto Update
                  </Button>
                }
              />

              <Button variant="secondary" size="sm" onPress={() => setShowHistory((v) => !v)}>
                <History size={14} />
                ประวัติ
              </Button>

              {doc && (
                <ConfirmDialog
                  title="ลบ Docs"
                  description="ลบ Docs ทั้งหมดหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
                  confirmLabel="ลบ"
                  confirmVariant="danger"
                  onConfirm={handleDelete}
                  trigger={
                    <Button variant="danger" size="sm" isDisabled={isDeleting}>
                      <Trash2 size={14} />
                      ลบ
                    </Button>
                  }
                />
              )}

              <Button variant="primary" size="sm" onPress={startEdit}>
                <Pencil size={14} />
                แก้ไข
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onPress={() => setIsEditing(false)}>
                <X size={14} />
                ยกเลิก
              </Button>
              <Button variant="primary" size="sm" isDisabled={isUpdating} onPress={handleSave}>
                <Save size={14} />
                {isUpdating ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : isEditing ? (
          <TextArea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
            placeholder="เขียน Docs ในรูปแบบ Markdown..."
          />
        ) : !doc ? (
          <div className="flex flex-col items-center py-16 text-center">
            <FileText size={48} className="opacity-20 mb-4" />
            <p className="text-muted mb-4">ยังไม่มี Project Docs</p>
            <Button variant="primary" onPress={startEdit}>
              สร้าง Docs
            </Button>
          </div>
        ) : (
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg min-h-[400px] whitespace-pre-wrap text-sm leading-relaxed">
            {doc.content || "ยังไม่มีเนื้อหา"}
          </div>
        )}
      </div>

      {showHistory && (
        <div className="w-60 shrink-0">
          <div className="font-semibold mb-3 text-sm">ประวัติเวอร์ชัน</div>
          <div className="flex flex-col gap-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            {versions.map((v) => (
              <div
                key={v.version}
                className={`relative ${v.version === doc?.version ? "text-indigo-600 dark:text-indigo-400" : "text-muted"}`}
              >
                <div
                  className={`absolute -left-[21px] top-1.5 size-2.5 rounded-full ${
                    v.version === doc?.version ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
                <div className="font-medium text-sm">v{v.version}</div>
                <div className="text-[11px] opacity-60">
                  {dayjs(v.updatedAt).format("DD/MM/YYYY HH:mm")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
