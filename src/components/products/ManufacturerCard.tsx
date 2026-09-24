import { Pressable, StyleSheet, Text } from "react-native";
import colors from "../../constants/colors";
import sizes, { borderWidth } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import shadows from "../../constants/shadows";
import { fontFamily, fontSize } from "../../constants/typography";
import { compression } from "../../lib/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { Manufacturer } from "../../types/manufacturer";

export default function ManufacturerCard({
  manufacturer,
  onPress,
}: {
  manufacturer: Manufacturer;
  onPress?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && !reducedMotion && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.name}>{manufacturer.name}</Text>
      <Text style={styles.meta}>
        {manufacturer.country ?? "Kenya"} · {manufacturer.productCount ?? 0} products
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: sizes.borderRadius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.hairline,
    padding: spacing.lg,
    ...shadows.xs,
  },
  name: {
    color: colors.text,
    fontFamily: fontFamily.soraMedium,
    fontSize: fontSize.body,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.caption,
    marginTop: spacing.xs,
  },
  pressed: {
    transform: [{ scale: compression.subtle }],
    opacity: 0.92,
  },
});