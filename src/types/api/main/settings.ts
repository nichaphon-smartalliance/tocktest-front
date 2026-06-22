export interface RepoSettingsResponse {
  id: string;
  repoId: string;
  defaultBranch: string;
  aiProvider: string | null;
  aiModel: string | null;
  autoAnalyzeOnPush: boolean;
  aiOfflineMode: boolean;
  docsAutoSync: boolean;
  docsSyncStatus: "idle" | "queued" | "running" | "success" | "error";
  docsSyncMessage: string | null;
  docsLastGeneratedAt: string | null;
  docsLastCommitSha: string | null;
  docsLastSourceSha: string | null;
  createdAt: string;
  updatedAt: string;
}
