import { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import { radius } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize } from "../../constants/typography";
import shadows from "../../constants/shadows";
import { compression } from "../../lib/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { Product } from "../../types/product";
import ProductImage from "../products/ProductImage";
import { getProductImageUri } from "../../utils/image";

type Props = {
  product: Product;
  onPress?: (p: Product) => void;
  onAdd?: (p: Product) => void;
  adding?: boolean;
};

function HomeProductCard({ product, onPress, onAdd, adding }: Props) {
  const reduced = useReducedMotion();
  const inStock = product.stock > 0;
  return (
    <Pressable
      onPress={() => onPress?.(product)}
      style={({ pressed }) => [
        styles.card,
        pressed && !reduced && styles.pressed,
        pressed && styles.pressedOpacity,
      ]}
      accessibilityRole={Platform.OS === "web" && onAdd ? undefined : "button"}
      accessibilityLabel={`${product.name} ${inStock ? "in stock" : "out of stock"}`}
    >
      <View style={styles.imageWrap}>
        <ProductImage uri={getProductImageUri(product)} recyclingKey={product.id} style={styles.image} />
        {product.discountPercent ? (
          <View style={styles.discountPill}>
            <Text style={styles.discountText}>-{product.discountPercent}%</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {product.manufacturerId ? product.brand : product.brand} · {product.genericName}
        </Text>
        <View style={styles.bottomRow}>
          <View style={styles.priceWrap}>
            <Text style={styles.price}>৳ {product.price}</Text>
            {product.originalPrice ? (
              <Text style={styles.original}>৳ {product.originalPrice}</Text>
            ) : null}
          </View>
          {onAdd ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onAdd(product);
              }}
              disabled={adding || !inStock}
              style={({ pressed }) => [
                styles.addBtn,
                !inStock && styles.addBtnDisabled,
                pressed && !reduced && styles.addPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to cart`}
              hitSlop={6}
            >
              <MaterialIcons
                name={adding ? "hourglass-empty" : "add"}
                size={14}
                color={colors.white}
              />
            </Pressable>
          ) : null}
        </View>
        {!inStock ? <Text style={styles.oos}>Out of stock</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...shadows.xs,
  },
  pressed: { transform: [{ scale: compression.subtle }] },
  pressedOpacity: { opacity: 0.92 },
  imageWrap: {
    aspectRatio: 1,
    padding: spacing.xs,
    backgroundColor: "#F8F8F6",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radius.lg,
    backgroundColor: "#F8F8F6",
  },
  discountPill: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  discountText: {
    color: colors.goldDark,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.micro,
    lineHeight: 12,
  },
  content: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  name: {
    color: colors.text,
    fontFamily: fontFamily.pjsMedium,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * 1.35,
    minHeight: 36,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.micro,
    lineHeight: fontSize.micro * 1.3,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    gap: spacing.xs,
  },
  priceWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
    flex: 1,
  },
  price: {
    color: colors.gold,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.callout,
    lineHeight: fontSize.callout * 1.2,
  },
  original: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.micro,
    textDecorationLine: "line-through",
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.xs,
  },
  addBtnDisabled: { opacity: 0.45 },
  addPressed: { transform: [{ scale: compression.subtle }], opacity: 0.88 },
  oos: {
    color: colors.danger,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: 10,
    marginTop: 2,
  },
});

export default memo(HomeProductCard);
