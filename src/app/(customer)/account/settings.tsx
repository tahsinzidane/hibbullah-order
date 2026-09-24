import { router } from "expo-router";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/common/Header";
import SettingsScreen from "../../../components/settings/SettingsScreen";
import { useAuth } from "../../../hooks/useAuth";
import colors from "../../../constants/colors";

export default function CustomerSettingsScreen() {
  const { user, signOut } = useAuth();

  const settingsUser = {
    name: user?.name ?? "Guest User",
    email: user?.email ?? "guest@example.com",
    phone: (user as any)?.phone ?? "+1 (000) 000-0000",
    avatarUrl: (user as any)?.avatarUrl,
    role: (user as any)?.role ?? "Customer",
    isVerified: (user as any)?.isVerified ?? true,
  };

  const sections = [
    {
      groupTitle: "Account",
      items: [
        { id: "profile", label: "Profile", icon: "person", onPress: () => router.push("/(customer)/account/profile" as never) },
        { id: "addresses", label: "Addresses", icon: "location-on", onPress: () => router.push("/(customer)/account/addresses" as never) },
      ],
    },
    {
      groupTitle: "Preferences",
      items: [
        { id: "notifications", label: "Notifications", icon: "notifications-none", onPress: () => router.push("/(customer)/account/notifications" as never) },
        { id: "language", label: "Language", icon: "language", onPress: () => {} },
      ],
    },
    {
      groupTitle: "Support",
      items: [
        { id: "delivery", label: "Delivery Cycle", icon: "local-shipping", onPress: () => router.push("/(customer)/delivery-cycle" as never) },
        { id: "help", label: "Help Center", icon: "help-outline", onPress: () => {} },
      ],
    },
  ];

  const banner = {
    title: "Need quick access?",
    description: "Manage orders and addresses faster",
    features: ["Orders · Addresses · Support"],
    icon: "dashboard",
    onPress: () => router.push("/(customer)/(tabs)/orders" as never),
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Settings" subtitle="Preferences and account" onBack={() => router.back()} />
      <View style={styles.body}>
        <SettingsScreen
          user={settingsUser}
          banner={banner}
          sections={sections}
          onLogout={signOut}
          header={{ title: "Settings", subtitle: "Manage your Hibbullah experience" }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, backgroundColor: "#f8f9f8" },
});
