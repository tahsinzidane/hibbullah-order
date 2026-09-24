import type { SettingsBanner, SettingsSection, SettingsUser } from "./types";

// Placeholder data — replace with API/store injection in production
export const mockUser: SettingsUser = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 014-2836",
  avatarUrl: undefined,
  role: "Customer",
  isVerified: true,
};

export const mockBanner: SettingsBanner = {
  title: "Dashboard Access",
  description: "Manage your pharmacy operations",
  features: ["Orders · Inventory · Analytics"],
  icon: "dashboard",
  onPress: () => {},
};

export const mockSections: SettingsSection[] = [
  {
    groupTitle: "Account",
    items: [
      { id: "profile", label: "Profile", icon: "person", onPress: () => {} },
      { id: "addresses", label: "Addresses", icon: "location-on", onPress: () => {} },
      { id: "security", label: "Security", icon: "lock", onPress: () => {} },
    ],
  },
  {
    groupTitle: "Preferences",
    items: [
      { id: "notifications", label: "Notifications", icon: "notifications-none", onPress: () => {} },
      { id: "language", label: "Language", icon: "language", onPress: () => {} },
    ],
  },
  {
    groupTitle: "Support",
    items: [
      { id: "help", label: "Help Center", icon: "help-outline", onPress: () => {} },
      { id: "about", label: "About", icon: "info-outline", onPress: () => {} },
    ],
  },
];
