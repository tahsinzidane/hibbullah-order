import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppLogo from "../../../components/common/AppLogo";
import ErrorState from "../../../components/common/ErrorState";
import LoadingState from "../../../components/common/LoadingState";
import NotificationBell from "../../../components/common/NotificationBell";
import SearchBar from "../../../components/common/SearchBar";
import HomeProductCard from "../../../components/home/HomeProductCard";
import HomeFilterRow, { HOME_FILTERS, type HomeFilter } from "../../../components/home/HomeFilterRow";
import HomeFilterSheet from "../../../components/home/HomeFilterSheet";
import TrendingRail from "../../../components/home/TrendingRail";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import { radius } from "../../../constants/sizes";
import shadows from "../../../constants/shadows";
import { fontFamily, fontSize } from "../../../constants/typography";
import type { Product } from "../../../types/product";
import { useCart } from "../../../providers/CartProvider";
import { useProducts } from "../../../hooks/useProducts";
import { normalizeError } from "../../../utils/errorHandling";

export default function CustomerHomeScreen() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<HomeFilter>("All");
  const [filterVisible, setFilterVisible] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const { itemCount, addItem } = useCart();
  const { data: products, loading, error } = useProducts({ pageSize: 50 });

  const trending = useMemo(() => products.filter((p) => p.isFeatured), [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.name, p.brand, p.genericName, p.description].join(" ").toLowerCase().includes(q)
      );
    }
    if (selected === "Trending") list = list.filter((p) => p.isFeatured);
    if (selected === "Discount") list = list.filter((p) => (p.discountPercent ?? 0) > 0);
    if (selected === "New") {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list;
  }, [products, query, selected]);

  const openProduct = (product: Product) => {
    router.push({ pathname: "/(customer)/products/[productId]", params: { productId: product.id } });
  };

  const handleAdd = useCallback(
    async (product: Product) => {
      setAddingId(product.id);
      setFeedback(null);
      try {
        await addItem(product.id);
        setFeedback({ kind: "success", message: `${product.name} added` });
        setTimeout(() => setFeedback(null), 2200);
      } catch (e) {
        setFeedback({ kind: "error", message: normalizeError(e).message });
      } finally {
        setAddingId(null);
      }
    },
    [addItem]
  );

  if (loading) return <LoadingState label="Loading your pharmacy" />;
  if (error) return <ErrorState message={error} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoWrap}>
            <AppLogo size={28} />
          </View>
          <Text style={styles.brandName}>Hibbullah</Text>
        </View>
        <View style={styles.headerActions}>
          <NotificationBell />
          <Pressable
            style={styles.cartPill}
            onPress={() => router.push("/(customer)/(tabs)/cart")}
            accessibilityRole="button"
            accessibilityLabel={`Open cart ${itemCount} items`}
            hitSlop={4}
          >
            <MaterialIcons name="shopping-bag" size={18} color={colors.primary} />
            {itemCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount > 99 ? "99+" : itemCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchArea}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search medicines" />
        </View>

        <HomeFilterRow
          selected={selected}
          onSelect={setSelected}
          onFilterPress={() => setFilterVisible(true)}
        />

        {feedback ? (
          <Text style={[styles.feedback, feedback.kind === "success" ? styles.feedbackSuccess : styles.feedbackError]}>
            {feedback.message}
          </Text>
        ) : null}

        {/* Trending rail — image only, inertial auto-slide */}
        <TrendingRail products={trending.slice(0, 10)} onPress={openProduct} />

        {/* Product grid — 2 per row on mobile, tactile capsule */}
        <View style={styles.gridHeader}>
          <Text style={styles.gridTitle}>
            {query ? `Results · ${filtered.length}` : selected === "All" ? "All products" : selected}
          </Text>
          <Text style={styles.gridCount}>{filtered.length} items</Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="search-off" size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No medicines found</Text>
            <Text style={styles.emptyText}>Try a brand, generic name, or check your filters.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {chunk(filtered, 2).map((row, ri) => (
              <View key={ri} style={styles.row}>
                {row.map((product) => (
                  <View key={product.id} style={styles.cardWrap}>
                    <HomeProductCard
                      product={product}
                      onPress={openProduct}
                      onAdd={handleAdd}
                      adding={addingId === product.id}
                    />
                  </View>
                ))}
                {row.length === 1 ? <View style={styles.cardWrap} /> : null}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <HomeFilterSheet visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </SafeAreaView>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  logoWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...shadows.xs,
  },
  brandName: {
    color: colors.text,
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.bodySmall,
    letterSpacing: -0.2,
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  cartPill: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.xs,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: colors.backgroundAlt,
  },
  cartBadgeText: {
    color: colors.white,
    fontFamily: fontFamily.pjsBold,
    fontSize: 9,
    lineHeight: 11,
    textAlign: "center",
  },
  container: { paddingBottom: spacing.xxl, gap: 0 },
  searchArea: { paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  feedback: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.footnote,
  },
  feedbackSuccess: { color: colors.success },
  feedbackError: { color: colors.danger },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  gridTitle: {
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.footnote,
    color: colors.text,
  },
  gridCount: {
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.caption,
    color: colors.textMuted,
  },
  grid: { paddingHorizontal: spacing.lg, gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  cardWrap: { flex: 1 },
  empty: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.xs,
  },
  emptyTitle: { fontFamily: fontFamily.soraSemiBold, fontSize: fontSize.bodySmall, color: colors.text },
  emptyText: {
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.caption,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
