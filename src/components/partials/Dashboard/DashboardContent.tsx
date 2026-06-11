"use client";

import { useState } from "react";
import { Button, SearchField, Spinner } from "@heroui/react";
import { message } from "@/lib/toast";
import { Plus, RefreshCw, Github, CheckCircle2, AlertTriangle, CircleDashed, ExternalLink } from "lucide-react";
import { useRepositoryList } from "@/hooks/repository";
import { useGithubTokens } from "@/hooks/repository";
import { useGithubAppSetup, useQaSummary } from "@/hooks/dashboard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import RepoCard from "./RepoCard";
import { AddTokenModal } from "./Modal";

export default function DashboardContent() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const { repositories, total, isLoading, refetch } = useRepositoryList({ search: debouncedSearch || undefined });
  const privateCount = repositories.filter((r) => r.isPrivate).length;
  const { syncRepositories, isSyncing } = useGithubTokens();
  const { summary } = useQaSummary();
  const { setup } = useGithubAppSetup();

  const handleSync = async () => {
    try {
      const result = await syncRepositories();
      message.success(`ซิงค์สำเร็จ: ${result.synced} repositories`);
      refetch();
    } catch {
      message.error("ซิงค์ไม่สำเร็จ กรุณาตรวจสอบ GitHub Token");
    }
  };

  const capabilityCounts = (summary?.capabilities ?? []).reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { live: 0, partial: 0, missing: 0 } as Record<"live" | "partial" | "missing", number>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold m-0">แดชบอร์ด</h1>
          <p className="m-0 text-muted text-sm">{total || repositories.length} repositories</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <SearchField
            aria-label="ค้นหา repository"
            value={search}
            onChange={setSearch}
            className="w-[220px]"
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="ค้นหา repository..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <Button variant="secondary" onPress={() => setTokenModalOpen(true)}>
            <Github size={16} />
            GitHub Token
          </Button>
          <Button
            variant="primary"
            isDisabled={isSyncing}
            onPress={handleSync}
            aria-label="ซิงค์ repositories จาก GitHub"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            ซิงค์
          </Button>
        </div>
      </div>

      {summary && (
        <div className="mb-6 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="m-0 text-base font-semibold">Platform readiness</h2>
                <p className="m-0 mt-1 text-sm text-muted">
                  This compares the product vision we discussed with what is actually wired into the app today.
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Live {capabilityCounts.live}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  Partial {capabilityCounts.partial}
                </span>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  Missing {capabilityCounts.missing}
                </span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {summary.capabilities.map((item) => {
                const tone =
                  item.status === "live"
                    ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-500/10"
                    : item.status === "partial"
                      ? "border-amber-200 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-500/10"
                      : "border-rose-200 bg-rose-50/70 dark:border-rose-800 dark:bg-rose-500/10";

                return (
                  <div key={item.key} className={`rounded-xl border p-4 ${tone}`}>
                    <div className="mb-2 flex items-center gap-2">
                      {item.status === "live" ? (
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      ) : item.status === "partial" ? (
                        <AlertTriangle size={16} className="text-amber-600" />
                      ) : (
                        <CircleDashed size={16} className="text-rose-600" />
                      )}
                      <p className="m-0 text-sm font-semibold">{item.label}</p>
                    </div>
                    <p className="m-0 text-xs leading-5 text-muted">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="m-0 text-base font-semibold">What to build next</h2>
            <p className="m-0 mt-1 text-sm text-muted">
              Highest-value additions based on the features still missing from the platform.
            </p>

            {setup && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="m-0 text-sm font-semibold">GitHub App setup</p>
                    <p className="m-0 mt-1 text-xs text-muted">
                      App ID: {setup.appIdConfigured ? "configured" : "missing"} · Private key: {setup.privateKeyConfigured ? "configured" : "missing"} · Webhook secret: {setup.webhookSecretConfigured ? "configured" : "missing"}
                    </p>
                  </div>
                  {setup.configured ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Ready
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      Needs config
                    </span>
                  )}
                </div>

                {setup.installUrl && (
                  <a
                    href={setup.installUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                  >
                    Open GitHub App install link
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}

            <div className="mt-4 space-y-3">
              {(summary.nextMilestones ?? []).map((step, index) => (
                <div key={step} className="rounded-xl border border-dashed border-gray-200 px-4 py-3 dark:border-gray-700">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Step {index + 1}</p>
                  <p className="m-0 mt-1 text-sm leading-6">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : repositories.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Github size={64} className="opacity-20 mb-4" />
          <p className="font-medium mb-1">ยังไม่มี repository</p>
          <p className="text-sm text-muted mb-4">
            เพิ่ม GitHub Token แล้วกด ซิงค์ เพื่อดึงข้อมูล
          </p>
          <Button variant="secondary" onPress={() => setTokenModalOpen(true)}>
            <Plus size={16} />
            เพิ่ม GitHub Token
          </Button>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "ทั้งหมด", value: total },
            { label: "แสดงผล", value: repositories.length },
            { label: "Public", value: repositories.length - privateCount },
            { label: "Private", value: privateCount },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
              <p className="text-xs text-muted m-0">{s.label}</p>
              <p className="text-xl font-bold m-0 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {repositories.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
        </>
      )}

      <AddTokenModal open={tokenModalOpen} onClose={() => setTokenModalOpen(false)} />
    </div>
  );
}
