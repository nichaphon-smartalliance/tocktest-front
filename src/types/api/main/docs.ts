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
