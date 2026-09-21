import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../../../components/common/Button';
import Header from '../../../components/common/Header';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import colors from '../../../constants/colors';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import { cancelOrderByCustomer, getOrderById } from '../../../services/orderService';
import type { Order } from '../../../types/order';
import { formatCurrency } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';
import { normalizeError } from '../../../utils/errorHandling';

export default function CustomerOrderDetailScreen() {
  const params = useLocalSearchParams<{ orderId: string }>();
  const orderId = params.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const item = await getOrderById(orderId);
        if (!active) return;
        if (!item) {
          setError("Order not found.");
          setOrder(null);
          return;
        }
        setOrder(item);
      } catch (err) {
        if (!active) return;
        setError(normalizeError(err).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [orderId]);

  const retry = () => {
    setLoading(true);
    setError(null);
    void getOrderById(orderId)
      .then((item) => {
        if (!item) {
          setError("Order not found.");
          setOrder(null);
          return;
        }
        setOrder(item);
      })
      .catch((err) => setError(normalizeError(err).message))
      .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    if (order?.status !== "PENDING") return;
    Alert.alert(
      "Cancel order",
      `Are you sure you want to cancel ${order.orderNumber}? This cannot be undone.`,
      [
        { text: "Keep order", style: "cancel" },
        {
          text: "Cancel order",
          style: "destructive",
          onPress: () => {
            setCancelling(true);
            setCancelError(null);
            void cancelOrderByCustomer(order.id)
              .then((updated) => setOrder(updated))
              .catch((err) => setCancelError(normalizeError(err).message))
              .finally(() => setCancelling(false));
          },
        },
      ],
    );
  };

  if (loading) return <LoadingState label="Loading order" />;

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Order" onBack={() => router.back()} />
        <ErrorState
          title="Could not load order"
          message={error ?? "This order could not be found."}
          onRetry={retry}
        />
      </SafeAreaView>
    );
  }

  const tone =
    order.status === 'DELIVERED'
      ? 'success'
      : order.status === 'CANCELLED'
        ? 'danger'
        : order.status === 'PENDING'
          ? 'warning'
          : 'info';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={order.orderNumber} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Order summary</Text>
          <StatusBadge label={order.status} tone={tone} />
          <Text style={styles.meta}>Placed {formatDateTime(order.createdAt)}</Text>
          <Text style={styles.meta}>Payment: Cash on Delivery</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Text style={styles.detailRow}>Name: {order.customerName}</Text>
          {order.customerEmail ? (
            <Text style={styles.detailRow}>Email: {order.customerEmail}</Text>
          ) : null}
          {order.customerPhone ? (
            <Text style={styles.detailRow}>Phone: {order.customerPhone}</Text>
          ) : null}
          {order.addressLabel ? (
            <Text style={styles.detailRow}>Address label: {order.addressLabel}</Text>
          ) : null}
          <Text style={styles.detailRow}>Delivery location: {order.address}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Products</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemMeta}>
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </Text>
            </View>
          ))}
          <View style={[styles.row, styles.summaryRow]}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryLabel}>{formatCurrency(order.subtotal)}</Text>
          </View>
          {order.discount > 0 ? (
            <View style={styles.row}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryLabel}>-{formatCurrency(order.discount)}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryLabel}>{formatCurrency(order.deliveryFee)}</Text>
          </View>
        </View>

        {order.status === "PENDING" ? (
          <View style={styles.cancelWrap}>
            {cancelError ? (
              <Text style={styles.cancelError}>{cancelError}</Text>
            ) : null}
            <Button
              title={cancelling ? "Cancelling…" : "Cancel order"}
              variant="danger"
              onPress={handleCancel}
              loading={cancelling}
              fullWidth
            />
            <Text style={styles.cancelHint}>
              Orders can be cancelled while they are still pending approval.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  meta: { color: colors.textMuted, fontSize: typography.bodySmall, marginTop: spacing.sm },
  detailRow: { color: colors.text, fontSize: typography.bodySmall, marginTop: spacing.sm },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemName: { color: colors.text, fontSize: typography.body, flex: 1 },
  itemMeta: { color: colors.textMuted, fontSize: typography.bodySmall },
  summaryRow: { marginTop: spacing.md },
  summaryLabel: { color: colors.textMuted, fontSize: typography.bodySmall },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { color: colors.text, fontSize: typography.bodySmall, fontWeight: '700' },
  totalValue: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  cancelWrap: { gap: spacing.sm, marginTop: spacing.sm },
  cancelError: { color: colors.danger, fontSize: typography.bodySmall, textAlign: 'center' },
  cancelHint: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textAlign: 'center',
  },
});