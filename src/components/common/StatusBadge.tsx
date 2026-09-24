import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import { radius } from '../../constants/sizes';
import spacing from '../../constants/spacing';
import { fontFamily, fontSize, lineHeight } from '../../constants/typography';

type StatusBadgeProps = {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
};

export default function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const palette = {
    success: { background: colors.successSoft, text: colors.success, border: colors.successBorder, dot: colors.success },
    warning: { background: colors.warningSoft, text: colors.warning, border: colors.warningBorder, dot: colors.warning },
    danger: { background: colors.dangerSoft, text: colors.danger, border: colors.dangerBorder, dot: colors.danger },
    info: { background: colors.primarySoft, text: colors.primary, border: colors.primaryMuted, dot: colors.primary },
    neutral: { background: colors.background, text: colors.textMuted, border: colors.border, dot: colors.textMuted },
  }[tone];

  return (
    <View
      style={[styles.badge, { backgroundColor: palette.background, borderColor: palette.border }]}
      accessibilityLabel={label}
      accessibilityRole="text"
    >
      <View style={[styles.dot, { backgroundColor: palette.dot }]} />
      <Text style={[styles.text, { color: palette.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.micro,
    lineHeight: fontSize.micro * lineHeight.tight,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
