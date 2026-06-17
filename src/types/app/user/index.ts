export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  defaultPageSize: number;
  emailNotifications: boolean;
  preferredLanguage: "th" | "en";
  createdAt: string;
  updatedAt: string;
}

export type AdminSettingsTab = "profile" | "security" | "preferences" | "integrations" | "system";
