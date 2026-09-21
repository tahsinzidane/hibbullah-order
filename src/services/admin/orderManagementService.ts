import { getAllOrders, getOrderById, updateOrderStatus } from "../orderService";
import type { Order, OrderStatus } from "../../types/order";

export async function getAdminOrders(status?: OrderStatus): Promise<Order[]> {
  return getAllOrders(status);
}

export async function getAdminOrderById(
  orderId: string,
): Promise<Order | undefined> {
  return getOrderById(orderId);
}

export async function confirmOrder(orderId: string): Promise<Order> {
  return updateOrderStatus(orderId, "CONFIRMED");
}

export async function cancelOrder(orderId: string): Promise<Order> {
  return updateOrderStatus(orderId, "CANCELLED");
}