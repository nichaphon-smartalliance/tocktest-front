"use client";

import { useState } from "react";
import {
  Modal,
  Button,
  Card,
  Chip,
  Checkbox,
  Alert,
  Spinner,
  TextField,
  Label,
  InputGroup,
  useOverlayState,
} from "@heroui/react";
import { message } from "@/lib/toast";
import { Bot } from "lucide-react";
import dayjs from "dayjs";
import { useAiGenerateTestCases } from "@/hooks/testCase";
import type { GeneratedTestCasePreview } from "@/types/app/testCase";
import { TYPE_CONFIG, PRIORITY_CONFIG } from "../TestCases.config";

interface AiGenerateModalProps {
  repoId: string;
  folderId?: string | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AiGenerateModal({ repoId, folderId, open, onClose, onSaved }: AiGenerateModalProps) {
  const modalState = useOverlayState({
    isOpen: open,
    onOpenChange: (isOpen) => {
      if (!isOpen) handleClose();
    },
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [previews, setPreviews] = useState<GeneratedTestCasePreview[]>([]);
  const { generate, isGenerating, save, isSaving } = useAiGenerateTestCases(repoId);

  const handleGenerate = async () => {
    try {
      const result = await generate({
        repoId,
        fromDate: fromDate ? dayjs(fromDate).toISOString() : undefined,
        toDate: toDate ? dayjs(toDate).toISOString() : undefined,
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
      setFromDate("");
      setToDate("");
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
    setFromDate("");
    setToDate("");
    onClose();
  };

  const selectedCount = previews.filter((p) => p.selected).length;

  return (
    <Modal state={modalState}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>
                <span className="flex items-center gap-2">
                  <Bot size={18} className="text-indigo-500" />
                  สร้าง Test Case ด้วย AI
                </span>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {previews.length === 0 ? (
                <div className="flex flex-col gap-4">
                  <Alert status="accent">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>
                        AI จะวิเคราะห์ code changes และสร้าง test case ให้อัตโนมัติ
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>

                  <div className="grid grid-cols-2 gap-3">
                    <TextField value={fromDate} onChange={setFromDate}>
                      <Label>วันเริ่มต้น</Label>
                      <InputGroup>
                        <InputGroup.Input type="date" />
                      </InputGroup>
                    </TextField>
                    <TextField value={toDate} onChange={setToDate}>
                      <Label>วันสิ้นสุด</Label>
                      <InputGroup>
                        <InputGroup.Input type="date" />
                      </InputGroup>
                    </TextField>
                  </div>
                  <p className="text-xs text-muted -mt-2">เลือกช่วงเวลาที่ต้องการวิเคราะห์</p>

                  <Button
                    variant="primary"
                    fullWidth
                    isDisabled={isGenerating}
                    onPress={handleGenerate}
                    className="h-11"
                  >
                    {isGenerating ? (
                      <>
                        <Spinner size="sm" color="current" />
                        AI กำลังวิเคราะห์...
                      </>
                    ) : (
                      <>
                        <Bot size={16} />
                        สร้าง Test Cases ด้วย AI
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <p className="text-sm">
                      AI สร้าง <strong>{previews.length}</strong> test case — เลือกรายการที่ต้องการบันทึก
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onPress={() => setPreviews((p) => p.map((x) => ({ ...x, selected: true })))}
                      >
                        เลือกทั้งหมด
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onPress={() => setPreviews((p) => p.map((x) => ({ ...x, selected: false })))}
                      >
                        ยกเลิกทั้งหมด
                      </Button>
                    </div>
                  </div>
                  <hr className="border-gray-200 dark:border-gray-700 mb-3" />
                  <div className="max-h-[480px] overflow-y-auto flex flex-col gap-2">
                    {previews.map((tc, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer rounded-lg ${
                          tc.selected ? "ring-2 ring-indigo-500 opacity-100" : "opacity-50"
                        }`}
                        onClick={() => toggleSelect(index)}
                      >
                        <Card.Content className="p-3">
                          <div className="flex items-start gap-2.5">
                            <Checkbox
                              isSelected={tc.selected}
                              onChange={() => toggleSelect(index)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                            </Checkbox>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold mb-1">{tc.title}</div>
                              {tc.description && (
                                <p className="text-xs text-muted mb-1.5 line-clamp-2">{tc.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1">
                                <Chip size="sm" variant="soft" color={TYPE_CONFIG[tc.testType].color}>
                                  <Chip.Label>{TYPE_CONFIG[tc.testType].label}</Chip.Label>
                                </Chip>
                                <Chip size="sm" variant="soft" color={PRIORITY_CONFIG[tc.priority].color}>
                                  <Chip.Label>{PRIORITY_CONFIG[tc.priority].label}</Chip.Label>
                                </Chip>
                                {tc.tags.map((tag) => (
                                  <Chip key={tag} size="sm" variant="soft">
                                    <Chip.Label>{tag}</Chip.Label>
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card.Content>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Modal.Body>
            {previews.length > 0 && (
              <Modal.Footer>
                <span className="text-sm text-muted mr-auto">
                  {selectedCount} / {previews.length} รายการที่เลือก
                </span>
                <Button variant="secondary" onPress={() => setPreviews([])}>
                  เริ่มใหม่
                </Button>
                <Button
                  variant="primary"
                  isDisabled={selectedCount === 0 || isSaving}
                  onPress={handleSave}
                >
                  {isSaving ? "กำลังบันทึก..." : `บันทึก ${selectedCount} รายการ`}
                </Button>
              </Modal.Footer>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
