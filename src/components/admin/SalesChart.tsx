import { View, Text, StyleSheet, Pressable } from "react-native";
import colors from "../../constants/colors";
import spacing from "../../constants/spacing";
import { radius, borderWidth } from "../../constants/sizes";
import shadows from "../../constants/shadows";
import { fontFamily, fontSize } from "../../constants/typography";
import { formatCurrency } from "../../utils/currency";

type Point = { label: string; total: number; count: number };
type Props = {
  data: Point[];
  period: "7D" | "30D";
  onPeriod: (p: "7D" | "30D") => void;
  totalLabel?: string;
};

export default function SalesChart({ data, period, onPeriod, totalLabel }: Props) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ gap: 2 }}>
          <Text style={styles.title}>Sales analytics</Text>
          <Text style={styles.subtitle}>
            {totalLabel ?? `${formatCurrency(total)} · ${data.reduce((s, d) => s + d.count, 0)} orders`}
          </Text>
        </View>
        <View style={styles.toggle}>
          {(["7D", "30D"] as const).map((p) => {
            const active = period === p;
            return (
              <Pressable
                key={p}
                onPress={() => onPeriod(p)}
                style={[styles.pill, active && styles.pillActive]}
                hitSlop={4}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.chartRow}>
        {data.map((d, idx) => {
          const h = Math.max(6, (d.total / max) * 72);
          const isLast = idx === data.length - 1;
          return (
            <View key={idx} style={styles.barWrap}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: h }, isLast && styles.barFillGold]} />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>
                {d.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Revenue</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.gold }]} />
          <Text style={styles.legendText}>Latest</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: "#F1F5F9",
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.xs,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  title: { color: colors.text, fontFamily: fontFamily.pjsSemiBold, fontSize: fontSize.footnote },
  subtitle: { color: colors.textMuted, fontFamily: fontFamily.pjsRegular, fontSize: 11, lineHeight: 13, marginTop: 2 },
  toggle: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: radius.pill,
    padding: 3,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    minWidth: 36,
    alignItems: "center",
  },
  pillActive: { backgroundColor: colors.primary },
  pillText: { color: colors.textMuted, fontFamily: fontFamily.pjsSemiBold, fontSize: 10, lineHeight: 12 },
  pillTextActive: { color: colors.white },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 88,
    paddingTop: spacing.xs,
  },
  barWrap: { flex: 1, alignItems: "center", gap: 4 },
  barTrack: {
    flex: 1,
    width: "100%",
    maxWidth: 28,
    backgroundColor: "#F1F5F9",
    borderRadius: radius.pill,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barFill: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minHeight: 6,
  },
  barFillGold: { backgroundColor: colors.gold },
  barLabel: { color: colors.textMuted, fontFamily: fontFamily.pjsRegular, fontSize: 8, lineHeight: 10, textAlign: "center" },
  legend: { flexDirection: "row", gap: spacing.md, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { color: colors.textMuted, fontFamily: fontFamily.pjsRegular, fontSize: 10 },
});
