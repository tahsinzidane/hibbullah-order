import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppLogo from "../../../components/common/AppLogo";
import ErrorState from "../../../components/common/ErrorState";
import LoadingState from "../../../components/common/LoadingState";
import NotificationBell from "../../../components/common/NotificationBell";
import SearchBar from "../../../components/common/SearchBar";
import ProductCard from "../../../components/products/ProductCard";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import {
  mockCategories,
  mockManufacturers,
} from "../../../services/mockData";
import type { Product } from "../../../types/product";
import { useCart } from "../../../providers/CartProvider";
import { useProducts } from "../../../hooks/useProducts";
import { normalizeError } from "../../../utils/errorHandling";

export default function CustomerHomeScreen() {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<
    { kind: "success" | "error"; message: string } | null
  >(null);
  const { itemCount, addItem } = useCart();
  const {
    data: products,
    loading,
    error,
  } = useProducts({ pageSize: 50 });

  const featured = useMemo(
    () => products.filter((product) => product.isFeatured),
    [products],
  );
  const newProducts = useMemo(() => [...products].slice(0, 3), [products]);
  const discounted = useMemo(
    () => products.filter((product) => product.discountPercent),
    [products],
  );
  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products.slice(0, 4);
    return products
      .filter((product) =>
        [product.name, product.brand, product.genericName, product.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .slice(0, 5);
  }, [query, products]);

  const openProduct = (product: Product) => {
    setSearchFocused(false);
    router.push({
      pathname: "/(customer)/products/[productId]",
      params: { productId: product.id },
    });
  };

  const handleAddToCart = useCallback(
    async (product: Product) => {
      setAddingId(product.id);
      setFeedback(null);
      try {
        await addItem(product.id);
        setFeedback({ kind: "success", message: `${product.name} added to cart.` });
      } catch (nextError) {
        setFeedback({ kind: "error", message: normalizeError(nextError).message });
      } finally {
        setAddingId(null);
      }
    },
    [addItem],
  );

  if (loading) return <LoadingState label="Loading your pharmacy" />;
  if (error) return <ErrorState message={error} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <AppLogo size={38} />
            <Text style={styles.brandName}>Hibbullah</Text>
          </View>
          <View style={styles.headerActions}>
            <NotificationBell />
            <Pressable
              style={styles.cartButton}
              onPress={() => router.push("/(customer)/(tabs)/cart")}
              accessibilityRole="button"
              accessibilityLabel="Open cart"
            >
              <SymbolView
                name={{
                  ios: "cart.fill",
                  android: "shopping_cart",
                  web: "shopping_cart",
                }}
                tintColor={colors.primary}
                size={23}
              />
              {itemCount > 0 ? <Text style={styles.cartCount}>{itemCount > 99 ? "99+" : itemCount}</Text> : null}
            </Pressable>
          </View>
        </View>

        <View style={styles.searchArea}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search medicines"
          />
          {searchFocused ? (
            // Keep discovery contextual while the keyboard and home content stay in place.
            <View style={styles.searchPanel}>
              <Text style={styles.searchPanelTitle}>
                {query ? "Recommended matches" : "Popular medicines"}
              </Text>
              <FlatList
                data={searchResults}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.searchResult}
                    onPress={() => openProduct(item)}
                  >
                    <Text style={styles.searchResultName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.searchResultMeta} numberOfLines={1}>
                      {item.brand} · {item.genericName}
                    </Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={styles.noResults}>No medicines found</Text>
                }
              />
            </View>
          ) : null}
        </View>

        {feedback ? (
          <Text
            style={[
              styles.feedback,
              feedback.kind === "success" ? styles.feedbackSuccess : styles.feedbackError,
            ]}
          >
            {feedback.message}
          </Text>
        ) : null}

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Product of the day</Text>
          {products.length > 0 ? (
            <>
              <Text style={styles.heroTitle}>{products[0].name}</Text>
              <Text style={styles.heroText}>
                {products[0].brand} · {products[0].genericName}
              </Text>
              <Text style={styles.heroPrice}>KSh {products[0].price}</Text>
            </>
          ) : (
            <Text style={styles.heroText}>Browse our latest medicines below.</Text>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See all trending products"
            onPress={() => router.push("/(customer)/(tabs)/products")}
          >
            <Text style={styles.link}>See all</Text>
          </Pressable>
        </View>
        <FlatList
          data={featured}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: spacing.lg }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.horizontalCard}>
              <ProductCard
                product={item}
                onPress={openProduct}
                onAddToCart={handleAddToCart}
                addToCartLoading={addingId === item.id}
              />
            </View>
          )}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New arrivals</Text>
        </View>
        {newProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={openProduct}
            onAddToCart={handleAddToCart}
            addToCartLoading={addingId === product.id}
          />
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Discounted</Text>
        </View>
        {discounted.slice(0, 2).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={openProduct}
            onAddToCart={handleAddToCart}
            addToCartLoading={addingId === product.id}
          />
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured categories</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View all categories"
            onPress={() => router.push("/(customer)/products/categories")}
          >
            <Text style={styles.link}>View all</Text>
          </Pressable>
        </View>
        <View style={styles.chipGrid}>
          {mockCategories.slice(0, 4).map((category) => (
            <Pressable
              key={category.id}
              style={styles.chip}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/(customer)/products/category/[categoryId]",
                  params: { categoryId: category.id },
                })
              }
            >
              <Text style={styles.chipText}>{category.name}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured manufacturers</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View all manufacturers"
            onPress={() => router.push("/(customer)/products/manufacturers")}
          >
            <Text style={styles.link}>View all</Text>
          </Pressable>
        </View>
        <View style={styles.chipGrid}>
          {mockManufacturers.slice(0, 4).map((manufacturer) => (
            <Pressable
              key={manufacturer.id}
              style={styles.chip}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname:
                    "/(customer)/products/manufacturer/[manufacturerId]",
                  params: { manufacturerId: manufacturer.id },
                })
              }
            >
              <Text style={styles.chipText}>{manufacturer.name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  brandName: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: "600",
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  cartButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  cartCount: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.gold,
    color: colors.white,
    fontSize: typography.label,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 17,
  },
  searchArea: { position: "relative", zIndex: 10 },
  searchPanel: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    maxHeight: 290,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    zIndex: 20,
    elevation: 5,
  },
  searchPanelTitle: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  searchResult: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  searchResultName: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: "700",
  },
  searchResultMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  noResults: { color: colors.textMuted, paddingVertical: spacing.md },
  feedback: {
    fontSize: typography.bodySmall,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  feedbackSuccess: { color: colors.success },
  feedbackError: { color: colors.danger },
  heroCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  heroLabel: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.text,
    fontSize: typography.h2,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  heroText: { color: colors.textMuted, fontSize: typography.bodySmall, marginTop: spacing.xs },
  heroPrice: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: "700",
  },
  link: {
    color: colors.primary,
    fontSize: typography.bodySmall,
    fontWeight: "600",
  },
  horizontalCard: { width: 260, marginRight: spacing.md },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: { color: colors.text, fontSize: typography.bodySmall, fontWeight: "600" },
});
