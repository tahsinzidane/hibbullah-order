import { router } from "expo-router";
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
import Header from "../../../components/common/Header";
import LoadingState from "../../../components/common/LoadingState";
import ErrorState from "../../../components/common/ErrorState";
import SearchBar from "../../../components/common/SearchBar";
import HomeProductCard from "../../../components/home/HomeProductCard";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import { radius, borderWidth } from "../../../constants/sizes";
import shadows from "../../../constants/shadows";
import { fontFamily, fontSize, lineHeight } from "../../../constants/typography";
import {
  mockCategories,
  mockManufacturers,
} from "../../../services/mockData";
import { useCart } from "../../../hooks/useCart";
import { useProducts } from "../../../hooks/useProducts";
import { useResponsive } from "../../../hooks/useResponsive";
import type { Product } from "../../../types/product";
import { normalizeError } from "../../../utils/errorHandling";

export default function CustomerProductsScreen() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [manufacturerId, setManufacturerId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<
    { kind: "success" | "error"; message: string } | null
  >(null);
  const { addItem } = useCart();
  const { columns, isMobile } = useResponsive();
  const displayColumns = isMobile ? 2 : Math.max(2, columns);
  const {
    data: products,
    loading,
    error,
    reload,
  } = useProducts({ pageSize: 50 });

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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        [product.name, product.brand, product.genericName]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesCategory = !categoryId || product.categoryId === categoryId;
      const matchesManufacturer =
        !manufacturerId || product.manufacturerId === manufacturerId;
      return matchesQuery && matchesCategory && matchesManufacturer;
    });
  }, [categoryId, manufacturerId, query, products]);

  if (loading) return <LoadingState label="Loading products…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Products" subtitle="Browse by category and manufacturer" />
      <FlatList
        data={filteredProducts}
        key={displayColumns}
        numColumns={displayColumns}
        contentContainerStyle={styles.container}
        columnWrapperStyle={displayColumns > 1 ? styles.gridRow : undefined}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <HomeProductCard
              product={item}
              onPress={(product) =>
                router.push({
                  pathname: "/(customer)/products/[productId]",
                  params: { productId: product.id },
                })
              }
              onAdd={handleAddToCart}
              adding={addingId === item.id}
            />
          </View>
        )}
        ListHeaderComponent={
          <View>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search products"
            />

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

            <Text style={styles.label}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              <Pressable
                style={[styles.chip, !categoryId && styles.chipSelected]}
                accessibilityRole="button"
                onPress={() => setCategoryId(null)}
              >
                <Text style={[styles.chipText, !categoryId && styles.chipSelectedText]}>All</Text>
              </Pressable>
              {mockCategories.map((category) => (
                <Pressable
                  key={category.id}
                  style={[
                    styles.chip,
                    categoryId === category.id && styles.chipSelected,
                  ]}
                  accessibilityRole="button"
                  onPress={() => setCategoryId(category.id)}
                >
                  <Text style={[styles.chipText, categoryId === category.id && styles.chipSelectedText]}>{category.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Manufacturers</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              <Pressable
                style={[styles.chip, !manufacturerId && styles.chipSelected]}
                accessibilityRole="button"
                onPress={() => setManufacturerId(null)}
              >
                <Text style={[styles.chipText, !manufacturerId && styles.chipSelectedText]}>All</Text>
              </Pressable>
              {mockManufacturers.map((manufacturer) => (
                <Pressable
                  key={manufacturer.id}
                  style={[
                    styles.chip,
                    manufacturerId === manufacturer.id && styles.chipSelected,
                  ]}
                  accessibilityRole="button"
                  onPress={() => setManufacturerId(manufacturer.id)}
                >
                  <Text style={[styles.chipText, manufacturerId === manufacturer.id && styles.chipSelectedText]}>{manufacturer.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.resultText}>
              {filteredProducts.length} products
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.resultText}>No products found</Text>
        }
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    rowGap: spacing.md,
    gap: spacing.md,
  },
  gridRow: { gap: spacing.md },
  gridItem: { flex: 1, maxWidth: "50%" },
  label: {
    color: colors.text,
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.bodySmall,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  chipsRow: { paddingVertical: spacing.sm, gap: spacing.sm },
  chip: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  chipText: {
    color: colors.text,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.footnote,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipSelectedText: { color: colors.primary },
  resultText: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.caption,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  feedback: {
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.bodySmall,
    marginTop: spacing.md,
  },
  feedbackSuccess: { color: colors.success },
  feedbackError: { color: colors.danger },
});
