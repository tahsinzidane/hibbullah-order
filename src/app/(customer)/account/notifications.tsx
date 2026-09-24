import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/common/Header";
import LoadingState from "../../../components/common/LoadingState";
import { colors } from "../../../constants/colors";
import { spacing } from "../../../constants/spacing";
import { radius } from "../../../constants/sizes";
import { shadows } from "../../../constants/shadows";
import { fontFamily, fontSize } from "../../../constants/typography";
import { useNotifications } from "../../../hooks/useNotifications";
import { usePressFeedback } from "../../../lib/motion";
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
  const feedback = usePressFeedback();

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
                  feedback(pressed),
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
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.bodySmall,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fontFamily.pjsMedium,
    fontSize: fontSize.bodySmall,
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
    fontSize: fontSize.title3,
    fontFamily: fontFamily.soraSemiBold,
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: fontSize.bodySmall,
    fontFamily: fontFamily.pjsRegular,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.xs,
  },
  cardUnread: {
    borderColor: colors.borderFocus,
    backgroundColor: colors.primarySoft,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  title: {
    color: colors.textMuted,
    fontSize: fontSize.body,
    fontFamily: fontFamily.pjsMedium,
    flex: 1,
  },
  titleUnread: { color: colors.text, fontFamily: fontFamily.pjsBold },
  unreadPip: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  body: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.bodySmall,
    marginTop: spacing.sm,
  },
  time: {
    marginTop: spacing.sm,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.pjsMedium,
  },
});