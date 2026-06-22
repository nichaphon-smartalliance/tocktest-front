export interface ProjectDoc {
  id: string;
  repoId: string;
  content: string;
  version: number;
  updatedAt: string;
}

export interface DocVersion {
  id: string;
  version: number;
  updatedAt: string;
  updatedBy: string | null;
}

export interface DocStatus {
  status: "idle" | "queued" | "running" | "success" | "error";
  message: string | null;
  lastGeneratedAt: string | null;
  lastCommitSha: string | null;
  lastSourceSha: string | null;
  autoSync: boolean;
  offlineMode: boolean;
  isStale: boolean;
}
