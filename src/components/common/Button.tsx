import { Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from "react-native";
import colors from "../../constants/colors";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";
import { radius, layout, opacity } from "../../constants/sizes";
import { compression } from "../../lib/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type ButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  fullWidth?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export default function Button({
  title,
  variant = "primary",
  fullWidth = false,
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const reducedMotion = useReducedMotion();
  const palette = {
    primary: { background: colors.primary, text: colors.white, ripple: "rgba(255,255,255,0.22)" },
    secondary: { background: colors.backgroundAlt, text: colors.primary, border: colors.border, ripple: colors.ripple.primary },
    danger: { background: colors.dangerSoft, text: colors.danger, border: colors.dangerBorder, ripple: colors.ripple.danger },
    ghost: { background: colors.primarySoft, text: colors.primary, ripple: colors.ripple.primary },
  }[variant];

  return (
    <Pressable
      {...props}
      disabled={disabled || loading}
      android_ripple={{ color: palette.ripple }}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.background },
        "border" in palette && palette.border
          ? { borderWidth: 1, borderColor: palette.border }
          : null,
        fullWidth && styles.fullWidth,
        pressed && styles.pressedOpacity,
        pressed && !reducedMotion && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, { color: palette.text }]}>
        {loading ? "Please wait…" : title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.controlHeight,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    gap: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: { width: "100%" },
  pressedOpacity: { opacity: opacity.pressed },
  pressed: { transform: [{ scale: compression.subtle }] },
  disabled: { opacity: opacity.disabled },
  text: {
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.tight,
    letterSpacing: 0.2,
  },
});