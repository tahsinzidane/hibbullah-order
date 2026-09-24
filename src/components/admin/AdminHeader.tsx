import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import { borderWidth, radius } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import shadows from "../../constants/shadows";
import { fontFamily, fontSize, letterSpacing } from "../../constants/typography";

type AdminHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export default function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleArea}>
        <Text style={styles.eyebrow}>Hibbullah · Admin</Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {action ? <View>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  titleArea: { flex: 1 },
  eyebrow: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.wider,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.title2,
    letterSpacing: letterSpacing.tight,
    marginTop: spacing.xxs,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.caption,
    marginTop: spacing.xxs,
  },
});