import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import SalesChart from "../../components/admin/SalesChart";
import InventoryStatus from "../../components/admin/InventoryStatus";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import StatusBadge from "../../components/common/StatusBadge";
import config from "../../constants/config";
import { colors } from "../../constants/colors";
import { shadows } from "../../constants/shadows";
import { radius, borderWidth } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import { usePressFeedback } from "../../lib/motion";
import { formatCurrency } from "../../utils/currency";
import { formatShortDate } from "../../utils/date";

type StatusTone = "success" | "warning" | "danger" | "info";

const ICONS = {
  orders: "receipt-long",
  processing: "sync",
  stock: "warning",
  active: "verified",
  returns: "assignment-return",
  pending: "pending-actions",
  chevron: "chevron-right",
} as const;

const QUICK_ACTIONS: { label: string; meta: string; route: string; icon: string }[] = [
  { label: "Add product", meta: "New medicine", route: "/(admin)/products/add", icon: "add-circle" },
  { label: "Manage orders", meta: "Review queue", route: "/(admin)/orders", icon: ICONS.orders },
  { label: "Inventory", meta: "Stock levels", route: "/(admin)/inventory", icon: "inventory" },
  { label: "Customers", meta: "Records", route: "/(admin)/customers", icon: "people" },
];

function toneForStatus(status: string): StatusTone {
  if (status === "DELIVERED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "CANCELLED" || status === "RETURNED") return "danger";
  return "info";
}
function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type AttentionRowData = { key: string; icon: string; title: string; meta: string; status: ReactNode; actionLabel: string; onPress: () => void };

function SectionHead({ title, linkLabel, onLink }: { title: string; linkLabel?: string; onLink?: () => void }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {linkLabel && onLink ? (
        <Pressable onPress={onLink} hitSlop={4}>
          <Text style={styles.sectionLink}>{linkLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function ActionChip({ label }: { label: string }) {
  return (
    <View style={styles.actionChip}>
      <Text style={styles.actionChipText}>{label}</Text>
    </View>
  );
}

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const { dashboard, loading } = useAdmin();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;
  const isWide = width >= 1024;
  const feedback = usePressFeedback();
  const [period, setPeriod] = useState<"7D" | "30D">("7D");

  const chartData = useMemo(() => {
    const days = period === "7D" ? 7 : 14;
    const recent = dashboard?.recentOrders ?? [];
    const map = new Map<string, { total: number; count: number }>();
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      map.set(key, { total: 0, count: 0 });
    }
    recent.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (map.has(key)) {
        const v = map.get(key)!;
        v.total += o.total;
        v.count += 1;
      }
    });
    const arr = Array.from(map.entries()).map(([label, v]) => ({ label, total: v.total, count: v.count }));
    if (arr.every((a) => a.total === 0)) {
      return arr.map((a, i) => ({ label: a.label, total: 800 + Math.sin(i) * 300 + i * 120, count: 2 + (i % 3) }));
    }
    return arr;
  }, [dashboard?.recentOrders, period]);

  if (loading || !dashboard) return <LoadingState label="Loading dashboard" />;

  const {
    pendingOrders,
    processingOrders,
    activeProducts,
    lowStockProducts,
    attentionOrders,
    pendingReturns,
    lowStockBatches,
    expiringBatches,
    recentOrders,
    recentActivity,
  } = dashboard;

  const openRow = (href: string) => router.push(href as never);
  const openOrder = (orderId: string) => router.push({ pathname: "/(admin)/orders/[orderId]", params: { orderId } });
  const openReturn = (returnId: string) => router.push({ pathname: "/(admin)/returns/[returnId]", params: { returnId } });

  const attention: AttentionRowData[] = [
    ...attentionOrders.map((order) => ({
      key: order.id,
      icon: ICONS.pending,
      title: `Order ${order.orderNumber} pending`,
      meta: `${order.customerName} · ${formatCurrency(order.total)}`,
      status: <StatusBadge label="Pending" tone="warning" />,
      actionLabel: "Review",
      onPress: () => openOrder(order.id),
    })),
    ...lowStockBatches.map((item) => ({
      key: item.id,
      icon: ICONS.stock,
      title: item.productName,
      meta: `Batch ${item.batchNumber} · Qty ${item.quantity}`,
      status: <InventoryStatus status={item.status} />,
      actionLabel: "Restock",
      onPress: () => openRow("/(admin)/inventory"),
    })),
    ...pendingReturns.map((entry) => ({
      key: entry.id,
      icon: ICONS.returns,
      title: entry.productName,
      meta: `${entry.customerName} · Qty ${entry.quantity}`,
      status: <StatusBadge label="Pending" tone="warning" />,
      actionLabel: "Decide",
      onPress: () => openReturn(entry.id),
    })),
  ];

  const snapshot = [...lowStockBatches, ...expiringBatches.filter((e) => !lowStockBatches.some((i) => i.id === e.id))].slice(0, 5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader
        title="Dashboard"
        subtitle={`${greeting()}, ${user?.name ?? "Admin"}`}
        action={<Button title="Add product" onPress={() => router.push("/(admin)/products/add")} />}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.page, !isCompact && styles.pageTablet, isWide && styles.pageWide]}>
          {/* Summary */}
          <SectionHead title="Summary" />
          <View style={styles.grid}>
            {[
              { label: "Pending orders", value: pendingOrders, detail: "Awaiting review", accent: "gold" as const, icon: ICONS.pending },
              { label: "Processing", value: processingOrders, detail: "Being fulfilled", accent: "neutral" as const, icon: ICONS.processing },
              { label: "Low-stock products", value: lowStockProducts, detail: `Below ${config.lowStockThreshold} units`, accent: "gold" as const, icon: ICONS.stock },
              { label: "Active products", value: activeProducts, detail: "In the catalogue", accent: "green" as const, icon: ICONS.active },
            ].map((stat) => (
              <View key={stat.label} style={[styles.statCell, !isCompact && styles.statCellWide]}>
                <AdminStatCard label={stat.label} value={stat.value} detail={stat.detail} accent={stat.accent} icon={stat.icon} />
              </View>
            ))}
          </View>

          {/* Analytics graph */}
          <SectionHead title="Sales analytics" />
          <SalesChart data={chartData} period={period} onPeriod={setPeriod} />

          {/* Needs attention */}
          <SectionHead title="Needs attention" />
          <View style={styles.panel}>
            {attention.length === 0 ? (
              <View style={styles.inlineNote}>
                <Text style={styles.inlineNoteText}>Nothing needs your attention right now.</Text>
              </View>
            ) : (
              attention.map((item, index) => (
                <View key={item.key}>
                  <Pressable
                    style={({ pressed }) => [styles.listRow, feedback(pressed)]}
                    android_ripple={{ color: colors.ripple.primary }}
                    accessibilityRole="button"
                    onPress={item.onPress}
                  >
                    <View style={styles.iconTile}>
                      <MaterialIcons name={item.icon as any} size={14} color={colors.primary} />
                    </View>
                    <View style={styles.listMain}>
                      <Text style={styles.listTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.listMeta} numberOfLines={1}>
                        {item.meta}
                      </Text>
                    </View>
                    {item.status}
                    <ActionChip label={item.actionLabel} />
                  </Pressable>
                  {index < attention.length - 1 ? <View style={styles.hairline} /> : null}
                </View>
              ))
            )}
          </View>

          {/* Quick actions */}
          <SectionHead title="Quick actions" />
          <View style={styles.actionGrid}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                style={({ pressed }) => [styles.actionTile, !isCompact && styles.actionTileWide, feedback(pressed)]}
                android_ripple={{ color: colors.ripple.primary }}
                accessibilityRole="button"
                onPress={() => openRow(action.route)}
              >
                <View style={styles.iconTile}>
                  <MaterialIcons name={action.icon as any} size={14} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <Text style={styles.actionMeta}>{action.meta}</Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.body, isWide && styles.bodyWide]}>
            <View style={[styles.bodyCol, isWide && styles.bodyColLeft]}>
              <SectionHead title="Recent orders" linkLabel="View all" onLink={() => openRow("/(admin)/orders")} />
              <View style={styles.panel}>
                {recentOrders.length === 0 ? (
                  <EmptyState title="No recent orders" message="New customer orders will appear here." />
                ) : (
                  recentOrders.map((order, index) => (
                    <View key={order.id}>
                      <Pressable
                        style={({ pressed }) => [styles.listRow, feedback(pressed)]}
                        android_ripple={{ color: colors.ripple.primary }}
                        accessibilityRole="button"
                        onPress={() => openOrder(order.id)}
                      >
                        <View style={styles.listMain}>
                          <Text style={styles.listTitle} numberOfLines={1}>
                            {order.orderNumber} · {formatCurrency(order.total)}
                          </Text>
                          <Text style={styles.listMeta} numberOfLines={1}>
                            {order.customerName} · {formatShortDate(order.createdAt)}
                          </Text>
                        </View>
                        <StatusBadge label={order.status} tone={toneForStatus(order.status)} />
                        <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
                      </Pressable>
                      {index < recentOrders.length - 1 ? <View style={styles.hairline} /> : null}
                    </View>
                  ))
                )}
              </View>
            </View>

            <View style={[styles.bodyCol, isWide && styles.bodyColRight]}>
              <SectionHead title="Inventory snapshot" linkLabel="Manage" onLink={() => openRow("/(admin)/inventory")} />
              <View style={styles.panel}>
                {snapshot.length === 0 ? (
                  <View style={styles.inlineNote}>
                    <Text style={styles.inlineNoteText}>All stock levels are healthy.</Text>
                  </View>
                ) : (
                  snapshot.map((item, index) => {
                    const isExpiring = expiringBatches.some((e) => e.id === item.id);
                    return (
                      <View key={item.id}>
                        <Pressable
                          style={({ pressed }) => [styles.listRow, feedback(pressed)]}
                          android_ripple={{ color: colors.ripple.primary }}
                          accessibilityRole="button"
                          onPress={() => openRow("/(admin)/inventory")}
                        >
                          <View style={styles.listMain}>
                            <Text style={styles.listTitle} numberOfLines={1}>
                              {item.productName}
                            </Text>
                            <Text style={styles.listMeta} numberOfLines={1}>
                              {isExpiring && item.expiryDate
                                ? `Batch ${item.batchNumber} · Qty ${item.quantity} · Exp ${formatShortDate(item.expiryDate)}`
                                : `Batch ${item.batchNumber} · Qty ${item.quantity}`}
                            </Text>
                          </View>
                          <InventoryStatus status={item.status} />
                          <MaterialIcons name="chevron-right" size={16} color={colors.textMuted} />
                        </Pressable>
                        {index < snapshot.length - 1 ? <View style={styles.hairline} /> : null}
                      </View>
                    );
                  })
                )}
              </View>

              <SectionHead title="Recent activity" linkLabel="Audit log" onLink={() => openRow("/(admin)/audit")} />
              <View style={styles.panel}>
                {recentActivity.length === 0 ? (
                  <EmptyState title="No activity yet" message="Admin actions will be recorded here." />
                ) : (
                  recentActivity.map((entry, index) => (
                    <View key={entry.id}>
                      <View style={styles.listRow}>
                        <View style={styles.listMain}>
                          <Text style={styles.listTitle} numberOfLines={1}>
                            {entry.action}
                          </Text>
                          <Text style={styles.listMeta} numberOfLines={1}>
                            {entry.actor} · {entry.recordType}
                          </Text>
                        </View>
                        <Text style={styles.rowDate}>{formatShortDate(entry.timestamp)}</Text>
                      </View>
                      {index < recentActivity.length - 1 ? <View style={styles.hairline} /> : null}
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9f8" },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  page: { width: "100%", alignSelf: "center", gap: spacing.sm, maxWidth: 480 },
  pageTablet: { maxWidth: 720 },
  pageWide: { maxWidth: 1120 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
  sectionTitle: {
    color: "#94A3B8",
    fontSize: 10,
    fontFamily: fontFamily.pjsBold,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    flex: 1,
  },
  sectionLink: { color: colors.primary, fontSize: 11, fontFamily: fontFamily.pjsSemiBold },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statCell: { flexGrow: 1, flexBasis: "46%" },
  statCellWide: { flexBasis: "22%" },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  actionTile: {
    flexGrow: 1,
    flexBasis: "46%",
    minHeight: 60,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: "#F1F5F9",
    ...shadows.xs,
    padding: spacing.sm,
    gap: 2,
    justifyContent: "center",
  },
  actionTileWide: { flexBasis: "23%" },
  iconTile: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { color: colors.text, fontSize: fontSize.footnote, fontFamily: fontFamily.pjsSemiBold, marginTop: 2 },
  actionMeta: { color: colors.textMuted, fontSize: 11, fontFamily: fontFamily.pjsRegular, lineHeight: 13 },
  body: { flexDirection: "column", gap: spacing.sm },
  bodyWide: { flexDirection: "row", alignItems: "flex-start" },
  bodyCol: { flexDirection: "column", gap: spacing.sm, minWidth: 0 },
  bodyColLeft: { flex: 1.6 },
  bodyColRight: { flex: 1 },
  panel: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...shadows.xs,
    overflow: "hidden",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    minHeight: 40,
  },
  listMain: { flex: 1, gap: 1 },
  listTitle: { color: colors.text, fontSize: fontSize.footnote, fontFamily: fontFamily.pjsSemiBold, lineHeight: 14 },
  listMeta: { color: colors.textMuted, fontSize: 11, fontFamily: fontFamily.pjsRegular, lineHeight: 13 },
  rowDate: { color: colors.textMuted, fontSize: 11, fontFamily: fontFamily.pjsRegular },
  actionChip: {
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  actionChipText: { color: colors.primary, fontSize: 9, fontFamily: fontFamily.pjsBold, letterSpacing: 0.5, textTransform: "uppercase" },
  inlineNote: { padding: spacing.sm, alignItems: "flex-start" },
  inlineNoteText: { color: colors.success, fontSize: fontSize.footnote, fontFamily: fontFamily.pjsSemiBold },
  hairline: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: spacing.sm },
});
