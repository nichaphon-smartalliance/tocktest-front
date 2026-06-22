export interface ProjectDocResponse {
  id: string;
  repoId: string;
  content: string;
  version: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocVersionResponse {
  id: string;
  version: number;
  updatedAt: string;
  updatedBy: string | null;
}

export interface DocStatusResponse {
  status: "idle" | "queued" | "running" | "success" | "error";
  message: string | null;
  lastGeneratedAt: string | null;
  lastCommitSha: string | null;
  lastSourceSha: string | null;
  autoSync: boolean;
  offlineMode: boolean;
  isStale: boolean;
}
