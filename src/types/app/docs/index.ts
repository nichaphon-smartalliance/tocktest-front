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
