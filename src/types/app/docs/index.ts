export interface ProjectDoc {
  id: string;
  repoId: string;
  content: string;
  version: number;
  updatedAt: string;
}

export type DocVersion =
  | { kind: 'version'; id: string; version: number; updatedAt: string; updatedBy: string | null }
  | { kind: 'deleted'; id: string; email: string; deletedAt: string };

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
