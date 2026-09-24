import { router, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../../components/common/Header";
import LoadingState from "../../../../components/common/LoadingState";
import ErrorState from "../../../../components/common/ErrorState";
import ProductCard from "../../../../components/products/ProductCard";
import colors from "../../../../constants/colors";
import spacing from "../../../../constants/spacing";
import { useResponsive } from "../../../../hooks/useResponsive";
import { mockCategories } from "../../../../services/mockData";
import { useProducts } from "../../../../hooks/useProducts";

export default function CategoryProductsScreen() {
  const params = useLocalSearchParams<{ categoryId: string }>();
  const category =
    mockCategories.find((item) => item.id === params.categoryId) ??
    mockCategories[0];
  const { columns } = useResponsive();

  const {
    data: products,
    loading,
    error,
    reload,
  } = useProducts({ categoryId: category.id, pageSize: 50 });

  if (loading) return <LoadingState label="Loading products…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={category.name} onBack={() => router.back()} />
      <FlatList
        data={products}
        key={columns}
        numColumns={columns}
        contentContainerStyle={styles.container}
        columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProductCard
              product={item}
              compact
              onPress={(product) =>
                router.push({
                  pathname: "/(customer)/products/[productId]",
                  params: { productId: product.id },
                })
              }
            />
          </View>
        )}
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
    rowGap: spacing.lg,
  },
  gridRow: { gap: spacing.lg },
  gridItem: { flex: 1 },
});
