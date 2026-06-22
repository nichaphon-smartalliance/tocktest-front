import {
  getUserProfileApi,
  updateUserProfileApi,
  changeUserPasswordApi,
  getUserSettingsApi,
  updateUserSettingsApi,
} from "@/lib/api/api-main";
import type { UpdateUserSettingsRequest } from "@/types/api/main/user";

export const getUserProfile = async () => {
  const res = await getUserProfileApi();
  return res.data?.data ?? null;
};

export const updateUserProfile = async (name: string) => {
  const res = await updateUserProfileApi({ name });
  return res.data?.data ?? null;
};

export const changeUserPassword = async (currentPassword: string, newPassword: string) => {
  const res = await changeUserPasswordApi({ currentPassword, newPassword });
  return res.data?.data ?? null;
};

export const getUserSettings = async () => {
  const res = await getUserSettingsApi();
  return res.data?.data ?? null;
};

export const updateUserSettings = async (body: UpdateUserSettingsRequest) => {
  const res = await updateUserSettingsApi(body);
  return res.data?.data ?? null;
};
