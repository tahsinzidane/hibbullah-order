import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import LoadingState from '../../../components/common/LoadingState';
import { colors } from '../../../constants/colors';
import { shadows } from '../../../constants/shadows';
import { radius } from '../../../constants/sizes';
import { spacing } from '../../../constants/spacing';
import {
  fontFamily,
  fontSize,
  lineHeight,
} from '../../../constants/typography';
import { getAuditLog } from '../../../services/admin/auditService';
import type { AuditEntry } from '../../../types/audit';
import { formatDateTime } from '../../../utils/date';
import { normalizeError } from '../../../utils/errorHandling';

export default function AuditLogScreen() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEntries(await getAuditLog());
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading audit log" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader title="Audit log" subtitle="Recent operational activity" />
      <ScrollView contentContainerStyle={styles.container}>
        {error ? (
          <ErrorState title="Could not load audit log" message={error} onRetry={load} />
        ) : entries.length === 0 ? (
          <EmptyState title="No audit entries" message="Operational activity will appear here." />
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.card}>
              <Text style={styles.action}>{entry.action}</Text>
              <Text style={styles.meta}>{entry.actor}</Text>
              <Text style={styles.meta}>{formatDateTime(entry.timestamp)}</Text>
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
    padding: spacing.lg,
  },
  action: {
    color: colors.text,
    fontSize: fontSize.body,
    fontFamily: fontFamily.pjsBold,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fontSize.footnote,
    fontFamily: fontFamily.pjsRegular,
    lineHeight: fontSize.footnote * lineHeight.relaxed,
    marginTop: spacing.xs,
  },
});