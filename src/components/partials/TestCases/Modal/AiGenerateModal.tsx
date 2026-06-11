"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Button,
  Chip,
  Alert,
  Spinner,
  Label,
} from "@heroui/react";
import { ControlledModal } from "@/components/ui/ControlledModal";
import { message } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { Bot, Calendar, WifiOff, Check } from "lucide-react";
import dayjs from "dayjs";
import { useAiGenerateTestCases } from "@/hooks/testCase";
import type { GeneratedTestCasePreview } from "@/types/app/testCase";
import { TYPE_CONFIG, PRIORITY_CONFIG } from "../TestCases.config";

const typeCfg = (t: GeneratedTestCasePreview["testType"]) => TYPE_CONFIG[t] ?? TYPE_CONFIG.manual;
const priorityCfg = (p: GeneratedTestCasePreview["priority"]) => PRIORITY_CONFIG[p] ?? PRIORITY_CONFIG.medium;
const HIDDEN_TAGS = new Set(["heuristic", "ai-offline"]);
const DATE_INPUT =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

const isOfflinePreview = (tc: GeneratedTestCasePreview) =>
  tc.tags.some((t) => t === "ai-offline" || t === "heuristic");

const formatRange = (from: string, to: string) =>
  `${dayjs(from).format("D MMM YYYY")} – ${dayjs(to).format("D MMM YYYY")}`;

interface AiGenerateModalProps {
  repoId: string;
  folderId?: string | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AiGenerateModal({ repoId, folderId, open, onClose, onSaved }: AiGenerateModalProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [previews, setPreviews] = useState<GeneratedTestCasePreview[]>([]);
  const { generate, isGenerating, save, isSaving } = useAiGenerateTestCases(repoId);

  useEffect(() => {
    if (open && !fromDate && !toDate && previews.length === 0) {
      setToDate(dayjs().format("YYYY-MM-DD"));
      setFromDate(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    }
  }, [open, fromDate, toDate, previews.length]);

  const selectedCount = useMemo(() => previews.filter((p) => p.selected).length, [previews]);
  const isOfflineResult = useMemo(() => previews.some(isOfflinePreview), [previews]);
  const dateRangeLabel = fromDate && toDate ? formatRange(fromDate, toDate) : null;

  const handleGenerate = async () => {
    if (!fromDate || !toDate) {
      message.warning("กรุณาเลือกวันเริ่มต้นและวันสิ้นสุด");
      return;
    }
    if (dayjs(fromDate).isAfter(dayjs(toDate))) {
      message.warning("วันเริ่มต้นต้องไม่เกินวันสิ้นสุด");
      return;
    }

    try {
      const result = await generate({
        repoId,
        fromDate: dayjs(fromDate).startOf("day").toISOString(),
        toDate: dayjs(toDate).endOf("day").toISOString(),
      });
      if (result.length === 0) {
        message.warning("ไม่พบ test case ในช่วงเวลานี้ — ลองเลือกช่วงเวลาอื่นหรือตรวจสอบ GitHub Token");
        return;
      }
      setPreviews(result);
      message.success(`สร้าง ${result.length} test case สำเร็จ`);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      message.error(getApiErrorMessage(error, "AI สร้าง test case ไม่สำเร็จ กรุณาลองใหม่"));
    }
  };

  const handleSave = async () => {
    const selected = previews.filter((p) => p.selected);
    if (selected.length === 0) {
      message.warning("กรุณาเลือก test case อย่างน้อย 1 รายการ");
      return;
    }
    try {
      await save(selected.map((p) => ({ ...p, folderId: folderId ?? undefined })));
      message.success(`บันทึก ${selected.length} test case สำเร็จ`);
      setPreviews([]);
      setFromDate("");
      setToDate("");
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      message.error(getApiErrorMessage(error, "บันทึกไม่สำเร็จ"));
    }
  };

  const resetForm = () => {
    setPreviews([]);
    setFromDate(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    setToDate(dayjs().format("YYYY-MM-DD"));
  };

  const handleClose = useCallback(() => {
    setPreviews([]);
    setFromDate("");
    setToDate("");
    onClose();
  }, [onClose]);

  return (
    <ControlledModal open={open} onClose={handleClose}>
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
              <Modal.CloseTrigger />
            </Modal.Header>

            <Modal.Body className="gap-4">
              {previews.length === 0 ? (
                <>
                  <Alert status="accent">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>วิเคราะห์จาก commit ในช่วงเวลา</Alert.Title>
                      <Alert.Description>
                        เลือกช่วงวันที่ ระบบจะดึง code changes จาก GitHub แล้วสร้าง test case ให้เลือกบันทึก
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="ai-from-date">วันเริ่มต้น</Label>
                      <input
                        id="ai-from-date"
                        type="date"
                        value={fromDate}
                        max={toDate || undefined}
                        onChange={(e) => setFromDate(e.target.value)}
                        className={DATE_INPUT}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="ai-to-date">วันสิ้นสุด</Label>
                      <input
                        id="ai-to-date"
                        type="date"
                        value={toDate}
                        min={fromDate || undefined}
                        onChange={(e) => setToDate(e.target.value)}
                        className={DATE_INPUT}
                      />
                    </div>
                  </div>

                  {dateRangeLabel && (
                    <p className="flex items-center gap-1.5 text-xs text-muted">
                      <Calendar size={13} />
                      ช่วงที่เลือก: {dateRangeLabel}
                    </p>
                  )}

                  <Button
                    variant="primary"
                    fullWidth
                    isDisabled={isGenerating || !fromDate || !toDate}
                    onPress={() => void handleGenerate()}
                    className="h-11"
                  >
                    {isGenerating ? (
                      <>
                        <Spinner size="sm" color="current" />
                        กำลังวิเคราะห์ commit...
                      </>
                    ) : (
                      <>
                        <Bot size={16} />
                        สร้าง Test Cases
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {isOfflineResult && (
                    <Alert status="warning">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title className="flex items-center gap-1.5">
                          <WifiOff size={14} />
                          AI offline
                        </Alert.Title>
                        <Alert.Description>
                          แสดง test case แบบพื้นฐานจากไฟล์ที่เปลี่ยนในช่วงเวลาที่เลือก — สามารถแก้ไขหลังบันทึกได้
                        </Alert.Description>
                      </Alert.Content>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        พบ {previews.length} test case — เลือกรายการที่ต้องการบันทึก
                      </p>
                      {dateRangeLabel && (
                        <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                          <Calendar size={12} />
                          {dateRangeLabel}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
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

                  <div className="max-h-[420px] overflow-y-auto flex flex-col gap-2 pr-0.5">
                    {previews.map((tc, index) => {
                      const visibleTags = tc.tags.filter((t) => !HIDDEN_TAGS.has(t));
                      const stepCount = tc.steps?.length ?? 0;

                      return (
                        <button
                          key={`${tc.title}-${index}`}
                          type="button"
                          aria-pressed={tc.selected}
                          onClick={() =>
                            setPreviews((prev) =>
                              prev.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p)),
                            )
                          }
                          className={`w-full text-left rounded-xl border p-3 transition-all ${
                            tc.selected
                              ? "border-indigo-500 bg-indigo-500/5 shadow-sm"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              aria-hidden
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                tc.selected
                                  ? "border-indigo-500 bg-indigo-500 text-white"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {tc.selected && <Check size={10} strokeWidth={3} />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm leading-snug">{tc.title}</p>
                              {tc.description && (
                                <p className="text-xs text-muted mt-1 line-clamp-2">{tc.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <Chip size="sm" variant="soft" color={typeCfg(tc.testType).color}>
                                  <Chip.Label>{typeCfg(tc.testType).label}</Chip.Label>
                                </Chip>
                                <Chip size="sm" variant="soft" color={priorityCfg(tc.priority).color}>
                                  <Chip.Label>{priorityCfg(tc.priority).label}</Chip.Label>
                                </Chip>
                                {stepCount > 0 && (
                                  <Chip size="sm" variant="soft">
                                    <Chip.Label>{stepCount} ขั้นตอน</Chip.Label>
                                  </Chip>
                                )}
                                {isOfflinePreview(tc) && (
                                  <Chip size="sm" variant="soft" color="warning">
                                    <Chip.Label>offline</Chip.Label>
                                  </Chip>
                                )}
                                {visibleTags.map((tag) => (
                                  <Chip key={tag} size="sm" variant="soft">
                                    <Chip.Label>{tag}</Chip.Label>
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </Modal.Body>

            {previews.length > 0 && (
              <Modal.Footer className="flex-wrap gap-2">
                <span className="text-sm text-muted mr-auto">
                  เลือกแล้ว {selectedCount} / {previews.length} รายการ
                </span>
                <Button variant="secondary" onPress={resetForm} isDisabled={isSaving}>
                  เริ่มใหม่
                </Button>
                <Button
                  variant="primary"
                  isDisabled={selectedCount === 0 || isSaving}
                  onPress={() => void handleSave()}
                >
                  {isSaving ? (
                    <>
                      <Spinner size="sm" color="current" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    `บันทึก ${selectedCount} รายการ`
                  )}
                </Button>
              </Modal.Footer>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </ControlledModal>
  );
}
