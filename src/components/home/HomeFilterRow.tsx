import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import { radius } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";
import shadows from "../../constants/shadows";
import { compression } from "../../lib/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export const HOME_FILTERS = ["All", "Trending", "Discount", "New"] as const;
export type HomeFilter = (typeof HOME_FILTERS)[number];

type Props = {
  selected: HomeFilter;
  onSelect: (f: HomeFilter) => void;
  onFilterPress: () => void;
};

export default function HomeFilterRow({ selected, onSelect, onFilterPress }: Props) {
  const reduced = useReducedMotion();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.root}
    >
      {HOME_FILTERS.map((label) => {
        const active = selected === label;
        return (
          <Pressable
            key={label}
            onPress={() => onSelect(label)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && !reduced && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Filter ${label}`}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={onFilterPress}
        style={({ pressed }) => [styles.filterBtn, pressed && !reduced && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Open filters"
        hitSlop={4}
      >
        <MaterialIcons name="tune" size={16} color={colors.primary} />
        <Text style={styles.filterText}>Filter</Text>
      </Pressable>
      <View style={{ width: spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 0, marginTop: spacing.sm },
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
    paddingRight: spacing.lg,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.xs,
  },
  chipText: {
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.normal,
    color: colors.text,
  },
  chipTextActive: { color: colors.white },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
    ...shadows.xs,
  },
  filterText: {
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.footnote,
    color: colors.primary,
  },
  pressed: { transform: [{ scale: compression.standard }] },
});
