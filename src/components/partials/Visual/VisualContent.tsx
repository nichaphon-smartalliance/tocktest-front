"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Button, Chip, Spinner, Alert, TextField, Label, InputGroup } from "@heroui/react";
import { Camera, Plus, Trash2, GitCompare, CheckCircle2, XCircle, RefreshCw, Bot } from "lucide-react";
import {
  createVisualBaselineApi,
  listVisualBaselinesApi,
  deleteVisualBaselineApi,
  compareVisualApi,
  listVisualComparisonsApi,
  type VisualBaselineResponse,
  type VisualComparisonResponse,
} from "@/lib/api/api-main";
import { message } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import dayjs from "dayjs";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DiffScore({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted">—</span>;
  const pct = (score * 100).toFixed(2);
  const color = score < 0.01 ? "text-emerald-600" : score < 0.05 ? "text-amber-600" : "text-red-600";
  return <span className={`text-xs font-mono font-semibold ${color}`}>{pct}% diff</span>;
}

interface BaselinePanelProps {
  repoId: string;
  baseline: VisualBaselineResponse;
  onCompare: (baselineId: string) => void;
  onDelete: (id: string) => void;
}

function BaselinePanel({ repoId, baseline, onCompare, onDelete }: BaselinePanelProps) {
  const { data: comps } = useQuery({
    queryKey: ["visual-comparisons", repoId, baseline.id],
    queryFn: () => listVisualComparisonsApi(repoId, baseline.id).then((r) => r.data?.data ?? []),
    staleTime: 10_000,
  });

  return (
    <Card className="rounded-xl">
      <Card.Header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <Card.Title className="text-sm font-semibold m-0">{baseline.name}</Card.Title>
          <p className="text-xs text-muted mt-0.5 truncate max-w-[240px]">{baseline.url}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Chip size="sm" variant="soft">
            <Chip.Label className="text-[10px]">{baseline.viewport}</Chip.Label>
          </Chip>
          <Button size="sm" variant="secondary" onPress={() => onCompare(baseline.id)}>
            <GitCompare size={13} />
            Compare
          </Button>
          <ConfirmDialog
            title="Delete baseline?"
            confirmLabel="Delete"
            confirmVariant="danger"
            onConfirm={() => onDelete(baseline.id)}
            trigger={
              <Button variant="ghost" isIconOnly size="sm">
                <Trash2 size={13} className="text-red-500" />
              </Button>
            }
          />
        </div>
      </Card.Header>
      {comps && comps.length > 0 && (
        <Card.Content className="px-4 py-3 flex flex-col gap-2">
          <p className="text-xs text-muted font-semibold uppercase tracking-wider">Recent Comparisons</p>
          {comps.slice(0, 5).map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
              {c.status === "pass" ? (
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              ) : (
                <XCircle size={14} className="text-red-500 shrink-0" />
              )}
              <DiffScore score={c.diffScore} />
              <Chip size="sm" variant="soft" color={c.status === "pass" ? "success" : "danger"}>
                <Chip.Label>{c.status}</Chip.Label>
              </Chip>
              <span className="ml-auto text-[10px] text-muted">{dayjs(c.createdAt).format("DD/MM HH:mm")}</span>
              {c.aiAnalysis && (
                <div className="w-full mt-1 flex items-start gap-1 text-xs text-muted">
                  <Bot size={11} className="shrink-0 mt-0.5" />
                  <span>{c.aiAnalysis}</span>
                </div>
              )}
            </div>
          ))}
        </Card.Content>
      )}
    </Card>
  );
}

interface AddBaselineModalProps {
  repoId: string;
  onDone: () => void;
}

function AddBaselineForm({ repoId, onDone }: AddBaselineModalProps) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Select a screenshot first");
      const screenshotData = await fileToBase64(file);
      return createVisualBaselineApi(repoId, { name, url, screenshotData });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["visual-baselines", repoId] });
      message.success("Baseline created");
      onDone();
    },
    onError: (err) => message.error(getApiErrorMessage(err, "Failed to create baseline")),
  });

  return (
    <Card className="rounded-xl">
      <Card.Header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Card.Title className="text-sm font-semibold m-0">New Baseline</Card.Title>
      </Card.Header>
      <Card.Content className="px-4 py-4 flex flex-col gap-3">
        <TextField value={name} onChange={setName} isRequired>
          <Label>Name</Label>
          <InputGroup><InputGroup.Input placeholder="Homepage — desktop" /></InputGroup>
        </TextField>
        <TextField value={url} onChange={setUrl}>
          <Label>URL (optional, for reference)</Label>
          <InputGroup><InputGroup.Input placeholder="https://app.example.com" /></InputGroup>
        </TextField>
        <div>
          <p className="text-sm font-medium mb-1.5">Screenshot (PNG)</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button variant="secondary" size="sm" onPress={() => inputRef.current?.click()}>
            <Camera size={13} />
            {file ? file.name : "Choose screenshot"}
          </Button>
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="primary" isDisabled={mutation.isPending || !name || !file} onPress={() => mutation.mutate()}>
            {mutation.isPending ? <Spinner size="sm" /> : <Plus size={13} />}
            Save baseline
          </Button>
          <Button variant="secondary" onPress={onDone}>Cancel</Button>
        </div>
      </Card.Content>
    </Card>
  );
}

interface CompareFormProps {
  repoId: string;
  baselineId: string;
  onDone: () => void;
}

function CompareForm({ repoId, baselineId, onDone }: CompareFormProps) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState("1");
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<VisualComparisonResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Select a screenshot first");
      const screenshotData = await fileToBase64(file);
      return compareVisualApi(repoId, { baselineId, screenshotData, threshold: Number(threshold) / 100 });
    },
    onSuccess: (res) => {
      const comp = res.data?.data;
      setResult(comp ?? null);
      void qc.invalidateQueries({ queryKey: ["visual-comparisons", repoId, baselineId] });
      message.success("Comparison complete");
    },
    onError: (err) => message.error(getApiErrorMessage(err, "Comparison failed")),
  });

  return (
    <Card className="rounded-xl">
      <Card.Header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <Card.Title className="text-sm font-semibold m-0">Compare against baseline</Card.Title>
        <Button variant="ghost" size="sm" onPress={onDone}>Close</Button>
      </Card.Header>
      <Card.Content className="px-4 py-4 flex flex-col gap-3">
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button variant="secondary" size="sm" onPress={() => inputRef.current?.click()}>
            <Camera size={13} />
            {file ? file.name : "Choose candidate screenshot"}
          </Button>
        </div>
        <TextField value={threshold} onChange={setThreshold}>
          <Label>Threshold (% allowed diff)</Label>
          <InputGroup><InputGroup.Input type="number" min="0" max="100" step="0.1" /></InputGroup>
        </TextField>
        <Button variant="primary" isDisabled={mutation.isPending || !file} onPress={() => mutation.mutate()}>
          {mutation.isPending ? <Spinner size="sm" /> : <GitCompare size={13} />}
          Run comparison
        </Button>

        {result && (
          <div className={`rounded-lg border px-4 py-3 ${result.status === "pass" ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20" : "border-red-300 bg-red-50 dark:bg-red-900/20"}`}>
            <div className="flex items-center gap-2 mb-1">
              {result.status === "pass" ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-600" />}
              <span className="font-semibold text-sm">{result.status === "pass" ? "PASS" : "FAIL"}</span>
              <DiffScore score={result.diffScore} />
            </div>
            {result.aiAnalysis && (
              <p className="text-xs text-muted mt-2 flex items-start gap-1">
                <Bot size={11} className="shrink-0 mt-0.5" />
                {result.aiAnalysis}
              </p>
            )}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

export default function VisualContent({ repoId }: { repoId: string }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [comparingId, setComparingId] = useState<string | null>(null);

  const { data: baselines, isLoading } = useQuery({
    queryKey: ["visual-baselines", repoId],
    queryFn: () => listVisualBaselinesApi(repoId).then((r) => r.data?.data ?? []),
    staleTime: 10_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVisualBaselineApi(repoId, id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["visual-baselines", repoId] });
      message.success("Baseline deleted");
    },
    onError: (err) => message.error(getApiErrorMessage(err, "Delete failed")),
  });

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Visual Regression</h1>
          <p className="text-sm text-muted mt-0.5">Screenshot baselines and pixel-level diff comparisons</p>
        </div>
        {!adding && (
          <Button variant="primary" size="sm" onPress={() => setAdding(true)}>
            <Plus size={14} />
            New Baseline
          </Button>
        )}
      </div>

      {adding && <AddBaselineForm repoId={repoId} onDone={() => setAdding(false)} />}
      {comparingId && (
        <CompareForm repoId={repoId} baselineId={comparingId} onDone={() => setComparingId(null)} />
      )}

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : !baselines?.length ? (
        <Card className="rounded-xl">
          <Card.Content className="text-center py-12">
            <Camera size={32} className="mx-auto text-muted mb-3" />
            <p className="text-sm font-medium">No baselines yet</p>
            <p className="text-xs text-muted mt-1 mb-4">
              Upload a reference screenshot to start tracking visual regressions.
            </p>
            <Button variant="primary" size="sm" onPress={() => setAdding(true)}>
              <Plus size={13} />
              Add first baseline
            </Button>
          </Card.Content>
        </Card>
      ) : (
        baselines.map((b) => (
          <BaselinePanel
            key={b.id}
            repoId={repoId}
            baseline={b}
            onCompare={(id) => { setComparingId(id); setAdding(false); }}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))
      )}
    </div>
  );
}
