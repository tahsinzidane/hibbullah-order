import { useCallback, useEffect, useState } from "react";
import { isBackendReady } from "../lib/env";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from "../services/notificationService";
import type { NotificationItem } from "../types/notification";
import { normalizeError } from "../utils/errorHandling";
import { useAuth } from "./useAuth";

export function useNotifications() {
  const { session } = useAuth();
  const userId = session?.userId ?? null;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      const [items, unread] = await Promise.all([
        getNotifications(userId),
        getUnreadCount(userId),
      ]);
      setNotifications(items);
      setUnreadCount(unread);
    } catch (err) {
      setError(normalizeError(err).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load + realtime keep the bell badge fresh without polling.
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId || !isBackendReady()) return;
    const unsubscribe = subscribeToNotifications(userId, () => {
      refresh().catch(() => {
        // Realtime refetch is best-effort; the next screen visit re-syncs.
      });
    });
    return unsubscribe;
  }, [refresh, userId]);

  const markRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, read: true } : entry)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await markNotificationRead(id);
      } catch (err) {
        console.warn("[notifications] Failed to mark as read:", err);
        refresh();
      }
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    const previous = notifications;
    setNotifications((prev) => prev.map((entry) => ({ ...entry, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead(userId ?? undefined);
    } catch (err) {
      console.warn("[notifications] Failed to mark all as read:", err);
      setNotifications(previous);
      refresh();
    }
  }, [notifications, refresh, userId]);

  return {
    notifications,
    unreadCount,
    hasUnread: unreadCount > 0,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  };
}