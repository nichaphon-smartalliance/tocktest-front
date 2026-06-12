import {
  getGithubAppSetupApi,
  getGithubAppInstallUrlApi,
  getGithubAppInstallationsApi,
  getGithubAppInstallationRepositoriesApi,
  importGithubAppInstallationRepositoryApi,
  getRecentJobsApi,
  getQaSummaryApi,
} from "@/lib/api/api-main";

export const getQaSummary = async () => {
  const res = await getQaSummaryApi();
  return res.data?.data ?? null;
};

export const getGithubAppSetup = async () => {
  const res = await getGithubAppSetupApi();
  return res.data?.data ?? null;
};

export const getGithubAppInstallUrl = async (): Promise<string> => {
  const res = await getGithubAppInstallUrlApi();
  return res.data?.data?.url ?? "";
};

export const getGithubAppInstallations = async () => {
  const res = await getGithubAppInstallationsApi();
  return res.data?.data ?? [];
};

export const getGithubAppInstallationRepositories = async (installationId: string) => {
  const res = await getGithubAppInstallationRepositoriesApi(installationId);
  return res.data?.data ?? [];
};

export const importGithubAppInstallationRepository = async (installationId: string, fullName: string) => {
  const res = await importGithubAppInstallationRepositoryApi(installationId, fullName);
  return res.data?.data;
};

export const getRecentJobs = async () => {
  const res = await getRecentJobsApi();
  return res.data?.data ?? [];
};
