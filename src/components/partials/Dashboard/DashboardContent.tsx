"use client";

import { useState } from "react";
import { Button, SearchField, Spinner } from "@heroui/react";
import { message } from "@/lib/toast";
import { Plus, RefreshCw, Github } from "lucide-react";
import { useRepositoryList } from "@/hooks/repository";
import { useGithubTokens } from "@/hooks/repository";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import RepoCard from "./RepoCard";
import { AddTokenModal } from "./Modal";

export default function DashboardContent() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const { repositories, isLoading, refetch } = useRepositoryList({ search: debouncedSearch || undefined });
  const { syncRepositories, isSyncing } = useGithubTokens();

  const handleSync = async () => {
    try {
      const result = await syncRepositories();
      message.success(`ซิงค์สำเร็จ: ${result.synced} repositories`);
      refetch();
    } catch {
      message.error("ซิงค์ไม่สำเร็จ กรุณาตรวจสอบ GitHub Token");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-bold m-0">แดชบอร์ด</h1>
          <p className="m-0 text-muted text-sm">{repositories.length} repositories</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {repositories.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}

      <AddTokenModal open={tokenModalOpen} onClose={() => setTokenModalOpen(false)} />
    </div>
  );
}
