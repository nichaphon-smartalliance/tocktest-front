"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserSettings, updateUserSettings } from "@/services/user.service";
import type { UpdateUserSettingsRequest } from "@/types/api/main/user";

export const USER_SETTINGS_QUERY_KEY = ["userSettings"] as const;

export const useUserSettings = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: USER_SETTINGS_QUERY_KEY,
    queryFn: getUserSettings,
  });

  const updateMutation = useMutation({
    mutationFn: (body: UpdateUserSettingsRequest) => updateUserSettings(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_SETTINGS_QUERY_KEY }),
  });

  return {
    settings: data,
    isLoading,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
