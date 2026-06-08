export interface RepoSettings {
  defaultBranch: string;
  autoAnalyzeOnPush: boolean;
}

export interface GithubTokenFormValues {
  label: string;
  token: string;
}
