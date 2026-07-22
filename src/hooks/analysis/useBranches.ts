"use client";

import { useQuery } from "@tanstack/react-query";
import { getBranches } from "@/services/analysis.service";
import { BRANCHES_QUERY_KEY } from "./useCommitList";

export const useBranches = (repoId: string, enabled = true) => {
  const { data, isLoading } = useQuery({
    queryKey: [...BRANCHES_QUERY_KEY, repoId],
    queryFn: () => getBranches(repoId),
    enabled: enabled && !!repoId,
    staleTime: 10 * 60_000,
  });

  return {
    branches: data ?? [],
    branchesLoading: isLoading,
  };
};
