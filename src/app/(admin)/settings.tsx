import { router } from "expo-router";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/common/Header";
import SettingsScreen from "../../components/settings/SettingsScreen";
import { useAuth } from "../../hooks/useAuth";
import colors from "../../constants/colors";

export default function AdminSettingsScreen() {
  const { user, signOut } = useAuth();

  const settingsUser = {
    name: user?.name ?? "Admin",
    email: user?.email ?? "admin@hibbullah.com",
    phone: (user as any)?.phone ?? "+880 1XXX-XXXXXX",
    avatarUrl: (user as any)?.avatarUrl,
    role: "Admin",
    isVerified: true,
  };

  const sections = [
    {
      groupTitle: "Store",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "dashboard", onPress: () => router.push("/(admin)" as never) },
        { id: "orders", label: "Orders", icon: "receipt-long", onPress: () => router.push("/(admin)/orders" as never) },
        { id: "products", label: "Products", icon: "medication", onPress: () => router.push("/(admin)/products" as never) },
        { id: "inventory", label: "Inventory", icon: "inventory-2", onPress: () => router.push("/(admin)/inventory" as never) },
      ],
    },
    {
      groupTitle: "Management",
      items: [
        { id: "customers", label: "Customers", icon: "people", onPress: () => router.push("/(admin)/customers" as never) },
        { id: "reports", label: "Reports", icon: "bar-chart", onPress: () => router.push("/(admin)/reports" as never) },
        { id: "audit", label: "Audit Log", icon: "description", onPress: () => router.push("/(admin)/audit" as never) },
        { id: "returns", label: "Returns", icon: "assignment-return", onPress: () => router.push("/(admin)/returns" as never) },
      ],
    },
    {
      groupTitle: "Preferences",
      items: [
        { id: "shop", label: "Back to Shop", icon: "storefront", onPress: () => router.push("/(customer)/(tabs)" as never) },
        { id: "profile", label: "Profile", icon: "person", onPress: () => router.push("/(customer)/account/profile" as never) },
      ],
    },
  ];

  const banner = {
    title: "Admin Control",
    description: "Pharmacy operations at a glance",
    features: ["Live sales · Stock health · Orders"],
    icon: "admin-panel-settings",
    onPress: () => router.push("/(admin)" as never),
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Settings" subtitle="Admin · Hibbullah" onBack={() => router.back()} />
      <View style={styles.body}>
        <SettingsScreen
          user={settingsUser}
          banner={banner}
          sections={sections}
          onLogout={signOut}
          header={{ title: "Admin Settings", subtitle: "Compact soft UI · home aesthetics" }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, backgroundColor: "#f8f9f8" },
});
