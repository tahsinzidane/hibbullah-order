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
    gap: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderRadius: sizes.borderRadius.pill,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    minHeight: layout.touch,
  },
  control: {
    width: layout.touch,
    height: layout.touch,
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: {
    color: colors.primary,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.body,
  },
  value: {
    color: colors.text,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.body,
    minWidth: 24,
    textAlign: "center",
  },
});