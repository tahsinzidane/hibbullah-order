import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../../components/common/EmptyState";
import ErrorState from "../../../components/common/ErrorState";
import Header from "../../../components/common/Header";
import LoadingState from "../../../components/common/LoadingState";
import OrderCard from "../../../components/orders/OrderCard";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import { useOrders } from "../../../hooks/useOrders";
import type { Order } from "../../../types/order";

export default function CustomerOrdersScreen() {
  const { orders, loading, error, reload } = useOrders();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const openOrder = (order: Order) => {
    router.push({
      pathname: "/(customer)/order/[orderId]",
      params: { orderId: order.id },
    });
  };

  if (loading) return <LoadingState label="Loading your orders" />;
  if (error)
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          reload();
        }}
      />
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Orders" subtitle="Track current and previous deliveries" />
      <ScrollView contentContainerStyle={styles.container}>
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            message="Your completed orders will appear here."
            actionLabel="Browse products"
            onAction={() => router.push("/(customer)/(tabs)/products")}
          />
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onPress={openOrder} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
});