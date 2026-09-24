import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../hooks/useAuth";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import { radius, borderWidth } from "../../../constants/sizes";
import shadows from "../../../constants/shadows";
import { fontFamily, fontSize, lineHeight } from "../../../constants/typography";
import Header from "../../../components/common/Header";
import { usePressFeedback } from "../../../lib/motion";

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAdmin, signOut } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "H";
  const feedback = usePressFeedback();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Account" subtitle="Your Hibbullah profile" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
            <View style={styles.dot} />
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || "Welcome"}
              </Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{isAdmin ? "Admin" : "Customer"}</Text>
              </View>
            </View>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || "Manage your account"}
            </Text>
          </View>
          <View style={styles.chev}>
            <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
          </View>
        </View>

        {isAdmin ? (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Admin</Text>
            <View style={styles.panel}>
              <Pressable
                style={({ pressed }) => [styles.row, feedback(pressed)]}
                onPress={() => router.push("/(admin)" as never)}
                accessibilityRole="button"
              >
                <View style={styles.iconTile}>
                  <MaterialIcons name="dashboard" size={16} color={colors.primary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>Dashboard</Text>
                  <Text style={styles.rowMeta}>Manage store operations</Text>
                </View>
                <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.panel}>
            <Pressable
              style={({ pressed }) => [styles.row, feedback(pressed)]}
              onPress={() => router.push("/(customer)/account/profile" as never)}
            >
              <View style={styles.iconTile}>
                <MaterialIcons name="person" size={16} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Profile</Text>
                <Text style={styles.rowMeta}>Name and contact details</Text>
              </View>
              <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
            <View style={styles.hairline} />
            <Pressable
              style={({ pressed }) => [styles.row, feedback(pressed)]}
              onPress={() => router.push("/(customer)/account/addresses" as any)}
            >
              <View style={styles.iconTile}>
                <MaterialIcons name="location-on" size={16} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Addresses</Text>
                <Text style={styles.rowMeta}>Delivery locations</Text>
              </View>
              <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
            <View style={styles.hairline} />
            <Pressable
              style={({ pressed }) => [styles.row, feedback(pressed)]}
              onPress={() => router.push("/(customer)/(tabs)/orders" as any)}
            >
              <View style={styles.iconTile}>
                <MaterialIcons name="receipt-long" size={16} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Orders</Text>
                <Text style={styles.rowMeta}>Order history</Text>
              </View>
              <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
            <View style={styles.hairline} />
            <Pressable
              style={({ pressed }) => [styles.row, feedback(pressed)]}
              onPress={() => router.push("/(customer)/account/notifications" as any)}
            >
              <View style={styles.iconTile}>
                <MaterialIcons name="notifications-none" size={16} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Notifications</Text>
                <Text style={styles.rowMeta}>Alerts and updates</Text>
              </View>
              <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
            <View style={styles.hairline} />
            <Pressable
              style={({ pressed }) => [styles.row, feedback(pressed)]}
              onPress={() => router.push("/(customer)/account/settings" as any)}
            >
              <View style={styles.iconTile}>
                <MaterialIcons name="settings" size={16} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Settings</Text>
                <Text style={styles.rowMeta}>App preferences</Text>
              </View>
              <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        <View style={styles.logoutCard}>
          <Pressable style={({ pressed }) => [styles.logoutBtn, feedback(pressed)]} onPress={signOut}>
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
  userCard: {
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
  userInfo: { flex: 1, gap: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  userName: { color: colors.text, fontFamily: fontFamily.pjsSemiBold, fontSize: fontSize.footnote, flexShrink: 1 },
  rolePill: { backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.pill },
  roleText: { color: colors.white, fontFamily: fontFamily.pjsBold, fontSize: 8, letterSpacing: 0.3 },
  userEmail: { color: colors.textMuted, fontFamily: fontFamily.pjsRegular, fontSize: 11, lineHeight: 13 },
  chev: {
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
