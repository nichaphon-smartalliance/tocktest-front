"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Button, Chip, Spinner, Alert, Select, ListBox, Label } from "@heroui/react";
import { Play, RefreshCw, Terminal, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import {
  getSandboxStatusApi,
  runTestsInSandboxApi,
  listSandboxRunsApi,
  getSandboxRunApi,
  type SandboxRunResponse,
} from "@/lib/api/api-main";
import { message } from "@/lib/toast";
import { getApiErrorMessage } from "@/lib/api-error";
import dayjs from "dayjs";

const PLAYWRIGHT_STARTER = `import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
`;

const CYPRESS_STARTER = `describe('Example', () => {
  it('visits the homepage', () => {
    cy.visit('https://example.com');
    cy.contains('Example Domain');
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
  const [framework, setFramework] = useState<"playwright" | "cypress">("playwright");
  const [code, setCode] = useState(PLAYWRIGHT_STARTER);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const { data: statusData } = useQuery({
    queryKey: ["sandbox-status", repoId],
    queryFn: () => getSandboxStatusApi(repoId).then((r) => r.data?.data),
    staleTime: 30_000,
  });

  const { data: runs, isLoading: runsLoading } = useQuery({
    queryKey: ["sandbox-runs", repoId],
    queryFn: () => listSandboxRunsApi(repoId).then((r) => r.data?.data ?? []),
    refetchInterval: (q) => {
      const items = q.state.data as SandboxRunResponse[] | undefined;
      return items?.some((r) => r.status === "queued" || r.status === "running") ? 3000 : false;
    },
  });

  const { data: selectedRun } = useQuery({
    queryKey: ["sandbox-run", repoId, selectedRunId],
    queryFn: () => selectedRunId ? getSandboxRunApi(repoId, selectedRunId).then((r) => r.data?.data) : null,
    enabled: !!selectedRunId,
    refetchInterval: (q) => {
      const run = q.state.data as SandboxRunResponse | null | undefined;
      return run && (run.status === "queued" || run.status === "running") ? 2000 : false;
    },
  });

  useEffect(() => {
    setCode(framework === "playwright" ? PLAYWRIGHT_STARTER : CYPRESS_STARTER);
  }, [framework]);

  const runMutation = useMutation({
    mutationFn: () => runTestsInSandboxApi(repoId, { fileContent: code, framework }),
    onSuccess: (res) => {
      const run = res.data?.data;
      if (run) {
        setSelectedRunId(run.id);
        void qc.invalidateQueries({ queryKey: ["sandbox-runs", repoId] });
        message.success("Test run queued");
      }
    },
    onError: (err) => message.error(getApiErrorMessage(err, "Failed to start test run")),
  });

  const dockerAvailable = statusData?.available;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Docker Sandbox</h1>
          <p className="text-sm text-muted mt-0.5">Run tests in an isolated container</p>
        </div>
        <Chip size="sm" variant="soft" color={dockerAvailable ? "success" : "danger"}>
          <Chip.Label>{dockerAvailable ? "Docker available" : "Docker unavailable"}</Chip.Label>
        </Chip>
      </div>

      {!dockerAvailable && (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              Docker is not available on this server. Install Docker and restart the backend to enable sandbox execution.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <Card className="rounded-xl">
            <Card.Header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <Card.Title className="text-sm font-semibold m-0">Test File</Card.Title>
              <div className="flex items-center gap-2">
                <Select
                  selectedKey={framework}
                  onSelectionChange={(k) => k && setFramework(k as "playwright" | "cypress")}
                >
                  <Select.Trigger className="h-7 text-xs">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="playwright" textValue="Playwright">Playwright<ListBox.ItemIndicator /></ListBox.Item>
                      <ListBox.Item id="cypress" textValue="Cypress">Cypress<ListBox.ItemIndicator /></ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
                <Button
                  size="sm"
                  variant="primary"
                  isDisabled={runMutation.isPending || !dockerAvailable}
                  onPress={() => runMutation.mutate()}
                >
                  <Play size={13} />
                  Run
                </Button>
              </div>
            </Card.Header>
            <Card.Content className="p-0">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full font-mono text-xs p-4 bg-gray-950 dark:bg-gray-950 text-gray-100 resize-none outline-none rounded-b-xl"
                style={{ minHeight: "340px" }}
                spellCheck={false}
              />
            </Card.Content>
          </Card>

          {selectedRun && (
            <Card className="rounded-xl">
              <Card.Header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Terminal size={15} />
                <Card.Title className="text-sm font-semibold m-0">Output</Card.Title>
                <div className="ml-auto flex items-center gap-2">
                  <StatusIcon status={selectedRun.status} />
                  <Chip size="sm" variant="soft" color={statusColor(selectedRun.status)}>
                    <Chip.Label>{selectedRun.status}</Chip.Label>
                  </Chip>
                  {selectedRun.durationMs && (
                    <span className="text-xs text-muted">{(selectedRun.durationMs / 1000).toFixed(1)}s</span>
                  )}
                </div>
              </Card.Header>
              <Card.Content className="p-0">
                <pre className="text-xs font-mono p-4 bg-gray-950 text-gray-100 rounded-b-xl overflow-x-auto whitespace-pre-wrap" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {selectedRun.output ?? selectedRun.errorMessage ?? "Waiting for output…"}
                </pre>
              </Card.Content>
            </Card>
          )}
        </div>

        <div>
          <Card className="rounded-xl">
            <Card.Header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <Card.Title className="text-sm font-semibold m-0">Run History</Card.Title>
              <button
                type="button"
                onClick={() => void qc.invalidateQueries({ queryKey: ["sandbox-runs", repoId] })}
                className="text-muted hover:text-primary transition-colors"
              >
                <RefreshCw size={13} />
              </button>
            </Card.Header>
            <Card.Content className="p-0">
              {runsLoading ? (
                <div className="flex justify-center py-6"><Spinner size="sm" /></div>
              ) : !runs?.length ? (
                <div className="px-4 py-6 text-xs text-muted text-center">No runs yet</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {runs.map((run) => (
                    <button
                      key={run.id}
                      type="button"
                      onClick={() => setSelectedRunId(run.id)}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedRunId === run.id ? "bg-indigo-50 dark:bg-indigo-950/30" : ""}`}
                    >
                      <StatusIcon status={run.status} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{run.framework}</div>
                        <div className="text-[10px] text-muted">{dayjs(run.createdAt).format("DD/MM HH:mm")}</div>
                      </div>
                      {run.durationMs && (
                        <span className="text-[10px] text-muted shrink-0">{(run.durationMs / 1000).toFixed(1)}s</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
