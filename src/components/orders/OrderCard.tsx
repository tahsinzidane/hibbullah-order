import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import sizes, { borderWidth } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import shadows from "../../constants/shadows";
import { fontFamily, fontSize } from "../../constants/typography";
import { compression } from "../../lib/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { Order } from "../../types/order";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import OrderStatus from "./OrderStatus";

type OrderCardProps = {
  order: Order;
  onPress?: (order: Order) => void;
};

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const reducedMotion = useReducedMotion();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && !reducedMotion && styles.pressed,
      ]}
      onPress={() => onPress?.(order)}
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.orderNumber}, ${order.status}, ${formatCurrency(order.total)}`}
    >
      <View style={styles.headerRow}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <OrderStatus status={order.status} />
      </View>
      <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
      <Text style={styles.items}>{order.items.length} item(s)</Text>
      <View style={styles.footer}>
        <Text style={styles.total}>{formatCurrency(order.total)}</Text>
        <View style={styles.chevronPill}>
          <SymbolView name="chevron.right" size={16} weight="medium" tintColor={colors.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: sizes.borderRadius.xl,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    gap: spacing.xs,
    marginBottom: spacing.lg,
    ...shadows.xs,
  },
  pressed: {
    transform: [{ scale: compression.subtle }],
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  orderNumber: {
    color: colors.text,
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.bodySmall,
  },
  date: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.footnote,
  },
  items: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.footnote,
  },
  footer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: borderWidth.thin,
    borderTopColor: colors.hairline,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    color: colors.text,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.body,
  },
  chevronPill: {
    width: 28,
    height: 28,
    borderRadius: sizes.borderRadius.pill,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
});