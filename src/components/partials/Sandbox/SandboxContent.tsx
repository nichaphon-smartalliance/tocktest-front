"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Chip, Input, Spinner } from "@heroui/react";
import dayjs from "dayjs";
import {
  CheckCircle2,
  Clock,
  Pencil,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Terminal,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  clearSandboxRunsApi,
  deleteSandboxRunApi,
  getSandboxRunApi,
  getSandboxStatusApi,
  listSandboxRunsApi,
  renameSandboxRunApi,
  runTestsInSandboxApi,
  type SandboxRunResponse,
} from "@/lib/api/api-main";
import { getApiErrorMessage } from "@/lib/api-error";
import { message } from "@/lib/toast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const CYPRESS_STARTER = `describe("Example", () => {
  it("visits the homepage", () => {
    cy.visit("https://example.com");
    cy.contains("Example Domain");
  });
});
`;

function statusColor(status: string): "success" | "danger" | "warning" | "accent" {
  if (status === "passed") return "success";
  if (status === "failed" || status === "error") return "danger";
  if (status === "running") return "accent";
  return "warning";
}

function StatusIcon({ status }: { status: string }) {
  if (status === "passed") return <CheckCircle2 size={14} className="text-emerald-500" />;
  if (status === "failed" || status === "error") return <XCircle size={14} className="text-red-500" />;
  if (status === "running") return <Spinner size="sm" />;
  return <Clock size={14} className="text-amber-500" />;
}

export default function SandboxContent({ repoId }: { repoId: string }) {
  const qc = useQueryClient();
  const [code, setCode] = useState(CYPRESS_STARTER);
  const [runName, setRunName] = useState("Homepage smoke");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data: statusData } = useQuery({
    queryKey: ["sandbox-status", repoId],
    queryFn: () => getSandboxStatusApi(repoId).then((response) => response.data?.data),
    staleTime: 30_000,
  });

  const { data: runs, isLoading: runsLoading } = useQuery({
    queryKey: ["sandbox-runs", repoId, debouncedSearch],
    queryFn: () => listSandboxRunsApi(repoId, { search: debouncedSearch || undefined, limit: 50 }).then((response) => response.data?.data ?? []),
    refetchInterval: (query) => {
      const items = query.state.data as SandboxRunResponse[] | undefined;
      return items?.some((item) => item.status === "queued" || item.status === "running") ? 3000 : false;
    },
  });

  const { data: selectedRun } = useQuery({
    queryKey: ["sandbox-run", repoId, selectedRunId],
    queryFn: () => (selectedRunId ? getSandboxRunApi(repoId, selectedRunId).then((response) => response.data?.data) : null),
    enabled: !!selectedRunId,
    refetchInterval: (query) => {
      const run = query.state.data as SandboxRunResponse | null | undefined;
      return run?.status === "queued" || run?.status === "running" ? 2000 : false;
    },
  });

  useEffect(() => {
    if (!runs?.length) {
      setSelectedRunId(null);
      return;
    }
    if (!selectedRunId || !runs.some((run) => run.id === selectedRunId)) {
      setSelectedRunId(runs[0].id);
    }
  }, [runs, selectedRunId]);

  const activeRun = useMemo(
    () => runs?.find((run) => run.status === "queued" || run.status === "running") ?? null,
    [runs],
  );

  const invalidateHistory = () => {
    qc.invalidateQueries({ queryKey: ["sandbox-runs", repoId] });
    qc.invalidateQueries({ queryKey: ["sandbox-run", repoId] });
  };

  const runMutation = useMutation({
    mutationFn: () => runTestsInSandboxApi(repoId, { fileContent: code, framework: "cypress", name: runName.trim() || "Untitled run" }),
    onSuccess: (response) => {
      const run = response.data?.data;
      if (!run) return;
      setSelectedRunId(run.id);
      void invalidateHistory();
      message.success("Sandbox run queued");
    },
    onError: (error) => message.error(getApiErrorMessage(error, "Failed to start sandbox run")),
  });

  const renameMutation = useMutation({
    mutationFn: (payload: { runId: string; name: string }) => renameSandboxRunApi(repoId, payload.runId, payload.name),
    onSuccess: () => {
      void invalidateHistory();
      message.success("Run renamed");
    },
    onError: (error) => message.error(getApiErrorMessage(error, "Failed to rename run")),
  });

  const deleteMutation = useMutation({
    mutationFn: (runId: string) => deleteSandboxRunApi(repoId, runId),
    onSuccess: () => {
      void invalidateHistory();
      message.success("Run deleted");
    },
    onError: (error) => message.error(getApiErrorMessage(error, "Failed to delete run")),
  });

  const clearMutation = useMutation({
    mutationFn: () => clearSandboxRunsApi(repoId),
    onSuccess: () => {
      setSelectedRunId(null);
      void invalidateHistory();
      message.success("Run history cleared");
    },
    onError: (error) => message.error(getApiErrorMessage(error, "Failed to clear run history")),
  });

  const restoreRun = (run: SandboxRunResponse) => {
    setRunName(run.name);
    setCode(run.fileContent);
    message.success("Run restored into the editor");
  };

  const renameRun = (run: SandboxRunResponse) => {
    const nextName = window.prompt("Rename sandbox run", run.name);
    if (!nextName || nextName.trim() === run.name) return;
    renameMutation.mutate({ runId: run.id, name: nextName.trim() });
  };

  const dockerAvailable = statusData === undefined ? null : (statusData?.available ?? false);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Sandbox Runner</h1>
          <p className="text-sm text-muted mt-0.5">
            Run Cypress specs in an isolated Docker job, then reuse the same record as searchable run history.
          </p>
        </div>
        <Chip size="sm" variant="soft" color={dockerAvailable === true ? "success" : dockerAvailable === false ? "danger" : "warning"}>
          <Chip.Label>{dockerAvailable === true ? "Docker available" : dockerAvailable === false ? "Docker unavailable" : "Checking..."}</Chip.Label>
        </Chip>
      </div>

      {dockerAvailable === false && (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Docker is required</Alert.Title>
            <Alert.Description>
              Install Docker and restart the backend to enable sandbox execution.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {activeRun && (
        <Alert status="accent">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Active run</Alert.Title>
            <Alert.Description>
              {activeRun.name} is {activeRun.status}. The Run button stays locked until it finishes so we do not queue duplicates.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex flex-col gap-4">
          <Card className="rounded-xl">
            <Card.Header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <Card.Title className="text-sm font-semibold m-0">Sandbox Script</Card.Title>
                <p className="text-xs text-muted mt-1">
                  Name the run, edit the Cypress spec, and launch it directly from this panel.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                isDisabled={runMutation.isPending || dockerAvailable !== true || !!activeRun}
                onPress={() => runMutation.mutate()}
              >
                <Play size={13} />
                Run
              </Button>
            </Card.Header>
            <Card.Content className="p-0">
              <div className="grid gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                <Input value={runName} onChange={(event) => setRunName(event.target.value)} placeholder="Run name" />
              </div>
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="w-full font-mono text-xs p-4 bg-gray-950 text-gray-100 resize-none outline-none rounded-b-xl"
                style={{ minHeight: "360px" }}
                spellCheck={false}
              />
            </Card.Content>
          </Card>

          {selectedRun && (
            <Card className="rounded-xl">
              <Card.Header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Terminal size={15} />
                <Card.Title className="text-sm font-semibold m-0">Run Output</Card.Title>
                <div className="ml-auto flex items-center gap-2">
                  <StatusIcon status={selectedRun.status} />
                  <Chip size="sm" variant="soft" color={statusColor(selectedRun.status)}>
                    <Chip.Label>{selectedRun.status}</Chip.Label>
                  </Chip>
                  {selectedRun.durationMs ? (
                    <span className="text-xs text-muted">{(selectedRun.durationMs / 1000).toFixed(1)}s</span>
                  ) : null}
                </div>
              </Card.Header>
              <Card.Content className="p-0">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-xs text-muted">
                  <span>{selectedRun.name}</span>
                  <span>{dayjs(selectedRun.createdAt).format("DD/MM HH:mm:ss")}</span>
                </div>
                <pre
                  className="text-xs font-mono p-4 bg-gray-950 text-gray-100 rounded-b-xl overflow-x-auto whitespace-pre-wrap"
                  style={{ maxHeight: "320px", overflowY: "auto" }}
                >
                  {selectedRun.output ?? selectedRun.errorMessage ?? "Waiting for output..."}
                </pre>
              </Card.Content>
            </Card>
          )}
        </div>

        <Card className="rounded-xl h-fit">
          <Card.Header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-col items-stretch gap-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Card.Title className="text-sm font-semibold m-0">Run History</Card.Title>
                <p className="text-xs text-muted mt-1">
                  Search previous runs, restore one back into the editor, or clean up saved records.
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                isDisabled={clearMutation.isPending || !runs?.length}
                onPress={() => clearMutation.mutate()}
              >
                <Trash2 size={13} />
                Clear
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search runs"
                  className="pl-8"
                />
              </div>
              <Button size="sm" variant="secondary" onPress={invalidateHistory}>
                <RefreshCw size={13} />
              </Button>
            </div>
          </Card.Header>
          <Card.Content className="p-0">
            {runsLoading ? (
              <div className="flex justify-center py-6">
                <Spinner size="sm" />
              </div>
            ) : !runs?.length ? (
              <div className="px-4 py-6 text-xs text-muted text-center">No runs found</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    className={`px-4 py-3 transition-colors ${selectedRunId === run.id ? "bg-indigo-50 dark:bg-indigo-950/30" : ""}`}
                  >
                    <button type="button" onClick={() => setSelectedRunId(run.id)} className="w-full text-left flex items-start gap-3">
                      <StatusIcon status={run.status} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{run.name}</div>
                        <div className="text-xs text-muted">
                          {dayjs(run.createdAt).format("DD/MM HH:mm")} · {run.framework}
                        </div>
                      </div>
                      {run.durationMs ? (
                        <span className="text-xs text-muted shrink-0">{(run.durationMs / 1000).toFixed(1)}s</span>
                      ) : null}
                    </button>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Button size="sm" variant="secondary" onPress={() => restoreRun(run)}>
                        <RotateCcw size={12} />
                        Restore
                      </Button>
                      <Button size="sm" variant="secondary" onPress={() => renameRun(run)}>
                        <Pencil size={12} />
                        Rename
                      </Button>
                      <Button size="sm" variant="danger" onPress={() => deleteMutation.mutate(run.id)}>
                        <Trash2 size={12} />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
