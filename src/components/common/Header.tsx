import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { colors } from "../../constants/colors";
import { borderWidth, radius } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { shadows } from "../../constants/shadows";
import { fontFamily, fontSize, letterSpacing } from "../../constants/typography";
import { usePressFeedback } from "../../lib/motion";

type HeaderProps = {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onBack?: () => void;
};

export default function Header({
  title,
  subtitle,
  rightAction,
  onBack,
}: HeaderProps) {
  const feedback = usePressFeedback();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, feedback(pressed)]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <SymbolView
              name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
              tintColor={colors.primary}
              size={22}
            />
          </Pressable>
        ) : null}
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightAction ? <View style={styles.action}>{rightAction}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 38,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  titleArea: { flex: 1 },
  title: {
    color: colors.text,
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.bodySmall,
    lineHeight: 18,
    letterSpacing: letterSpacing.tight,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.caption,
    marginTop: spacing.xxs,
  },
  action: { alignItems: "center", justifyContent: "center" },
});