import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import Header from "../../../components/common/Header";
import LoadingState from "../../../components/common/LoadingState";
import ProductImage from "../../../components/products/ProductImage";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import { radius, borderWidth } from "../../../constants/sizes";
import shadows from "../../../constants/shadows";
import { fontFamily, fontSize, lineHeight, letterSpacing } from "../../../constants/typography";
import { useCart } from "../../../hooks/useCart";
import { useProduct } from "../../../hooks/useProduct";
import { mockCategories, mockManufacturers } from "../../../services/mockData";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/date";
import { normalizeError } from "../../../utils/errorHandling";
import { usePressFeedback } from "../../../lib/motion";
import { getProductImageUri } from "../../../utils/image";

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ productId: string }>();
  const { product, loading, error, reload } = useProduct(params.productId);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const feedbackPress = usePressFeedback();

  if (loading) return <LoadingState label="Loading product…" />;

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Product details" onBack={() => router.back()} />
        <EmptyState
          title="Product not found"
          message={error ?? "This medicine is no longer available."}
          actionLabel="Retry"
          onAction={() => reload()}
        />
      </SafeAreaView>
    );
  }

  const inStock = product.stock > 0;
  const manufacturerName =
    mockManufacturers.find((item) => item.id === product.manufacturerId)?.name ?? "Not specified";
  const categoryName =
    mockCategories.find((item) => item.id === product.categoryId)?.name ?? "Not specified";

  const handleAddToCart = async () => {
    setAdding(true);
    setFeedback(null);
    try {
      await addItem(product.id, quantity);
      setFeedback({ kind: "success", message: `${product.name} · ${quantity} added to cart` });
      setTimeout(() => setFeedback(null), 2200);
    } catch (err) {
      setFeedback({ kind: "error", message: normalizeError(err).message });
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Product details" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image capsule — soft tactile like HomeProductCard */}
        <View style={styles.imageCard}>
          <View style={styles.imageWrap}>
            <ProductImage uri={getProductImageUri(product)} recyclingKey={product.id} style={styles.image} />
            {product.discountPercent ? (
              <View style={styles.discountPill}>
                <Text style={styles.discountText}>-{product.discountPercent}%</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Identity */}
        <View style={styles.identity}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.generic}>{product.genericName}</Text>
        </View>

        {/* Price — gold as per brand */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          {product.originalPrice ? (
            <Text style={styles.original}>{formatCurrency(product.originalPrice)}</Text>
          ) : null}
          {product.discountPercent ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{product.discountPercent}% OFF</Text>
            </View>
          ) : null}
        </View>

        {/* Stock dot + tactile status */}
        <View style={styles.metaRow}>
          <View style={[styles.stockPill, inStock ? styles.stockPillOk : styles.stockPillDanger]}>
            <View style={[styles.stockDot, inStock ? styles.dotOk : styles.dotDanger]} />
            <Text style={[styles.stockText, inStock ? styles.stockTextOk : styles.stockTextDanger]}>
              {inStock ? `In stock · ${product.stock} available` : "Out of stock"}
            </Text>
          </View>
          <View style={styles.unitPill}>
            <Text style={styles.unitText}>{product.unit}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{product.description}</Text>

        {/* Details — soft cards */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoIconBox}>
                <MaterialIcons name="factory" size={14} color={colors.primary} />
              </View>
              <Text style={styles.infoLabel}>Manufacturer</Text>
            </View>
            <Text style={styles.infoValue}>{manufacturerName}</Text>
            <View style={styles.infoDivider} />
            <View style={styles.infoHeader}>
              <View style={styles.infoIconBox}>
                <MaterialIcons name="category" size={14} color={colors.primary} />
              </View>
              <Text style={styles.infoLabel}>Category</Text>
            </View>
            <Text style={styles.infoValue}>{categoryName}</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoIconBox}>
                <MaterialIcons name="inventory-2" size={14} color={colors.primary} />
              </View>
              <Text style={styles.infoLabel}>Batch</Text>
            </View>
            <Text style={styles.infoValue}>{product.batchNumber ?? "—"}</Text>
            <View style={styles.infoDivider} />
            <View style={styles.infoHeader}>
              <View style={styles.infoIconBox}>
                <MaterialIcons name="event" size={14} color={colors.primary} />
              </View>
              <Text style={styles.infoLabel}>Expiry</Text>
            </View>
            <Text style={styles.infoValue}>{formatDate(product.expiryDate ?? new Date())}</Text>
          </View>
        </View>

        {/* Quantity — pill selector like Home */}
        <View style={styles.quantityRow}>
          <Text style={styles.qtyLabel}>Quantity</Text>
          <View style={styles.qtyPill}>
            <Pressable
              onPress={() => setQuantity((v) => Math.max(1, v - 1))}
              style={({ pressed }) => [styles.qtyBtn, feedbackPress(pressed)]}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
              hitSlop={6}
            >
              <MaterialIcons name="remove" size={18} color={colors.primary} />
            </Pressable>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <Pressable
              onPress={() => setQuantity((v) => v + 1)}
              style={({ pressed }) => [styles.qtyBtn, feedbackPress(pressed)]}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              hitSlop={6}
            >
              <MaterialIcons name="add" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {feedback ? (
          <View style={[styles.feedbackBox, feedback.kind === "success" ? styles.feedbackOk : styles.feedbackErr]}>
            <MaterialIcons
              name={feedback.kind === "success" ? "check-circle" : "error-outline"}
              size={16}
              color={feedback.kind === "success" ? colors.success : colors.danger}
            />
            <Text
              style={[styles.feedbackText, feedback.kind === "success" ? styles.feedbackTextOk : styles.feedbackTextErr]}
            >
              {feedback.message}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom action — tactile pill bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceLabel}>Total</Text>
          <Text style={styles.bottomPriceValue}>{formatCurrency(product.price * quantity)}</Text>
        </View>
        <View style={styles.bottomCta}>
          <Button
            title={inStock ? "Add to bag" : "Out of stock"}
            onPress={handleAddToCart}
            loading={adding}
            disabled={!inStock}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  imageCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.xl,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    overflow: "hidden",
    ...shadows.xs,
  },
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
  identity: { gap: 4 },
  brand: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.micro,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  name: {
    color: colors.text,
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.title2,
    lineHeight: fontSize.title2 * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  generic: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.normal,
  },
  priceRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  price: {
    color: colors.gold,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.title2,
    lineHeight: fontSize.title2 * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  original: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.bodySmall,
    textDecorationLine: "line-through",
    lineHeight: fontSize.bodySmall * lineHeight.normal,
  },
  discountBadge: {
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  discountBadgeText: {
    color: colors.goldDark,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.micro,
    letterSpacing: 0.4,
  },
  metaRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap", alignItems: "center" },
  stockPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  stockPillOk: { backgroundColor: colors.successSoft, borderColor: colors.successBorder },
  stockPillDanger: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder },
  stockDot: { width: 6, height: 6, borderRadius: 3 },
  dotOk: { backgroundColor: colors.success },
  dotDanger: { backgroundColor: colors.danger },
  stockText: { fontFamily: fontFamily.pjsSemiBold, fontSize: fontSize.micro, lineHeight: 12 },
  stockTextOk: { color: colors.success },
  stockTextDanger: { color: colors.danger },
  unitPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xs,
  },
  unitText: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.micro,
    letterSpacing: 0.4,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.bodySmall,
    lineHeight: fontSize.bodySmall * lineHeight.relaxed,
  },
  infoGrid: { flexDirection: "row", gap: spacing.md },
  infoCard: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.xs,
  },
  infoHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  infoIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  infoValue: {
    color: colors.text,
    fontFamily: fontFamily.pjsMedium,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.normal,
  },
  infoDivider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: 2 },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  qtyLabel: {
    color: colors.text,
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.bodySmall,
    letterSpacing: letterSpacing.tight,
  },
  qtyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundAlt,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    minHeight: 40,
    gap: spacing.xs,
    ...shadows.xs,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    minWidth: 24,
    textAlign: "center",
    color: colors.text,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.callout,
    lineHeight: fontSize.callout * lineHeight.tight,
  },
  feedbackBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  feedbackOk: { backgroundColor: colors.successSoft, borderColor: colors.successBorder },
  feedbackErr: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder },
  feedbackText: { flex: 1, fontFamily: fontFamily.pjsSemiBold, fontSize: fontSize.footnote, lineHeight: 16 },
  feedbackTextOk: { color: colors.success },
  feedbackTextErr: { color: colors.danger },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    ...shadows.sm,
  },
  bottomPrice: { gap: 2 },
  bottomPriceLabel: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.micro,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  bottomPriceValue: {
    color: colors.text,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.callout,
    lineHeight: fontSize.callout * lineHeight.tight,
  },
  bottomCta: { flex: 1 },
});
