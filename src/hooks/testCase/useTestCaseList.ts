"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTestCases, createTestCase, updateTestCase, deleteTestCase } from "@/services/testCase.service";
import type { TestCaseFormValues, TestCaseFilterParams } from "@/types/app/testCase";
import type { QaSummaryResponse } from "@/types/api/main/dashboard";
import { QA_SUMMARY_QUERY_KEY } from "@/hooks/dashboard/useQaSummary";

export const TEST_CASE_LIST_QUERY_KEY = ["testCaseList"] as const;

const adjustQaSummaryForStatusChange = (
  summary: QaSummaryResponse | null | undefined,
  previousStatus: string | undefined,
  nextStatus: string | undefined,
) => {
  if (!summary || !previousStatus || !nextStatus || previousStatus === nextStatus) return summary;
  if (!(previousStatus in summary.byStatus) || !(nextStatus in summary.byStatus)) return summary;

  const byStatus = { ...summary.byStatus };
  byStatus[previousStatus as keyof typeof byStatus] = Math.max(0, byStatus[previousStatus as keyof typeof byStatus] - 1);
  byStatus[nextStatus as keyof typeof byStatus] += 1;

  const executed = byStatus.pass + byStatus.fail + byStatus.blocked;
  const passRate = executed > 0 ? Math.round((byStatus.pass / executed) * 100) : 0;

  return { ...summary, byStatus, passRate };
};

export const useTestCaseList = (repoId: string, params?: TestCaseFilterParams) => {
  const qc = useQueryClient();
  const key = [...TEST_CASE_LIST_QUERY_KEY, repoId, params];

  const { data, isLoading, refetch } = useQuery({
    queryKey: key,
    queryFn: () => getTestCases(repoId, params),
    enabled: !!repoId,
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationFn: (values: TestCaseFormValues) => createTestCase(repoId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...TEST_CASE_LIST_QUERY_KEY, repoId] });
      qc.invalidateQueries({ queryKey: QA_SUMMARY_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<TestCaseFormValues> }) =>
      updateTestCase(repoId, id, values),
    onMutate: async ({ id, values }) => {
      const current = qc.getQueryData<Awaited<ReturnType<typeof getTestCases>>>(key);
      const previous = current?.items?.find((item) => item.id === id);

      if (previous?.status && values.status && previous.status !== values.status) {
        qc.setQueryData<QaSummaryResponse | null>(QA_SUMMARY_QUERY_KEY, (summary) =>
          adjustQaSummaryForStatusChange(summary, previous.status, values.status),
        );
      }

      return { previousStatus: previous?.status };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...TEST_CASE_LIST_QUERY_KEY, repoId] });
      qc.invalidateQueries({ queryKey: QA_SUMMARY_QUERY_KEY });
    },
    onError: (_error, _vars, context) => {
      if (!context?.previousStatus) return;
      qc.invalidateQueries({ queryKey: QA_SUMMARY_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTestCase(repoId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...TEST_CASE_LIST_QUERY_KEY, repoId] });
      qc.invalidateQueries({ queryKey: QA_SUMMARY_QUERY_KEY });
    },
  });

  return {
    testCases: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    refetch,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    remove: deleteMutation.mutateAsync,
  };
};
