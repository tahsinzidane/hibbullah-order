import { isBackendReady } from "../lib/env";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import type { NotificationItem, NotificationType } from "../types/notification";
import { store } from "./mockData";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export type NewNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
};

export type AdminNotificationInput = {
  type: NotificationType;
  title: string;
  body: string;
};

function mapNotificationRow(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    read: row.read,
    type: (row.type as NotificationType) || "info",
  };
}

function mockNow(): string {
  return new Date().toISOString();
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export async function getNotifications(
  userId?: string,
): Promise<NotificationItem[]> {
  if (isBackendReady()) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapNotificationRow);
  }

  // Mock fallback (kept user-id aware when the store entries carry a user_id).
  const all = [...store.notifications];
  if (!userId) return all;
  const scoped = all.filter((entry) =>
    entry.userId !== undefined ? entry.userId === userId : true,
  );
  return scoped;
}

export async function getUnreadCount(userId?: string): Promise<number> {
  if (isBackendReady()) {
    if (!userId) return 0;
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  const items = await getNotifications(userId);
  return items.filter((entry) => !entry.read).length;
}

export async function markNotificationRead(id: string): Promise<void> {
  if (isBackendReady()) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const item = store.notifications.find((entry) => entry.id === id);
  if (item) item.read = true;
}

export async function markAllNotificationsRead(userId?: string): Promise<void> {
  if (isBackendReady()) {
    if (!userId) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    if (error) throw new Error(error.message);
    return;
  }

  const items = await getNotifications(userId);
  for (const item of items) {
    if (!item.read) {
      const entry = store.notifications.find((n) => n.id === item.id);
      if (entry) entry.read = true;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Writes (secure RPC helpers in production, store in mock mode)       */
/* ------------------------------------------------------------------ */

export async function createNotification(input: NewNotificationInput): Promise<void> {
  if (isBackendReady()) {
    const { error } = await supabase.rpc("create_notification", {
      p_user_id: input.userId,
      p_type: input.type,
      p_title: input.title,
      p_body: input.body,
    });
    if (error) throw new Error(error.message);
    return;
  }

  store.notifications.unshift({
    id: `notify-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    userId: input.userId,
    title: input.title,
    body: input.body,
    createdAt: mockNow(),
    read: false,
    type: input.type,
  });
}

export async function notifyAdmins(input: AdminNotificationInput): Promise<void> {
  if (isBackendReady()) {
    const { error } = await supabase.rpc("notify_admins", {
      p_type: input.type,
      p_title: input.title,
      p_body: input.body,
    });
    if (error) throw new Error(error.message);
    return;
  }

  const admins = store.users.filter((user) => user.role === "admin");
  for (const admin of admins) {
    store.notifications.unshift({
      id: `notify-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      userId: admin.id,
      title: input.title,
      body: input.body,
      createdAt: mockNow(),
      read: false,
      type: input.type,
    });
  }
}

/**
 * Dynamic low-stock alert. Production delegates the threshold math to the
 * secure `notify_low_stock` RPC (threshold = ceil(max_stock * 0.2), min 1).
 * Mock mode computes the same rule from the product's reference quantity.
 */
export async function notifyLowStock(
  productId: string,
  options?: { maxStock?: number },
): Promise<void> {
  if (isBackendReady()) {
    const { error } = await supabase.rpc("notify_low_stock", {
      p_product_id: productId,
    });
    if (error) throw new Error(error.message);
    return;
  }

  const product = store.products.find((entry) => entry.id === productId);
  if (!product) return;

  const maxStock = Math.max(1, options?.maxStock ?? product.stock);
  const threshold = Math.max(1, Math.ceil(maxStock * 0.2));
  if (product.stock > threshold) return;

  await notifyAdmins({
    type: "warning",
    title: "Low stock alert",
    body: `${product.name} has only ${product.stock} unit(s) left. Restock to avoid running out (threshold ${threshold}).`,
  });
}

/**
 * Best-effort wrapper for callers that must not fail the primary operation
 * (e.g. order placement) when a notification write fails.
 */
export async function safeNotify(
  operation: () => Promise<void>,
): Promise<void> {
  try {
    await operation();
  } catch (err) {
    console.warn("[notifications] Best-effort notification skipped:", err);
  }
}

/* ------------------------------------------------------------------ */
/* Realtime                                                            */
/* ------------------------------------------------------------------ */

export type NotificationChangeHandler = () => void;

// Guarantee unique channel names: supabase.channel() returns an existing
// channel when the same name is used again, and re-adding a postgres_changes
// listener to an already-subscribed channel throws "cannot add
// `postgres_changes` callbacks for realtime after `subscribe()`". Because the
// bell and the notifications screen can both subscribe for the same user at
// the same time, a per-call suffix keeps every subscription on its own
// channel.
let channelSequence = 0;

/**
 * Subscribes to notification inserts/updates for the given user and returns
 * the unsubscribe function. Mirrors the CartProvider realtime pattern but with
 * a unique channel name per subscription.
 */
export function subscribeToNotifications(
  userId: string,
  onChange: NotificationChangeHandler,
): () => void {
  channelSequence += 1;
  const channelName = `notifications-${userId}-${channelSequence}`;
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}