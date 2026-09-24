import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/common/Header";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import { radius, borderWidth } from "../../../constants/sizes";
import shadows from "../../../constants/shadows";
import { fontFamily, fontSize, lineHeight, letterSpacing } from "../../../constants/typography";
import { useAuth } from "../../../hooks/useAuth";
import { usePressFeedback } from "../../../lib/motion";

const SECTIONS = [
  {
    title: "Account",
    items: [
      { label: "Profile", meta: "Name and contact", route: "/(customer)/account/profile", icon: "person" as const },
      { label: "Addresses", meta: "Delivery locations", route: "/(customer)/account/addresses", icon: "location-on" as const },
    ],
  },
  {
    title: "Activity",
    items: [
      { label: "Orders", meta: "Track deliveries", route: "/(customer)/(tabs)/orders", icon: "receipt-long" as const },
      { label: "Notifications", meta: "Updates and alerts", route: "/(customer)/account/notifications", icon: "notifications-none" as const },
    ],
  },
  {
    title: "Preferences",
    items: [
      { label: "Settings", meta: "App preferences", route: "/(customer)/account/settings", icon: "settings" as const },
    ],
  },
];

export default function CustomerAccountDashboard() {
  const { user, signOut } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "H";
  const feedback = usePressFeedback();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Account" subtitle="Hibbullah · Your account" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Compact identity — soft UI, home-like */}
        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
            <View style={styles.dot} />
          </View>
          <View style={styles.identityText}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name ?? "Welcome"}
              </Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>Customer</Text>
              </View>
            </View>
            {user?.email ? (
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
            {(user as any)?.phone ? (
              <Text style={styles.userPhone} numberOfLines={1}>
                {(user as any).phone}
              </Text>
            ) : null}
          </View>
          <View style={styles.chevBox}>
            <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
          </View>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.panel}>
              {section.items.map((item, idx) => (
                <View key={item.label}>
                  <Pressable
                    style={({ pressed }) => [styles.row, feedback(pressed)]}
                    onPress={() => router.push(item.route as never)}
                    accessibilityRole="button"
                  >
                    <View style={styles.iconTile}>
                      <MaterialIcons name={item.icon} size={16} color={colors.primary} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                      <Text style={styles.rowMeta}>{item.meta}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
                  </Pressable>
                  {idx < section.items.length - 1 ? <View style={styles.hairline} /> : null}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.logoutCard}>
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, feedback(pressed)]}
            onPress={signOut}
            accessibilityRole="button"
          >
            <MaterialIcons name="logout" size={14} color={colors.danger} />
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9f8" },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderWidth: borderWidth.thin,
    borderColor: "#F1F5F9",
    borderRadius: radius.lg,
    padding: spacing.sm,
    ...shadows.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontFamily: fontFamily.pjsBold, fontSize: fontSize.footnote },
  dot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  identityText: { flex: 1, gap: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  userName: { color: colors.text, fontFamily: fontFamily.pjsSemiBold, fontSize: fontSize.footnote, flexShrink: 1 },
  rolePill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  roleText: { color: colors.white, fontFamily: fontFamily.pjsBold, fontSize: 8, letterSpacing: 0.3 },
  userEmail: { color: colors.textMuted, fontFamily: fontFamily.pjsRegular, fontSize: 11, lineHeight: 13 },
  userPhone: { color: colors.textMuted, fontFamily: fontFamily.pjsRegular, fontSize: 11, lineHeight: 13 },
  chevBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionWrap: { gap: spacing.xs, marginTop: spacing.xs },
  sectionTitle: {
    color: "#94A3B8",
    fontFamily: fontFamily.pjsBold,
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginLeft: 2,
  },
  panel: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    ...shadows.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    minHeight: 40,
  },
  iconTile: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, gap: 1 },
  rowLabel: { color: colors.text, fontFamily: fontFamily.pjsMedium, fontSize: fontSize.footnote },
  rowMeta: { color: colors.textMuted, fontFamily: fontFamily.pjsRegular, fontSize: 11 },
  hairline: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: spacing.sm },
  logoutCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#FECDD3",
    overflow: "hidden",
    ...shadows.xs,
    marginTop: spacing.sm,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: 11,
    minHeight: 40,
    backgroundColor: "#FFF1F2",
  },
  logoutText: { color: colors.danger, fontFamily: fontFamily.pjsSemiBold, fontSize: fontSize.footnote },
});
