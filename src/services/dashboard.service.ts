import { getGithubAppSetupApi, getQaSummaryApi } from "@/lib/api/api-main";

export const getQaSummary = async () => {
  const res = await getQaSummaryApi();
  return res.data?.data ?? null;
};

export const getGithubAppSetup = async () => {
  const res = await getGithubAppSetupApi();
  return res.data?.data ?? null;
};
