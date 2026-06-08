export interface RepoSettingsResponse {
  id: string;
  repoId: string;
  defaultBranch: string;
  aiProvider: string | null;
  aiModel: string | null;
  autoAnalyzeOnPush: boolean;
  createdAt: string;
  updatedAt: string;
}
