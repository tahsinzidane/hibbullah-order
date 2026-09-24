import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import { radius, borderWidth } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import shadows from "../../constants/shadows";
import { fontSize, fontFamily, letterSpacing, lineHeight } from "../../constants/typography";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  accent?: "green" | "gold" | "neutral";
  icon?: string;
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
          <View style={[styles.iconBox, accent === "green" && styles.iconBoxGreen, accent === "gold" && styles.iconBoxGold]}>
            <MaterialIcons name={icon as any} size={12} color={iconTint} />
          </View>
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
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: "#F1F5F9",
    padding: spacing.sm,
    gap: 2,
    ...shadows.xs,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  marker: {
    width: 16,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
  },
  greenMarker: { backgroundColor: colors.primary },
  goldMarker: { backgroundColor: colors.gold },
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxGreen: { backgroundColor: colors.primarySoft, borderColor: colors.successBorder },
  iconBoxGold: { backgroundColor: colors.goldSoft, borderColor: colors.warningBorder },
  label: {
    color: "#94A3B8",
    fontFamily: fontFamily.pjsBold,
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    lineHeight: 11,
  },
  value: {
    color: colors.text,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.title2,
    marginTop: 2,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.title2 * lineHeight.tight,
  },
  detail: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: 11,
    marginTop: 1,
    lineHeight: 13,
  },
});