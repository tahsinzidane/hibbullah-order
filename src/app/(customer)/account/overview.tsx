import { router } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/common/Header";
import { colors } from "../../../constants/colors";
import { spacing } from "../../../constants/spacing";
import { radius } from "../../../constants/sizes";
import { shadows } from "../../../constants/shadows";
import { fontFamily, fontSize, letterSpacing } from "../../../constants/typography";
import { useAuth } from "../../../hooks/useAuth";
import { usePressFeedback } from "../../../lib/motion";

type IconName = SymbolViewProps["name"];

const ROW_ICON_SIZE = 18;
const RIPPLE = "rgba(2, 55, 25, 0.08)";
const CHEVRON: IconName = { ios: "chevron.right", android: "chevron_right", web: "chevron_right" };
const SIGN_OUT_ICON: IconName = {
  ios: "rectangle.portrait.and.arrow.right",
  android: "logout",
  web: "logout",
};

// Rows point only at screens already registered in account/_layout.tsx
// and the customer tabs — no routes added, none renamed.
const SECTIONS: {
  index: string;
  title: string;
  items: {
    label: string;
    meta: string;
    route: string;
    icon: IconName;
  }[];
}[] = [
  {
    index: "01",
    title: "Account",
    items: [
      {
        label: "Profile",
        meta: "Name and contact",
        route: "/(customer)/account/profile",
        icon: { ios: "person.crop.circle.fill", android: "person", web: "person" },
      },
      {
        label: "Addresses",
        meta: "Delivery locations",
        route: "/(customer)/account/addresses",
        icon: { ios: "location.fill", android: "place", web: "place" },
      },
    ],
  },
  {
    index: "02",
    title: "Activity",
    items: [
      {
        label: "Orders",
        meta: "Track deliveries",
        route: "/(customer)/(tabs)/orders",
        icon: { ios: "shippingbox.fill", android: "inventory_2", web: "inventory_2" },
      },
      {
        label: "Notifications",
        meta: "Updates and alerts",
        route: "/(customer)/account/notifications",
        icon: { ios: "bell.fill", android: "notifications", web: "notifications" },
      },
    ],
  },
  {
    index: "03",
    title: "Preferences",
    items: [
      {
        label: "Settings",
        meta: "App preferences",
        route: "/(customer)/account/settings",
        icon: { ios: "gearshape.fill", android: "settings", web: "settings" },
      },
    ],
  },
];

export default function CustomerAccountDashboard() {
  const { user, signOut } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "H";
  const feedback = usePressFeedback();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Account"
        subtitle="Hibbullah · Your account"
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Identity block uses only the authenticated user — nothing fabricated. */}
        <View style={styles.identityPanel}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.eyebrow}>Hibbullah · Customer</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name ?? "Welcome"}
            </Text>
            {user?.email ? (
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.index}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionIndex}>{section.index}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionRule} />
            </View>
            <View style={styles.panel}>
              {section.items.map((item, itemIndex) => (
                <View key={item.label}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.row,
                      feedback(pressed),
                    ]}
                    android_ripple={{ color: RIPPLE }}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${item.label}`}
                    onPress={() => router.push(item.route as never)}
                  >
                    <View style={styles.iconTile}>
                      <SymbolView
                        name={item.icon}
                        tintColor={colors.primary}
                        size={ROW_ICON_SIZE}
                      />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                      <Text style={styles.rowMeta}>{item.meta}</Text>
                    </View>
                    <SymbolView
                      name={CHEVRON}
                      tintColor={colors.textMuted}
                      size={16}
                    />
                  </Pressable>
                  {itemIndex < section.items.length - 1 ? (
                    <View style={styles.hairline} />
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [styles.signOut, feedback(pressed)]}
          android_ripple={{ color: RIPPLE }}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          onPress={signOut}
        >
          <SymbolView name={SIGN_OUT_ICON} tintColor={colors.primary} size={16} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Solid light surfaces only; no blur, no translucency.
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  identityPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.xs,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.body,
    fontFamily: fontFamily.pjsBold,
  },
  identityText: { flex: 1, gap: spacing.xs },
  eyebrow: {
    color: colors.textMuted,
    fontSize: fontSize.micro,
    fontFamily: fontFamily.pjsBold,
    letterSpacing: letterSpacing.wider,
    textTransform: "uppercase",
  },
  userName: {
    color: colors.text,
    fontSize: fontSize.body,
    fontFamily: fontFamily.pjsSemiBold,
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.pjsRegular,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionIndex: {
    color: colors.textMuted,
    fontSize: fontSize.micro,
    fontFamily: fontFamily.pjsBold,
    letterSpacing: letterSpacing.wider,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.title3,
    fontFamily: fontFamily.soraSemiBold,
  },
  sectionRule: { flex: 1, height: 1, backgroundColor: colors.border },
  panel: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    ...shadows.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  iconTile: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, gap: spacing.xs },
  rowLabel: {
    color: colors.text,
    fontSize: fontSize.bodySmall,
    fontFamily: fontFamily.pjsMedium,
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.pjsRegular,
  },
  hairline: { height: 1, backgroundColor: colors.borderSoft },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAlt,
    paddingVertical: spacing.md,
    minHeight: 44,
    marginTop: spacing.sm,
    ...shadows.xs,
  },
  signOutText: {
    color: colors.primary,
    fontSize: fontSize.bodySmall,
    fontFamily: fontFamily.pjsSemiBold,
  },
});