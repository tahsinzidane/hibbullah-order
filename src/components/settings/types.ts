import type { ComponentType } from "react";

export type IconComponent = ComponentType<{ size?: number; color?: string; style?: any }>;

export type SettingsUser = {
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: string;
  isVerified: boolean;
};

export type SettingsBanner = {
  title: string;
  description: string;
  features: string[];
  icon?: string; // MaterialIcons name
  ctaLabel?: string;
  onPress: () => void;
};

export type SettingsMenuItem = {
  id: string;
  label: string;
  icon: string; // MaterialIcons name
  onPress: () => void;
};

export type SettingsSection = {
  groupTitle: string;
  items: SettingsMenuItem[];
};

export type SettingsScreenProps = {
  user: SettingsUser;
  banner?: SettingsBanner | null;
  sections: SettingsSection[];
  onLogout: () => void;
  header?: {
    title: string;
    subtitle?: string;
  };
};
