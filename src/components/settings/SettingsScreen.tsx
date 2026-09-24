import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import spacing from "../../constants/spacing";
import { radius, borderWidth } from "../../constants/sizes";
import shadows from "../../constants/shadows";
import { fontFamily, fontSize, lineHeight, letterSpacing } from "../../constants/typography";
import { usePressFeedback } from "../../lib/motion";
import type { SettingsScreenProps } from "./types";

export default function SettingsScreen({ user, banner, sections, onLogout, header }: SettingsScreenProps) {
  const feedback = usePressFeedback();
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <View style={styles.canvas}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{header?.title ?? "Settings"}</Text>
          {header?.subtitle ? <Text style={styles.headerSubtitle}>{header.subtitle}</Text> : null}
        </View>

        {/* 2. Profile Card */}
        <Pressable style={({ pressed }) => [styles.card, feedback(pressed)]} accessibilityRole="button">
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
              <View style={styles.statusDot} />
            </View>

            <View style={styles.profileCenter}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {user.name}
                </Text>
                {user.isVerified ? (
                  <View style={styles.badge}>
                    <MaterialIcons name="verified" size={10} color={colors.white} />
                    <Text style={styles.badgeText}>{user.role}</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, styles.badgeMuted]}>
                    <Text style={[styles.badgeText, styles.badgeTextMuted]}>{user.role}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.profileMeta} numberOfLines={1}>
                {user.email}
              </Text>
              <Text style={styles.profileMeta} numberOfLines={1}>
                {user.phone}
              </Text>
            </View>

            <View style={styles.chevronBox}>
              <MaterialIcons name="chevron-right" size={18} color={colors.textMuted} />
            </View>
          </View>
        </Pressable>

        {/* 3. Banner */}
        {banner ? (
          <Pressable
            onPress={banner.onPress}
            style={({ pressed }) => [styles.card, styles.bannerCard, feedback(pressed)]}
            accessibilityRole="button"
          >
            <View style={styles.bannerRow}>
              <View style={styles.bannerIcon}>
                <MaterialIcons name={(banner.icon as any) ?? "dashboard"} size={20} color={colors.primary} />
              </View>
              <View style={styles.bannerCenter}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerDesc}>{banner.description}</Text>
                {banner.features.length ? (
                  <Text style={styles.bannerFeatures}>{banner.features.join(" · ")}</Text>
                ) : null}
              </View>
              <View style={styles.bannerCta}>
                <MaterialIcons name="arrow-forward" size={16} color={colors.white} />
              </View>
            </View>
          </Pressable>
        ) : null}

        {/* 4. Grouped Menu */}
        {sections.map((section) => (
          <View key={section.groupTitle} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{section.groupTitle}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, idx) => (
                <View key={item.id}>
                  <Pressable
                    onPress={item.onPress}
                    style={({ pressed }) => [styles.menuRow, feedback(pressed)]}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    hitSlop={4}
                  >
                    <View style={styles.menuIcon}>
                      <MaterialIcons name={item.icon as any} size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
                  </Pressable>
                  {idx < section.items.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* 5. Destructive Action */}
        <View style={styles.logoutCard}>
          <Pressable
            onPress={onLogout}
            style={({ pressed }) => [styles.logoutBtn, feedback(pressed)]}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <MaterialIcons name="logout" size={16} color={colors.danger} />
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: "#f8f9f8" },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  header: { gap: 2, paddingBottom: spacing.xs },
  headerTitle: {
    color: colors.text,
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.body,
    lineHeight: fontSize.body * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.caption,
    lineHeight: fontSize.caption * lineHeight.normal,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: "#F1F5F9",
    padding: spacing.sm,
    ...shadows.xs,
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  avatarText: { color: colors.white, fontFamily: fontFamily.pjsBold, fontSize: fontSize.footnote },
  statusDot: {
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
  profileCenter: { flex: 1, gap: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, flexWrap: "wrap" },
  profileName: {
    color: colors.text,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.tight,
    flexShrink: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  badgeMuted: { backgroundColor: colors.background },
  badgeText: { color: colors.white, fontFamily: fontFamily.pjsBold, fontSize: 8, lineHeight: 10, letterSpacing: 0.3 },
  badgeTextMuted: { color: colors.textMuted },
  profileMeta: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: 11,
    lineHeight: 13,
  },
  chevronBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerCard: { padding: spacing.sm },
  bannerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerCenter: { flex: 1, gap: 1 },
  bannerTitle: {
    color: colors.text,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.tight,
  },
  bannerDesc: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: 11,
  },
  bannerFeatures: {
    color: colors.primary,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: 10,
    marginTop: 1,
  },
  bannerCta: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.xs,
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
  menuCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
    ...shadows.xs,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    minHeight: 40,
  },
  menuIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamily.pjsMedium,
    fontSize: fontSize.footnote,
  },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: spacing.sm },
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
  logoutText: {
    color: colors.danger,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.footnote,
  },
});
