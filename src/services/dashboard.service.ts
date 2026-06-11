import { getQaSummaryApi } from "@/lib/api/api-main";

export const getQaSummary = async () => {
  const res = await getQaSummaryApi();
  return res.data?.data ?? null;
};
