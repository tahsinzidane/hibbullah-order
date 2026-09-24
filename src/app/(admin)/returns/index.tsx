import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import LoadingState from '../../../components/common/LoadingState';
import StatusBadge from '../../../components/common/StatusBadge';
import { colors } from '../../../constants/colors';
import { shadows } from '../../../constants/shadows';
import { radius } from '../../../constants/sizes';
import { spacing } from '../../../constants/spacing';
import { fontFamily, fontSize } from '../../../constants/typography';
import { getReturns } from '../../../services/admin/returnService';
import type { ReturnRequest } from '../../../types/return';
import { normalizeError } from '../../../utils/errorHandling';

export default function AdminReturnsScreen() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReturns(await getReturns());
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading returns" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader title="Returns" subtitle="Customer return requests" />
      <ScrollView contentContainerStyle={styles.container}>
        {error ? (
          <ErrorState title="Could not load returns" message={error} onRetry={load} />
        ) : returns.length === 0 ? (
          <EmptyState title="No returns" message="Return requests will appear here." />
        ) : (
          returns.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.order}>{item.orderId}</Text>
              <Text style={styles.reason}>{item.reason}</Text>
              <View style={styles.footer}>
                <StatusBadge
                  label={item.status}
                  tone={item.status === 'APPROVED' || item.status === 'PROCESSED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'}
                />
                <Text
                  style={styles.link}
                  onPress={() =>
                    router.push({
                      pathname: '/(admin)/returns/[returnId]',
                      params: { returnId: item.id },
                    })
                  }
                >
                  Details
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
    padding: spacing.lg,
  },
  order: {
    color: colors.text,
    fontSize: fontSize.body,
    fontFamily: fontFamily.pjsBold,
  },
  reason: {
    color: colors.textMuted,
    fontSize: fontSize.bodySmall,
    fontFamily: fontFamily.pjsRegular,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: colors.primary, fontFamily: fontFamily.pjsBold },
});