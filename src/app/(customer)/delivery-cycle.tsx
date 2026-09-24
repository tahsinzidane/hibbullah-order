import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import EmptyState from '../../components/common/EmptyState';
import Header from '../../components/common/Header';
import LoadingState from '../../components/common/LoadingState';
import StatusBadge from '../../components/common/StatusBadge';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { radius } from '../../constants/sizes';
import { shadows } from '../../constants/shadows';
import { fontFamily, fontSize } from '../../constants/typography';
import { useDeliveryCycle } from '../../hooks/useDeliveryCycle';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';

export default function DeliveryCycleScreen() {
  const { cycle, loading } = useDeliveryCycle();

  if (loading) return <LoadingState label="Loading delivery cycle" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Delivery cycle" onBack={() => router.back()} />
      {!cycle ? (
        <ScrollView contentContainerStyle={styles.container}>
          <EmptyState
            title="No active delivery cycle"
            message="When a delivery cycle is open for you it will appear here."
            actionLabel="Back"
            onAction={() => router.back()}
          />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Active order cycle</Text>
            <StatusBadge
              label={cycle.status}
              tone={cycle.status === 'PENDING' ? 'warning' : 'info'}
            />
            <Text style={styles.meta}>Start: {formatDateTime(cycle.startedAt)}</Text>
            <Text style={styles.meta}>Closes: {formatDateTime(cycle.closesAt)}</Text>
            <Text style={styles.total}>
              Estimated total: {formatCurrency(cycle.estimatedTotal)}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Products in cycle</Text>
            {cycle.products.length === 0 ? (
              <Text style={styles.emptyText}>No products listed in this cycle.</Text>
            ) : (
              cycle.products.map((product) => (
                <View key={product.id} style={styles.row}>
                  <Text style={styles.itemName}>{product.name}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(product.price)}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.backgroundAlt, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, ...shadows.xs },
  title: { color: colors.text, fontFamily: fontFamily.soraSemiBold, fontSize: fontSize.title3, marginBottom: spacing.md },
  meta: { color: colors.textMuted, fontFamily: fontFamily.pjsRegular, fontSize: fontSize.footnote, marginTop: spacing.sm },
  total: { marginTop: spacing.md, color: colors.text, fontFamily: fontFamily.pjsBold, fontSize: fontSize.body },
  sectionTitle: { color: colors.text, fontFamily: fontFamily.soraSemiBold, fontSize: fontSize.title3, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemName: { color: colors.text, fontFamily: fontFamily.pjsRegular, fontSize: fontSize.body, flex: 1 },
  itemPrice: { color: colors.text, fontFamily: fontFamily.pjsSemiBold, fontSize: fontSize.body },
  emptyText: { color: colors.textMuted, fontFamily: fontFamily.pjsRegular, fontSize: fontSize.bodySmall },
});