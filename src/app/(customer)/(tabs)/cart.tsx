import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartItemRow from "../../../components/cart/CartItem";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import Header from "../../../components/common/Header";
import LoadingState from "../../../components/common/LoadingState";
import { colors } from "../../../constants/colors";
import { spacing } from "../../../constants/spacing";
import { radius } from "../../../constants/sizes";
import { shadows } from "../../../constants/shadows";
import { fontFamily, fontSize } from "../../../constants/typography";
import { useAuth } from "../../../hooks/useAuth";
import { useCart } from "../../../hooks/useCart";
import { supabase } from "../../../lib/supabase";
import { getDeliveryDetailsStatus } from "../../../services/addressService";
import { formatCurrency } from "../../../utils/currency";
import { normalizeError } from "../../../utils/errorHandling";

export default function CustomerCartScreen() {
  const { session } = useAuth();
  const { items, summary, loading, setQuantity, removeItem } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [checkingDelivery, setCheckingDelivery] = useState(false);

  const proceedToCheckout = async () => {
    if (!items.length || updating || checkingDelivery) return;

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id ?? session?.userId ?? null;
    if (!userId) {
      router.push("/(customer)/checkout");
      return;
    }

    setCheckingDelivery(true);
    setError(null);
    try {
      const status = await getDeliveryDetailsStatus(userId);
      if (status.ready) {
        router.push("/(customer)/checkout");
      } else {
        router.push({
          pathname: "/(customer)/address/edit",
          params: { reason: "address_required" },
        });
      }
    } catch {
      router.push("/(customer)/checkout");
    } finally {
      setCheckingDelivery(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setUpdating(true);
    setError(null);
    try {
      await setQuantity(itemId, quantity);
    } catch (nextError) {
      setError(normalizeError(nextError).message);
    } finally {
      setUpdating(false);
    }
  };

  const removeCartItem = async (itemId: string) => {
    setUpdating(true);
    setError(null);
    try {
      await removeItem(itemId);
    } catch (nextError) {
      setError(normalizeError(nextError).message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingState label="Loading your cart" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Cart" subtitle="Review and checkout your items" />
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            message="Add medicines from the product catalogue to begin."
            actionLabel="Browse products"
            onAction={() => router.push("/(customer)/(tabs)/products")}
          />
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onQuantity={(quantity) => updateQuantity(item.id, quantity)}
              onRemove={() => removeCartItem(item.id)}
            />
          ))
        )}

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.summaryValue}>-{formatCurrency(summary.discount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery fee</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.deliveryFee)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalText}>
              {formatCurrency(summary.total)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Continue shopping"
            variant="secondary"
            onPress={() => router.push("/(customer)/(tabs)/products")}
            fullWidth
          />
          <Button
            title="Proceed to checkout"
            onPress={proceedToCheckout}
            disabled={items.length === 0 || updating || checkingDelivery}
            loading={checkingDelivery}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.bodySmall,
  },
  summaryBox: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  totalRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalText: {
    color: colors.text,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.body,
  },
  summaryLabel: {
    color: colors.text,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.bodySmall,
  },
  summaryValue: {
    color: colors.text,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.bodySmall,
  },
  actions: { gap: spacing.md },
});
