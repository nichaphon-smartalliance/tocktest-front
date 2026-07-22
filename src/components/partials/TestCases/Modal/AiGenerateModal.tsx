"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
import { Bot, Calendar, WifiOff, Check, GitCommitHorizontal, Info } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { useAiGenerateTestCases } from "@/hooks/testCase";
import { useBranches, useFetchCommits } from "@/hooks/analysis";
import type { GeneratedTestCasePreview } from "@/types/app/testCase";
import type { CommitItem } from "@/types/app/analysis";
import { TYPE_CONFIG, PRIORITY_CONFIG } from "../TestCases.config";

type Step = "filter" | "commits" | "preview";

const typeCfg = (t: GeneratedTestCasePreview["testType"]) => TYPE_CONFIG[t] ?? TYPE_CONFIG.manual;
const priorityCfg = (p: GeneratedTestCasePreview["priority"]) => PRIORITY_CONFIG[p] ?? PRIORITY_CONFIG.medium;
const HIDDEN_TAGS = new Set(["heuristic", "ai-offline"]);
const DATE_INPUT =
  "w-full rounded-lg border border-gray-300 dark:border-[#3e3e42] bg-white dark:bg-[#1e1e1e] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

const isOfflinePreview = (tc: GeneratedTestCasePreview) =>
  tc.tags.some((t) => t === "ai-offline" || t === "heuristic");

const formatRange = (from: string, to: string, locale: string) =>
  `${dayjs(from).locale(locale).format("D MMM YYYY")} – ${dayjs(to).locale(locale).format("D MMM YYYY")}`;

interface AiGenerateModalProps {
  repoId: string;
  folderId?: string | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AiGenerateModal({ repoId, folderId, open, onClose, onSaved }: AiGenerateModalProps) {
  const t = useTranslations("aiModal");
  const tTc = useTranslations("testCases");
  const locale = useLocale();

  const [step, setStep] = useState<Step>("filter");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [branch, setBranch] = useState("");
  const [commitList, setCommitList] = useState<CommitItem[]>([]);
  const [selectedShas, setSelectedShas] = useState<Set<string>>(new Set());
  const [previews, setPreviews] = useState<GeneratedTestCasePreview[]>([]);
  const { generate, isGenerating, save, isSaving } = useAiGenerateTestCases(repoId);
  const { branches, branchesLoading } = useBranches(repoId, open);
  const { fetchCommits, isFetchingCommits } = useFetchCommits(repoId);

  useEffect(() => {
    if (open && !fromDate && !toDate) {
      setToDate(dayjs().format("YYYY-MM-DD"));
      setFromDate(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    }
  }, [open, fromDate, toDate]);

  const dateRangeLabel = fromDate && toDate ? formatRange(fromDate, toDate, locale) : null;
  const selectedCount = useMemo(() => previews.filter((p) => p.selected).length, [previews]);
  const isOfflineResult = useMemo(() => previews.some(isOfflinePreview), [previews]);

  const handleFetchCommits = async () => {
    if (!fromDate || !toDate) { message.warning(t("selectDates")); return; }
    if (dayjs(fromDate).isAfter(dayjs(toDate))) { message.warning(t("invalidRange")); return; }
    try {
      const { items } = await fetchCommits({
        fromDate: dayjs(fromDate).startOf("day").toISOString(),
        toDate: dayjs(toDate).endOf("day").toISOString(),
        ...(branch ? { branch } : {}),
        pageSize: 50,
      });
      if (items.length === 0) { message.warning(t("noCommits")); return; }
      setCommitList(items);
      setSelectedShas(new Set(items.map((c) => c.commitSha)));
      setStep("commits");
    } catch (error) {
      message.error(getApiErrorMessage(error, t("genError")));
    }
  };

  const toggleSha = (sha: string) =>
    setSelectedShas((prev) => {
      const next = new Set(prev);
      if (next.has(sha)) next.delete(sha);
      else next.add(sha);
      return next;
    });

  const handleGenerate = async () => {
    if (selectedShas.size === 0) { message.warning(t("selectAtLeastOne")); return; }
    try {
      const result = await generate({ repoId, commitShas: [...selectedShas] });
      if (result.length === 0) { message.warning(t("noResults")); return; }
      setPreviews(result);
      message.success(t("genSuccess", { count: result.length }));
      setStep("preview");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      message.error(getApiErrorMessage(error, t("genError")));
    }
  };

  const handleSave = async () => {
    const selected = previews.filter((p) => p.selected);
    if (selected.length === 0) { message.warning(t("selectAtLeastOne")); return; }
    try {
      await save(selected.map((p) => ({ ...p, folderId: folderId ?? undefined })));
      message.success(t("saveSuccess", { count: selected.length }));
      handleClose();
      onSaved();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      message.error(getApiErrorMessage(error, t("saveError")));
    }
  };

  const resetAll = () => {
    setStep("filter");
    setCommitList([]);
    setSelectedShas(new Set());
    setPreviews([]);
    setFromDate(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    setToDate(dayjs().format("YYYY-MM-DD"));
    setBranch("");
  };

  const handleClose = useCallback(() => {
    setStep("filter");
    setFromDate("");
    setToDate("");
    setBranch("");
    setCommitList([]);
    setSelectedShas(new Set());
    setPreviews([]);
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
                  {t("heading")}
                </span>
              </Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>

            <Modal.Body className="gap-4">

              {/* ── Step 1: Filter ── */}
              {step === "filter" && (
                <>
                  <div className="flex items-start gap-3 rounded-xl bg-[var(--surface-overlay)] px-4 py-3">
                    <Info size={18} className="mt-0.5 shrink-0 text-[var(--accent-primary)]" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{t("alertTitle")}</p>
                      <p className="text-xs leading-relaxed text-muted">{t("alertDesc")}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ai-branch">{t("branch")}</Label>
                    <select
                      id="ai-branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      disabled={branchesLoading}
                      className={DATE_INPUT}
                    >
                      <option value="">{branchesLoading ? "..." : t("allBranches")}</option>
                      {branches.map((b) => (
                        <option key={b.name} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="ai-from-date">{t("fromDate")}</Label>
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
                      <Label htmlFor="ai-to-date">{t("toDate")}</Label>
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
                      {t("selectedRange", { range: dateRangeLabel })}
                    </p>
                  )}

                  <Button
                    variant="primary"
                    fullWidth
                    isDisabled={isFetchingCommits || !fromDate || !toDate}
                    onPress={() => void handleFetchCommits()}
                    className="h-11"
                  >
                    {isFetchingCommits ? (
                      <><Spinner size="sm" color="current" />{t("fetchingCommits")}</>
                    ) : (
                      <><GitCommitHorizontal size={16} />{t("fetchCommits")}</>
                    )}
                  </Button>
                </>
              )}

              {/* ── Step 2: Select commits ── */}
              {step === "commits" && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      {t("commitCount", { count: commitList.length })}
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="secondary"
                        onPress={() => setSelectedShas(new Set(commitList.map((c) => c.commitSha)))}>
                        {t("selectAllCommits")}
                      </Button>
                      <Button size="sm" variant="secondary"
                        onPress={() => setSelectedShas(new Set())}>
                        {t("deselectAllCommits")}
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto flex flex-col gap-2 pr-0.5">
                    {commitList.map((commit) => {
                      const selected = selectedShas.has(commit.commitSha);
                      return (
                        <button
                          key={commit.commitSha}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleSha(commit.commitSha)}
                          className={`w-full text-left rounded-xl border p-3 transition-all ${
                            selected
                              ? "border-indigo-500 bg-indigo-500/5 shadow-sm"
                              : "border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              aria-hidden
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-indigo-500 bg-indigo-500 text-white"
                                  : "border-gray-300 dark:border-[#3e3e42]"
                              }`}
                            >
                              {selected && <Check size={10} strokeWidth={3} />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm leading-snug line-clamp-2">
                                {commit.commitMessage ?? "(no message)"}
                              </p>
                              <p className="text-xs text-muted mt-1 flex items-center gap-2">
                                <span className="font-mono">{commit.commitSha.slice(0, 7)}</span>
                                {commit.authorName && <span>· {commit.authorName}</span>}
                                {commit.committedAt && (
                                  <span>· {dayjs(commit.committedAt).locale(locale).format("D MMM YYYY")}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ── Step 3: Preview test cases ── */}
              {step === "preview" && (
                <>
                  {isOfflineResult && (
                    <Alert status="warning">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title className="flex items-center gap-1.5">
                          <WifiOff size={14} />
                          AI offline
                        </Alert.Title>
                        <Alert.Description>{t("offlineDesc")}</Alert.Description>
                      </Alert.Content>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      {t("foundCount", { count: previews.length })}
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="secondary"
                        onPress={() => setPreviews((p) => p.map((x) => ({ ...x, selected: true })))}>
                        {t("selectAll")}
                      </Button>
                      <Button size="sm" variant="secondary"
                        onPress={() => setPreviews((p) => p.map((x) => ({ ...x, selected: false })))}>
                        {t("deselectAll")}
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto flex flex-col gap-2 pr-0.5">
                    {previews.map((tc, index) => {
                      const visibleTags = tc.tags.filter((tag) => !HIDDEN_TAGS.has(tag));
                      const stepCount = tc.steps?.length ?? 0;
                      return (
                        <button
                          key={`${tc.title}-${index}`}
                          type="button"
                          aria-pressed={tc.selected}
                          onClick={() =>
                            setPreviews((prev) =>
                              prev.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p))
                            )
                          }
                          className={`w-full text-left rounded-xl border p-3 transition-all ${
                            tc.selected
                              ? "border-indigo-500 bg-indigo-500/5 shadow-sm"
                              : "border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              aria-hidden
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                tc.selected
                                  ? "border-indigo-500 bg-indigo-500 text-white"
                                  : "border-gray-300 dark:border-[#3e3e42]"
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
                                  <Chip.Label>{tTc(typeCfg(tc.testType).labelKey)}</Chip.Label>
                                </Chip>
                                <Chip size="sm" variant="soft" color={priorityCfg(tc.priority).color}>
                                  <Chip.Label>{tTc(priorityCfg(tc.priority).labelKey)}</Chip.Label>
                                </Chip>
                                {stepCount > 0 && (
                                  <Chip size="sm" variant="soft">
                                    <Chip.Label>{t("steps", { count: stepCount })}</Chip.Label>
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

            {/* ── Footer ── */}
            {step === "commits" && (
              <Modal.Footer className="flex-wrap gap-2">
                <span className="text-sm text-muted mr-auto">
                  {t("selectedCommits", { count: selectedShas.size })}
                </span>
                <Button variant="secondary" onPress={() => setStep("filter")} isDisabled={isGenerating}>
                  {t("restart")}
                </Button>
                <Button
                  variant="primary"
                  isDisabled={selectedShas.size === 0 || isGenerating}
                  onPress={() => void handleGenerate()}
                  className="h-10"
                >
                  {isGenerating ? (
                    <><Spinner size="sm" color="current" />{t("analyzing")}</>
                  ) : (
                    <><Bot size={16} />{t("analyzeSelected")}</>
                  )}
                </Button>
              </Modal.Footer>
            )}

            {step === "preview" && (
              <Modal.Footer className="flex-wrap gap-2">
                <span className="text-sm text-muted mr-auto">
                  {t("selectedCount", { count: selectedCount, total: previews.length })}
                </span>
                <Button variant="secondary" onPress={resetAll} isDisabled={isSaving}>
                  {t("restart")}
                </Button>
                <Button
                  variant="primary"
                  isDisabled={selectedCount === 0 || isSaving}
                  onPress={() => void handleSave()}
                >
                  {isSaving ? (
                    <><Spinner size="sm" color="current" />{t("saving")}</>
                  ) : (
                    t("saveCount", { count: selectedCount })
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
