import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import sizes, { borderWidth } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import shadows from "../../constants/shadows";
import { fontFamily, fontSize } from "../../constants/typography";
import { compression } from "../../lib/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { Product } from "../../types/product";
import ProductImage from "../products/ProductImage";
import ProductPrice from "../products/ProductPrice";
import StatusBadge from "../common/StatusBadge";

export default function AdminProductCard({ product, onPress }: { product: Product; onPress?: (product: Product) => void }) {
	const reducedMotion = useReducedMotion();
	const available = product.isActive && product.stock > 0;
	return (
		<Pressable style={({ pressed }) => [styles.card, pressed && !reducedMotion && styles.pressed]} onPress={() => onPress?.(product)} accessibilityRole="button" accessibilityLabel={`Edit ${product.name}`}>
			<ProductImage uri={product.primaryImage ?? product.image} recyclingKey={product.id} style={styles.image} />
			<View style={styles.content}>
				<View style={styles.topRow}>
					<Text style={styles.name} numberOfLines={2}>{product.name}</Text>
					<StatusBadge label={!product.isActive ? "Inactive" : product.stock === 0 ? "Out of stock" : product.stock < 10 ? "Low stock" : "Active"} tone={!product.isActive || product.stock === 0 ? "danger" : product.stock < 10 ? "warning" : "success"} />
				</View>
				<Text style={styles.meta}>{product.brand} · {product.genericName}</Text>
				<View style={styles.footer}>
					<ProductPrice price={product.price} originalPrice={product.originalPrice} />
					<Text style={[styles.stock, !available && styles.unavailable]}>{product.stock} units</Text>
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: { flexDirection: "row", backgroundColor: colors.backgroundAlt, borderRadius: sizes.borderRadius.lg, borderWidth: borderWidth.thin, borderColor: colors.border, overflow: "hidden", ...shadows.xs },
	pressed: { transform: [{ scale: compression.subtle }], opacity: 0.92 },
	image: { width: 88, height: 104, borderRadius: 0 },
	content: { flex: 1, padding: spacing.md, gap: spacing.xs },
	topRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
	name: { flex: 1, color: colors.text, fontFamily: fontFamily.pjsMedium, fontSize: fontSize.footnote },
	meta: { color: colors.textMuted, fontFamily: fontFamily.pjsRegular, fontSize: fontSize.micro },
	footer: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto" },
	stock: { color: colors.success, fontFamily: fontFamily.pjsSemiBold, fontSize: fontSize.micro },
	unavailable: { color: colors.danger },
});