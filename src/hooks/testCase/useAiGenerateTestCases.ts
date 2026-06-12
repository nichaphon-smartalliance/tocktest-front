"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aiGenerateTestCases, bulkSaveTestCases } from "@/services/testCase.service";
import type { AiGenerateRequest } from "@/types/api/main/testCase";
import type { GeneratedTestCasePreview } from "@/types/app/testCase";
import { TEST_CASE_LIST_QUERY_KEY } from "./useTestCaseList";

export const useAiGenerateTestCases = (repoId: string) => {
  const qc = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (req: AiGenerateRequest) => aiGenerateTestCases(req),
  });

  const saveMutation = useMutation({
    mutationFn: (previews: GeneratedTestCasePreview[]) => bulkSaveTestCases(repoId, previews),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...TEST_CASE_LIST_QUERY_KEY, repoId] }),
  });

  return {
    generate: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
