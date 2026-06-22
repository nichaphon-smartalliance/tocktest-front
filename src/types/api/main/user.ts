export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsResponse {
  id: string;
  userId: string;
  defaultPageSize: number;
  emailNotifications: boolean;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserSettingsRequest {
  defaultPageSize?: number;
  emailNotifications?: boolean;
  preferredLanguage?: "th" | "en";
}
