import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import sizes, { borderWidth } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import shadows from "../../constants/shadows";
import { fontSize, fontFamily, letterSpacing } from "../../constants/typography";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  accent?: "green" | "gold" | "neutral";
  icon?: SymbolViewProps["name"];
};

export default function AdminStatCard({
  label,
  value,
  detail,
  accent = "neutral",
  icon,
}: AdminStatCardProps) {
  const iconTint =
    accent === "green" ? colors.primary : accent === "gold" ? colors.gold : colors.textMuted;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View
          style={[
            styles.marker,
            accent === "green" && styles.greenMarker,
            accent === "gold" && styles.goldMarker,
          ]}
        />
        {icon ? (
          <SymbolView name={icon} tintColor={iconTint} size={16} />
        ) : null}
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "46%",
    backgroundColor: colors.backgroundAlt,
    borderRadius: sizes.borderRadius.md,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadows.xs,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  marker: {
    width: 20,
    height: 2,
    borderRadius: sizes.borderRadius.sm,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  greenMarker: { backgroundColor: colors.primary },
  goldMarker: { backgroundColor: colors.gold },
  label: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.micro,
    letterSpacing: letterSpacing.wider,
    textTransform: "uppercase",
  },
  value: {
    color: colors.text,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.title2,
    marginTop: spacing.xs,
    letterSpacing: letterSpacing.tight,
  },
  detail: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.caption,
    marginTop: spacing.xs,
  },
});