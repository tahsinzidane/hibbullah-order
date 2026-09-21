import config from "../../constants/config";
import { wait } from "../../lib/result";
import { store } from "../mockData";
import { getAllOrders } from "../orderService";
import type { Order } from "../../types/order";

const EXPIRY_WINDOW_DAYS = 90;

// Thin wrapper so the dashboard never crashes the screen when the live order
// query fails (e.g. backend not ready); it degrades to an empty order set.
async function loadOrdersSafely(): Promise<Order[]> {
  try {
    return await getAllOrders();
  } catch {
    return [];
  }
}

// Single aggregation point for the admin dashboard. Order metrics and order
// snapshots come straight from Supabase via orderService; the remaining
// aggregates still derive from the existing mock store.
export async function getAdminDashboard() {
  await wait();

  const allOrders = await loadOrdersSafely();
  const pendingOrders = allOrders.filter(
    (order) => order.status === "PENDING",
  );
  const processingOrders = allOrders.filter(
    (order) => order.status === "PROCESSING",
  );
  const activeProducts = store.products.filter((product) => product.isActive);
  const lowStockProducts = store.products.filter(
    (product) => product.stock < config.lowStockThreshold,
  );

  const lowStockBatches = store.inventory
    .filter((item) => item.status !== "healthy")
    .slice(0, 4);

  const expiringBatches = store.inventory
    .filter((item) => {
      if (!item.expiryDate) return false;
      const within = Date.now() + EXPIRY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
      return new Date(item.expiryDate).getTime() <= within;
    })
    .slice(0, 4);

  return {
    pendingOrders: pendingOrders.length,
    processingOrders: processingOrders.length,
    activeProducts: activeProducts.length,
    lowStockProducts: lowStockProducts.length,
    attentionOrders: pendingOrders.slice(0, 3),
    pendingReturns: store.returns
      .filter((entry) => entry.status === "PENDING")
      .slice(0, 2),
    lowStockBatches,
    expiringBatches,
    recentOrders: allOrders.slice(0, 5),
    recentActivity: store.audit.slice(0, 4),
  };
}