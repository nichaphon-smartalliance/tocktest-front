"use client";

import { useMutation } from "@tanstack/react-query";
import { getCommits } from "@/services/analysis.service";
import type { AnalysisFilterParams } from "@/types/app/analysis";

/**
 * On-demand commit search (e.g. the AI generate modal's "fetch commits for this
 * date range" step). Unlike `useCommitList`, this isn't tied to an always-on
 * query — it's triggered imperatively with params only known at call time.
 */
export const useFetchCommits = (repoId: string) => {
  const mutation = useMutation({
    mutationFn: (params?: AnalysisFilterParams) => getCommits(repoId, params),
  });

  return {
    fetchCommits: mutation.mutateAsync,
    isFetchingCommits: mutation.isPending,
  };
};
