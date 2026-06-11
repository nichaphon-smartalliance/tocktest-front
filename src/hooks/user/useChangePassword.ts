"use client";

import { useMutation } from "@tanstack/react-query";
import { changeUserPassword } from "@/services/user.service";

export const useChangePassword = () => {
  const mutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changeUserPassword(currentPassword, newPassword),
  });

  return {
    changePassword: mutation.mutateAsync,
    isChanging: mutation.isPending,
  };
};
