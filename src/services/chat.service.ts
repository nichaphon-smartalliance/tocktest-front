import { chatWithRepoApi } from "@/lib/api/api-main";

export type ChatRequestBody = Parameters<typeof chatWithRepoApi>[1];

export const sendChatMessage = async (repoId: string, body: ChatRequestBody): Promise<string> => {
  const res = await chatWithRepoApi(repoId, body);
  return res.data?.data?.response ?? "";
};
