import { memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import { radius } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize } from "../../constants/typography";
import shadows from "../../constants/shadows";
import { compression } from "../../lib/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { Product } from "../../types/product";
import DiscountBadge from "./DiscountBadge";
import ProductImage from "./ProductImage";
import ProductPrice from "./ProductPrice";
import { getProductImageUri } from "../../utils/image";

type ProductCardProps = {
  product: Product;
  compact?: boolean;
  onPress?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  addToCartLoading?: boolean;
};

function ProductCard({
  product,
  compact,
  onPress,
  onAddToCart,
  addToCartLoading,
}: ProductCardProps) {
  const reducedMotion = useReducedMotion();
  const inStock = product.stock > 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.compact,
        pressed && !reducedMotion && styles.pressed,
        pressed && styles.pressedOpacity,
      ]}
      onPress={() => onPress?.(product)}
      accessibilityRole={
        // On web the inner "Add to cart" control renders as a button; wrapping
        // it in another button (role="button" on the card) creates invalid
        // nested-button HTML. Drop the card-level role only there.
        Platform.OS === "web" && onAddToCart ? undefined : "button"
      }
      accessibilityLabel={`${product.name}, ${product.brand}, ${inStock ? "In stock" : "Out of stock"}`}
    >
      <ProductImage uri={getProductImageUri(product)} recyclingKey={product.id} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.generic} numberOfLines={1}>
          {product.genericName}
        </Text>
        <ProductPrice price={product.price} originalPrice={product.originalPrice} />
        <View style={styles.footer}>
          <View style={styles.stockRow}>
            <View style={[styles.stockDot, inStock ? styles.inStockDot : styles.outOfStockDot]} />
            <Text style={[styles.stock, inStock ? styles.inStock : styles.outOfStock]}>
              {inStock ? "In stock" : "Out of stock"}
            </Text>
          </View>
          {product.discountPercent ? <DiscountBadge percent={product.discountPercent} /> : null}
        </View>
        {onAddToCart ? (
          <View style={styles.addWrap}>
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                addToCartLoading && styles.addButtonDisabled,
                pressed && !reducedMotion && styles.addButtonPressed,
              ]}
              onPress={(event) => {
                // Stop the press from bubbling to the outer card on web, where a
                // click would otherwise trigger onPress() (card navigation) too.
                event.stopPropagation();
                onAddToCart(product);
              }}
              disabled={addToCartLoading}
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to cart`}
              accessibilityState={{ disabled: addToCartLoading, busy: addToCartLoading }}
            >
              <Text style={styles.addButtonText}>
                {addToCartLoading ? "Adding…" : "Add to cart"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  compact: { marginBottom: 0 },
  pressed: { transform: [{ scale: compression.subtle }] },
  pressedOpacity: { opacity: 0.92 },
  image: { width: "100%", aspectRatio: 1, borderRadius: radius.lg },
  content: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  brand: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.micro,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  name: {
    color: colors.text,
    fontFamily: fontFamily.pjsMedium,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * 1.35,
    minHeight: 36,
  },
  generic: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.micro,
    lineHeight: fontSize.micro * 1.3,
  },
  footer: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  stockDot: { width: 6, height: 6, borderRadius: 3 },
  inStockDot: { backgroundColor: colors.success },
  outOfStockDot: { backgroundColor: colors.danger },
  stock: {
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.micro,
  },
  inStock: { color: colors.success },
  outOfStock: { color: colors.danger },
  addWrap: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
  },
  addButton: {
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.backgroundAlt,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  addButtonDisabled: { opacity: 0.6 },
  addButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: compression.subtle }],
  },
  addButtonText: {
    color: colors.primary,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.footnote,
  },
});

export default memo(ProductCard);