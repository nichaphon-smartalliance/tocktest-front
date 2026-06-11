export interface RepositoryResponse {
  id: string;
  githubRepoId: number;
  fullName: string;
  name: string;
  description: string | null;
  defaultBranch: string;
  isPrivate: boolean;
  htmlUrl: string;
  ownerLogin: string;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GithubTokenResponse {
  id: string;
  label: string;
  scopes: string[];
  isActive: boolean;
  lastTestedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface SyncRepositoriesResponse {
  synced: number;
  total: number;
}
