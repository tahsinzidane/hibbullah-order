import config from "../constants/config";
import { isBackendReady } from "../lib/env";
import { supabase } from "../lib/supabase";
import type { CartItem } from "../types/cart";
import type { Database } from "../types/database";
import type { NotificationType } from "../types/notification";
import type { Order, OrderItem, OrderStatus } from "../types/order";
import { formatCurrency } from "../utils/currency";
import { clearCart, getCartItems, summarizeCart } from "./cartService";
import {
  createNotification,
  notifyAdmins,
  safeNotify,
} from "./notificationService";
import { fetchUserProfile } from "./profileService";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

export type SubmitOrderInput = {
  customerId: string;
  addressId: string;
};

function requireBackend(): void {
  if (!isBackendReady()) {
    throw new Error(
      "Backend is not configured. Order features require Supabase.",
    );
  }
}

function buildAddressText(address: AddressRow): string {
  const location = [address.upazila, address.district, address.division]
    .filter(Boolean)
    .join(", ");
  return address.phone ? `${location} — ${address.phone}` : location;
}

async function getCurrentAuthUserEmail(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

async function fetchOrderItemRows(orderIds: string[]): Promise<OrderItemRow[]> {
  if (!orderIds.length) return [];
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function fetchAddresses(addressIds: string[]): Promise<AddressRow[]> {
  const unique = [...new Set(addressIds.filter(Boolean))];
  if (!unique.length) return [];
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .in("id", unique);
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function buildItems(orderItemRows: OrderItemRow[]): Promise<OrderItem[]> {
  if (!orderItemRows.length) return [];

  const productIds = [...new Set(orderItemRows.map((row) => row.product_id))];
  const productNames: Record<string, string> = {};

  if (productIds.length) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds);
    if (!error && data) {
      for (const product of data) productNames[product.id] = product.name;
    }
  }

  return orderItemRows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    productName: productNames[row.product_id] ?? "Product unavailable",
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    discountPercent: Number(row.discount_percent) || 0,
    total: Number(row.total),
  }));
}

type OrderContext = {
  address?: AddressRow;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
};

function mapOrder(orderRow: OrderRow, items: OrderItem[], ctx: OrderContext): Order {
  return {
    id: orderRow.id,
    orderNumber: orderRow.order_number,
    customerId: orderRow.customer_id,
    customerName: ctx.customerName,
    customerEmail: ctx.customerEmail ?? null,
    customerPhone: ctx.customerPhone ?? ctx.address?.phone ?? null,
    addressLabel: ctx.address?.label,
    createdAt: orderRow.created_at,
    status: orderRow.status as OrderStatus,
    subtotal: Number(orderRow.subtotal),
    discount: Number(orderRow.discount),
    deliveryFee: Number(orderRow.delivery_fee),
    total: Number(orderRow.total),
    paymentMethod: orderRow.payment_method,
    address: ctx.address ? buildAddressText(ctx.address) : "",
    phone: ctx.address?.phone ?? ctx.customerPhone ?? null,
    comment: ctx.address?.comment ?? null, // addresses table theke comment pass kora hochhe
    items,
  };
}

async function buildItemsForOrders(
  orderRows: OrderRow[],
): Promise<Map<string, OrderItem[]>> {
  const itemRows = await fetchOrderItemRows(orderRows.map((row) => row.id));
  const itemsByOrder = new Map<string, OrderItemRow[]>();
  for (const row of itemRows) {
    const bucket = itemsByOrder.get(row.order_id) ?? [];
    bucket.push(row);
    itemsByOrder.set(row.order_id, bucket);
  }

  const itemsByOrderDomain = new Map<string, OrderItem[]>();
  for (const [orderId, rows] of itemsByOrder) {
    itemsByOrderDomain.set(orderId, await buildItems(rows));
  }
  return itemsByOrderDomain;
}

type ProfileBrief = {
  fullName: string | null;
  phoneNumber: string | null;
};

async function fetchProfilesByIds(userIds: string[]): Promise<Map<string, ProfileBrief>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const profilesById = new Map<string, ProfileBrief>();
  if (!unique.length) return profilesById;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone_number")
    .in("id", unique);

  if (error) return profilesById;

  for (const row of data ?? []) {
    profilesById.set(row.id, {
      fullName: row.full_name,
      phoneNumber: row.phone_number,
    });
  }
  return profilesById;
}

export async function getOrders(customerId: string): Promise<Order[]> {
  requireBackend();
  if (!customerId) throw new Error("Please sign in to view your orders.");

  const { data: orderRows, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = orderRows ?? [];
  if (!rows.length) return [];

  const [itemsByOrder, addressById, profile, email] = await Promise.all([
    buildItemsForOrders(rows),
    fetchAddresses(rows.map((row) => row.address_id ?? "")).then((result) =>
      new Map(result.map((address) => [address.id, address])),
    ),
    fetchUserProfile(customerId),
    getCurrentAuthUserEmail(),
  ]);

  return rows.map((row) =>
    mapOrder(row, itemsByOrder.get(row.id) ?? [], {
      address: row.address_id ? addressById.get(row.address_id) : undefined,
      customerName: profile?.fullName ?? "Customer",
      customerPhone: profile?.phoneNumber ?? undefined,
      customerEmail: profile?.email ?? email ?? undefined,
    }),
  );
}

export async function getAllOrders(status?: OrderStatus): Promise<Order[]> {
  requireBackend();

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: orderRows, error } = await query;
  if (error) throw new Error(error.message);

  const rows = orderRows ?? [];
  if (!rows.length) return [];

  const [itemsByOrder, addressById, profilesById, email] = await Promise.all([
    buildItemsForOrders(rows),
    fetchAddresses(rows.map((row) => row.address_id ?? "")).then((result) =>
      new Map(result.map((address) => [address.id, address])),
    ),
    fetchProfilesByIds(rows.map((row) => row.customer_id)),
    getCurrentAuthUserEmail(),
  ]);

  return rows.map((row) => {
    const profile = profilesById.get(row.customer_id);
    return mapOrder(row, itemsByOrder.get(row.id) ?? [], {
      address: row.address_id ? addressById.get(row.address_id) : undefined,
      customerName: profile?.fullName ?? "Customer",
      customerPhone: profile?.phoneNumber ?? undefined,
      customerEmail: email ?? undefined,
    });
  });
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  requireBackend();
  if (!orderId) return undefined;

  const { data: orderRow, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!orderRow) return undefined;

  const [items, addresses, profile, email] = await Promise.all([
    buildItems(await fetchOrderItemRows([orderRow.id])),
    orderRow.address_id
      ? fetchAddresses([orderRow.address_id])
      : Promise.resolve([]),
    fetchUserProfile(orderRow.customer_id),
    getCurrentAuthUserEmail(),
  ]);

  return mapOrder(orderRow, items, {
    address: addresses[0],
    customerName: profile?.fullName ?? "Customer",
    customerPhone: profile?.phoneNumber ?? undefined,
    customerEmail: profile?.email ?? email ?? undefined,
  });
}

type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];
type OrderItemUpdate = Database["public"]["Tables"]["order_items"]["Update"];
type OrderItemInsertValues = Omit<OrderItemInsert, "id">;

function buildOrderItemValues(
  item: CartItem,
  orderId: string,
): OrderItemInsertValues {
  const effectivePrice = item.unitPrice ?? item.product.price;
  const original = item.product.originalPrice ?? item.product.price;
  const discountAmount = Math.max(0, original - effectivePrice);
  const discountPercent =
    original > 0 ? Math.round((discountAmount / original) * 100) : 0;

  return {
    order_id: orderId,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: effectivePrice,
    discount_percent: discountPercent,
    total: effectivePrice * item.quantity,
  };
}

/**
 * Recomputes subtotal, discount, delivery fee, and total for an order from its
 * merged order_items rows. Uses the same money semantics as cartService.summarizeCart
 * so a merged order matches one created fresh (total = subtotal + delivery fee).
 */
async function recomputeOrderTotals(orderId: string): Promise<void> {
  const { data: rows, error: fetchError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  if (fetchError) throw new Error(fetchError.message);

  const itemRows = rows ?? [];
  if (!itemRows.length) return;

  const productIds = [...new Set(itemRows.map((row) => row.product_id))];
  const originalByProduct = new Map<string, number>();
  if (productIds.length) {
    const { data, error } = await supabase
      .from("products")
      .select("id, original_price")
      .in("id", productIds);
    if (!error && data) {
      for (const product of data) {
        if (product.original_price != null) {
          originalByProduct.set(product.id, Number(product.original_price));
        }
      }
    }
  }

  let subtotal = 0;
  let discount = 0;
  for (const row of itemRows) {
    const effective = Number(row.unit_price);
    const original = originalByProduct.get(row.product_id) ?? effective;
    subtotal += effective * row.quantity;
    discount += Math.max(0, original - effective) * row.quantity;
  }
  const deliveryFee = config.deliveryFee;
  const total = subtotal + deliveryFee;

  const { error: updateError } = await supabase
    .from("orders")
    .update({ subtotal, discount, delivery_fee: deliveryFee, total })
    .eq("id", orderId);
  if (updateError) throw new Error(updateError.message);
}

/**
 * Merges the customer's current cart into an existing PENDING order. Items
 * already present on the order have their quantity incremented (and price /
 * discount refreshed); new items are inserted. Order amounts are then
 * recomputed so the stored subtotal / discount / total stay correct.
 */
async function mergeCartIntoOrder(
  orderId: string,
  cartItems: CartItem[],
): Promise<void> {
  const { data: existingRows, error: fetchError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  if (fetchError) throw new Error(fetchError.message);

  const rowsByProduct = new Map<string, OrderItemRow>();
  for (const row of existingRows ?? []) rowsByProduct.set(row.product_id, row);

  const updates: OrderItemUpdate[] = [];
  const inserts: OrderItemInsertValues[] = [];

  for (const item of cartItems) {
    const values = buildOrderItemValues(item, orderId);
    const existing = rowsByProduct.get(item.productId);

    if (existing) {
      const quantity = existing.quantity + item.quantity;
      updates.push({
        id: existing.id,
        quantity,
        unit_price: values.unit_price,
        discount_percent: values.discount_percent,
        total: values.unit_price * quantity,
      });
    } else {
      inserts.push(values);
    }
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("order_items")
      .update(update)
      .eq("id", update.id);
    if (error) throw new Error(error.message);
  }

  if (inserts.length) {
    const { error } = await supabase
      .from("order_items")
      .insert(inserts as OrderItemInsert[]);
    if (error) throw new Error(error.message);
  }

  await recomputeOrderTotals(orderId);
}

export async function submitOrder(input: SubmitOrderInput): Promise<Order> {
  requireBackend();
  if (!input.customerId) throw new Error("Please sign in to place an order.");
  if (!input.addressId) throw new Error("A delivery address is required.");

  const cartItems = await getCartItems();
  if (!cartItems.length) throw new Error("Your cart is empty.");

  // Address-aware merge: reuse an existing PENDING order ONLY when it is
  // already tied to the exact address chosen at checkout (customer_id + PENDING
  // + address_id all match). Otherwise a brand-new order card is created so
  // orders for different delivery addresses stay separate in the admin view.
  const { data: pendingOrder, error: pendingError } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", input.customerId)
    .eq("status", "PENDING")
    .eq("address_id", input.addressId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pendingError) throw new Error(pendingError.message);

  let orderRow = pendingOrder ?? null;

  if (orderRow) {
    // The address already matches by construction, so just merge the new cart
    // items into this order and recompute its amounts.
    await mergeCartIntoOrder(orderRow.id, cartItems);
  } else {
    const summary = summarizeCart(cartItems);

    const { data: createdRow, error: insertError } = await supabase
      .from("orders")
      .insert({
        order_number: `HB-${Date.now()}`,
        customer_id: input.customerId,
        delivery_cycle_id: null,
        status: "PENDING",
        subtotal: summary.subtotal,
        discount: summary.discount,
        delivery_fee: summary.deliveryFee,
        total: summary.total,
        payment_method: "CASH_ON_DELIVERY",
        address_id: input.addressId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);
    orderRow = createdRow;

    const itemRows = cartItems.map((item) => buildOrderItemValues(item, orderRow.id));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemRows);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", orderRow.id);
      throw new Error(itemsError.message);
    }
  }

  await clearCart();

  const order = await getOrderById(orderRow.id);
  if (!order) throw new Error("Order was created but could not be loaded.");

  // Admin notification for the new order (best-effort; never blocks checkout).
  await safeNotify(() =>
    notifyAdmins({
      type: "info",
      title: "New order",
      body: `${order.customerName} placed a new order ${order.orderNumber} for ${formatCurrency(order.total)}.`,
    }),
  );

  return order;
}

/**
 * Best-effort customer notification whenever an order transitions to a
 * customer-visible state (confirmed, processing, shipped, delivered, cancelled).
 */
async function notifyCustomerOrderChange(order: Order): Promise<void> {
  const prompts: Partial<
    Record<OrderStatus, { type: NotificationType; title: string; body: string }>
  > = {
    CONFIRMED: {
      type: "success",
      title: "Order confirmed",
      body: `Your order ${order.orderNumber} has been confirmed and is being prepared.`,
    },
    PROCESSING: {
      type: "info",
      title: "Order processing",
      body: `Your order ${order.orderNumber} is now being processed.`,
    },
    OUT_FOR_DELIVERY: {
      type: "info",
      title: "Order shipped",
      body: `Your order ${order.orderNumber} is out for delivery.`,
    },
    DELIVERED: {
      type: "success",
      title: "Order delivered",
      body: `Your order ${order.orderNumber} has been delivered.`,
    },
    CANCELLED: {
      type: "warning",
      title: "Order cancelled",
      body: `Your order ${order.orderNumber} has been cancelled.`,
    },
  };

  const prompt = prompts[order.status];
  if (!prompt) return;
  await createNotification({
    userId: order.customerId,
    type: prompt.type,
    title: prompt.title,
    body: prompt.body,
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  requireBackend();
  if (!orderId) throw new Error("Order not found.");

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select();

  if (error) throw new Error(error.message);

  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");

  await safeNotify(() => notifyCustomerOrderChange(order));
  return order;
}

/**
 * Customer-initiated cancellation. Only PENDING orders can be cancelled from
 * the customer order page. Notifies every admin about the cancellation event.
 */
export async function cancelOrderByCustomer(orderId: string): Promise<Order> {
  requireBackend();
  if (!orderId) throw new Error("Order not found.");

  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found.");
  if (order.status !== "PENDING") {
    throw new Error("Only pending orders can be cancelled.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "CANCELLED" })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  await safeNotify(() =>
    notifyAdmins({
      type: "warning",
      title: "Order cancelled by customer",
      body: `${order.customerName} cancelled order ${order.orderNumber}.`,
    }),
  );

  const updated = await getOrderById(orderId);
  if (!updated) throw new Error("Order not found.");
  return updated;
}