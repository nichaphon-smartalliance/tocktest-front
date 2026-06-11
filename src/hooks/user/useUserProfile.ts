"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile } from "@/services/user.service";

export const USER_PROFILE_QUERY_KEY = ["userProfile"] as const;

export const useUserProfile = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: getUserProfile,
  });

  const updateMutation = useMutation({
    mutationFn: (name: string) => updateUserProfile(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY }),
  });

  return {
    profile: data,
    isLoading,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
