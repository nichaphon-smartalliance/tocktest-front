import {
  getGithubAppSetupApi,
  getGithubAppInstallUrlApi,
  getGithubAppInstallationsApi,
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
