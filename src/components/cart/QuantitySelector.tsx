import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import sizes, { borderWidth, layout } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize } from "../../constants/typography";
import { usePressFeedback } from "../../lib/motion";

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  const feedback = usePressFeedback();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        style={({ pressed }) => [styles.control, feedback(pressed)]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        accessibilityState={{ disabled: value <= min }}
      >
        <Text style={styles.symbol}>−</Text>
      </Pressable>
      <Text style={styles.value} accessibilityRole="text">{value}</Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        style={({ pressed }) => [styles.control, feedback(pressed)]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        accessibilityState={{ disabled: value >= max }}
      >
        <Text style={styles.symbol}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.backgroundAlt,
    borderRadius: sizes.borderRadius.pill,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.xs,
    minHeight: 32,
    alignSelf: "flex-start",
  },
  control: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: {
    color: colors.primary,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.footnote,
    lineHeight: 14,
  },
  value: {
    color: colors.text,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.footnote,
    minWidth: 20,
    textAlign: "center",
  },
});