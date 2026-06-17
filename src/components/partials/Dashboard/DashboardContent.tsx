"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, SearchField, Spinner } from "@heroui/react";
import { message } from "@/lib/toast";
import { Plus, RefreshCw, Github } from "lucide-react";
import { useRepositoryList, useGithubTokens } from "@/hooks/repository";
import { useGithubAppSetup } from "@/hooks/dashboard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import RepoCard from "./RepoCard";
import { AddTokenModal } from "./Modal";

export default function DashboardContent() {
  const t = useTranslations("dashboard");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const { repositories, total, isLoading, refetch } = useRepositoryList({ search: debouncedSearch || undefined });
  const privateCount = repositories.filter((r) => r.isPrivate).length;
  const { syncRepositories, isSyncing } = useGithubTokens();
  const { setup } = useGithubAppSetup();

  const handleSync = async () => {
    try {
      const result = await syncRepositories();
      message.success(t("syncSuccess", { count: result.synced }));
      refetch();
    } catch {
      message.error(t("syncError"));
    }
  };

  return (
    <div>
      <div className="dashboard-hero rounded-[1.75rem] px-5 py-5 md:px-6 md:py-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold m-0">{t("title")}</h1>
          <p className="m-0 text-muted text-sm">{t("repositories", { count: total || repositories.length })}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <SearchField
            aria-label={t("searchRepo")}
            value={search}
            onChange={setSearch}
            className="w-[220px]"
          >
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder={t("searchRepoPlaceholder")} />
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
            aria-label={t("syncAria")}
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            {t("sync")}
          </Button>
        </div>
        </div>
      </div>

      {setup && !setup.configured && (
        <div className="mb-4 rounded-2xl border border-amber-200/70 bg-amber-50/85 px-4 py-3 text-sm shadow-sm dark:border-amber-700/40 dark:bg-amber-500/10">
          <span className="font-semibold text-amber-700 dark:text-amber-300">{t("appNotConfigured")}</span>
          <span className="ml-2 text-amber-600 dark:text-amber-400 text-xs">
            {t("appConfigHint")}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : repositories.length === 0 ? (
        <div className="surface-card rounded-[1.75rem] flex flex-col items-center py-20 text-center px-6">
          <Github size={64} className="opacity-20 mb-4" />
          <p className="font-medium mb-1">{t("noRepos")}</p>
          <p className="text-sm text-muted mb-4">
            {t("noReposHint")}
          </p>
          <Button variant="secondary" onPress={() => setTokenModalOpen(true)}>
            <Plus size={16} />
            {t("addToken")}
          </Button>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: t("statAll"), value: total },
            { label: t("statShowing"), value: repositories.length },
            { label: t("statPublic"), value: repositories.length - privateCount },
            { label: t("statPrivate"), value: privateCount },
          ].map((s) => (
            <div key={s.label} className="surface-card rounded-2xl px-4 py-3">
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
