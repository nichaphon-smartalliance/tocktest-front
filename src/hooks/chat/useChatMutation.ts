"use client";

import { useMutation } from "@tanstack/react-query";
import { sendChatMessage } from "@/services/chat.service";
import type { ChatRequestBody } from "@/services/chat.service";

export const useChatMutation = (repoId: string) => {
  const mutation = useMutation({
    mutationFn: (body: ChatRequestBody) => sendChatMessage(repoId, body),
  });

  return {
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
  };
};
