"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTestCases, createTestCase, updateTestCase, deleteTestCase } from "@/services/testCase.service";
import type { TestCase, TestCaseFilterParams, TestCaseFormValues } from "@/types/app/testCase";
import type { QaSummaryResponse } from "@/types/api/main/dashboard";
import { QA_SUMMARY_QUERY_KEY } from "@/hooks/dashboard/useQaSummary";

export const TEST_CASE_LIST_QUERY_KEY = ["testCaseList"] as const;

type TestCaseListResponse = Awaited<ReturnType<typeof getTestCases>>;

const updateTestCaseListItem = (
  data: TestCaseListResponse | undefined,
  id: string,
  updater: (item: TestCase) => TestCase,
) => {
  if (!data?.items?.length) return data;

  let changed = false;
  const items = data.items.map((item) => {
    if (item.id !== id) return item;
    changed = true;
    return updater(item);
  });

  return changed ? { ...data, items } : data;
};

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
      await qc.cancelQueries({ queryKey: [...TEST_CASE_LIST_QUERY_KEY, repoId] });

      const queryEntries = qc.getQueriesData<TestCaseListResponse>({
        queryKey: [...TEST_CASE_LIST_QUERY_KEY, repoId],
      });
      const previousQueries = queryEntries.map(([queryKey, data]) => [queryKey, data] as const);

      let previous: TestCase | undefined;
      for (const [, data] of queryEntries) {
        const match = data?.items?.find((item) => item.id === id);
        if (match) {
          previous = match;
          break;
        }
      }

      qc.setQueriesData<TestCaseListResponse>({ queryKey: [...TEST_CASE_LIST_QUERY_KEY, repoId] }, (current) =>
        updateTestCaseListItem(current, id, (item) => ({ ...item, ...values })),
      );

      if (previous?.status && values.status && previous.status !== values.status) {
        qc.setQueryData<QaSummaryResponse | null>(QA_SUMMARY_QUERY_KEY, (summary) =>
          adjustQaSummaryForStatusChange(summary, previous.status, values.status),
        );
      }

      return { previousQueries, previousStatus: previous?.status };
    },
    onSuccess: (updated) => {
      qc.setQueriesData<TestCaseListResponse>({ queryKey: [...TEST_CASE_LIST_QUERY_KEY, repoId] }, (current) =>
        updateTestCaseListItem(current, updated.id, () => updated),
      );
      qc.invalidateQueries({ queryKey: QA_SUMMARY_QUERY_KEY });
    },
    onError: (_error, vars, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        qc.setQueryData(queryKey, data);
      });

      const nextStatus = vars.values.status;
      if (context?.previousStatus && nextStatus && context.previousStatus !== nextStatus) {
        qc.setQueryData<QaSummaryResponse | null>(QA_SUMMARY_QUERY_KEY, (summary) =>
          adjustQaSummaryForStatusChange(summary, nextStatus, context.previousStatus),
        );
      }

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
