import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/common/Header";
import LoadingState from "../../../components/common/LoadingState";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { useNotifications } from "../../../hooks/useNotifications";
import type { NotificationType } from "../../../types/notification";
import { formatDateTime } from "../../../utils/date";

function accentForType(type: NotificationType): string {
  switch (type) {
    case "success":
      return colors.success;
    case "warning":
    case "alert":
      return colors.warning;
    case "info":
    default:
      return colors.info;
  }
}

export default function CustomerNotificationsScreen() {
  const {
    notifications,
    hasUnread,
    loading,
    error,
    markRead,
    markAllRead,
    refresh,
  } = useNotifications();

  if (loading) return <LoadingState label="Loading notifications" />;

  const headerAction = hasUnread ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Mark all notifications as read"
      hitSlop={8}
      onPress={() => void markAllRead()}
    >
      <Text style={styles.markAll}>Mark all read</Text>
    </Pressable>
  ) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Notifications"
        subtitle="Order updates and alerts"
        rightAction={headerAction}
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {error ? (
          <Pressable onPress={() => void refresh()} accessibilityRole="button">
            <Text style={styles.errorText}>
              {error} · Tap to retry
            </Text>
          </Pressable>
        ) : null}

        {!error && notifications.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>You&rsquo;re all caught up</Text>
            <Text style={styles.emptyBody}>
              Notifications about your orders will appear here.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const accent = accentForType(notification.type);
            return (
              <Pressable
                key={notification.id}
                onPress={() => {
                  if (!notification.read) void markRead(notification.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${notification.title}. ${notification.body}. ${notification.read ? "Read" : "Unread"}`}
                style={({ pressed }) => [
                  styles.card,
                  !notification.read && styles.cardUnread,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[styles.dot, { backgroundColor: accent }]}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                  />
                  <Text
                    style={[
                      styles.title,
                      !notification.read && styles.titleUnread,
                    ]}
                  >
                    {notification.title}
                  </Text>
                  {!notification.read ? (
                    <View style={[styles.unreadPip, { backgroundColor: accent }]} />
                  ) : null}
                </View>
                <Text style={styles.body}>{notification.body}</Text>
                <Text style={[styles.time, { color: accent }]}>
                  {formatDateTime(notification.createdAt)}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  markAll: {
    color: colors.primary,
    fontSize: typography.bodySmall,
    fontWeight: "700",
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.bodySmall,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
  emptyWrap: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: "700",
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardUnread: {
    borderColor: colors.borderFocus,
    backgroundColor: colors.primarySoft,
  },
  pressed: { opacity: 0.6, transform: [{ scale: 0.99 }] },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "600",
    flex: 1,
  },
  titleUnread: { color: colors.text, fontWeight: "700" },
  unreadPip: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  body: { color: colors.textMuted, fontSize: typography.bodySmall, marginTop: spacing.sm },
  time: { marginTop: spacing.sm, fontSize: typography.caption, fontWeight: "600" },
});