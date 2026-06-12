export interface Repository {
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
}

export interface GithubToken {
  id: string;
  label: string;
  provider: string;
  githubLogin: string | null;
  scopes: string[];
  isActive: boolean;
  lastTestedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface AddTokenFormValues {
  label: string;
  token: string;
}

export interface RepoFilterParams {
  search?: string;
  page?: number;
  pageSize?: number;
}
