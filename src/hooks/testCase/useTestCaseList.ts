"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTestCases, createTestCase, updateTestCase, deleteTestCase } from "@/services/testCase.service";
import type { TestCaseFormValues, TestCaseFilterParams } from "@/types/app/testCase";

export const TEST_CASE_LIST_QUERY_KEY = ["testCaseList"] as const;

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
    onSuccess: () => qc.invalidateQueries({ queryKey: [...TEST_CASE_LIST_QUERY_KEY, repoId] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<TestCaseFormValues> }) =>
      updateTestCase(repoId, id, values),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...TEST_CASE_LIST_QUERY_KEY, repoId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTestCase(repoId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...TEST_CASE_LIST_QUERY_KEY, repoId] }),
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
    isDeleting: deleteMutation.isPending,
  };
};
