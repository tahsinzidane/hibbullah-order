import { useEffect, useRef, useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import { radius } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize } from "../../constants/typography";
import shadows from "../../constants/shadows";
import type { Product } from "../../types/product";
import ProductImage from "../products/ProductImage";
import { getProductImageUri } from "../../utils/image";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type Props = {
  products: Product[];
  onPress: (p: Product) => void;
};

export default function TrendingRail({ products, onPress }: Props) {
  const ref = useRef<FlatList<Product>>(null);
  const indexRef = useRef(0);
  const reduced = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (reduced || products.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % products.length;
      ref.current?.scrollToIndex({ index: indexRef.current, animated: true, viewPosition: 0.5 });
    }, 3200);
  }, [products.length, reduced]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  if (products.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Trending</Text>
      <FlatList
        ref={ref}
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.content}
        snapToInterval={84}
        snapToAlignment="start"
        decelerationRate="fast"
        onScrollBeginDrag={stop}
        onScrollEndDrag={start}
        onMomentumScrollEnd={start}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPress(item)}
            style={styles.item}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.name}`}
          >
            <View style={styles.imageBox}>
              <ProductImage uri={getProductImageUri(item)} recyclingKey={item.id} style={styles.image} />
            </View>
          </Pressable>
        )}
        getItemLayout={(_, index) => ({ length: 84, offset: 84 * index, index })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: spacing.md },
  label: {
    paddingHorizontal: spacing.lg,
    color: colors.textMuted,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.micro,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  content: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingRight: spacing.lg },
  item: {
    width: 76,
    height: 76,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundAlt,
    overflow: "hidden",
    ...shadows.xs,
  },
  imageBox: { flex: 1, padding: spacing.xs, backgroundColor: "#F8F8F6" },
  image: { width: "100%", height: "100%", borderRadius: 10, backgroundColor: "#F8F8F6" },
});
