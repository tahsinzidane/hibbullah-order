import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import sizes, { borderWidth, radius } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";
import shadows from "../../constants/shadows";
import { usePressFeedback } from "../../lib/motion";
import type { CartItem } from "../../types/cart";
import { formatCurrency } from "../../utils/currency";
import ProductImage from "../products/ProductImage";
import QuantitySelector from "./QuantitySelector";
import { getProductImageUri } from "../../utils/image";

export default function CartItemRow({
  item,
  onQuantity,
  onRemove,
}: {
  item: CartItem;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const feedback = usePressFeedback();
  return (
    <View style={styles.row}>
      <ProductImage
        uri={getProductImageUri(item.product)}
        recyclingKey={item.id}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.product.brand} · {item.product.genericName}
        </Text>
        <Text style={styles.unitPrice}>{formatCurrency(item.product.price)} each</Text>
        <QuantitySelector value={item.quantity} onChange={onQuantity} max={item.product.stock} />
      </View>
      <View style={styles.aside}>
        <Text style={styles.price}>{formatCurrency(item.product.price * item.quantity)}</Text>
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={({ pressed }) => [styles.binBtn, feedback(pressed)]}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.product.name} from cart`}
        >
          <MaterialIcons name="delete-outline" size={16} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    ...shadows.xs,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: "#F8F8F6",
  },
  info: { flex: 1, gap: 4, justifyContent: "center" },
  name: {
    color: colors.text,
    fontFamily: fontFamily.pjsMedium,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.normal,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.micro,
    lineHeight: fontSize.micro * lineHeight.normal,
  },
  unitPrice: {
    color: colors.gold,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.caption,
  },
  aside: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
    minHeight: 64,
  },
  price: {
    color: colors.text,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.footnote,
  },
  binBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.dangerSoft,
    borderWidth: borderWidth.thin,
    borderColor: colors.dangerBorder,
    alignItems: "center",
    justifyContent: "center",
  },
});