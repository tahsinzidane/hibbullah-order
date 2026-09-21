import { supabase } from "../../lib/supabase";
import { getAllOrders } from "../orderService";
import type { CustomerRecord } from "../../types/customer";
import type { Order } from "../../types/order";

type ProfileBrief = {
  fullName: string | null;
  phoneNumber: string | null;
};

async function loadOrdersSafely(): Promise<Order[]> {
  try {
    return await getAllOrders();
  } catch {
    return [];
  }
}

async function fetchProfileBriefs(userIds: string[]): Promise<Map<string, ProfileBrief>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, ProfileBrief>();
  if (!unique.length) return map;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone_number")
    .in("id", unique);

  if (error) return map;

  for (const row of data ?? []) {
    map.set(row.id, { fullName: row.full_name, phoneNumber: row.phone_number });
  }
  return map;
}

export async function getCustomers(): Promise<CustomerRecord[]> {
  const orders = await loadOrdersSafely();

  const aggregation = new Map<
    string,
    { orderCount: number; totalSpent: number }
  >();
  const customerIds = new Set<string>();

  for (const order of orders) {
    customerIds.add(order.customerId);
    const agg = aggregation.get(order.customerId) ?? {
      orderCount: 0,
      totalSpent: 0,
    };
    agg.orderCount += 1;
    agg.totalSpent += order.total;
    aggregation.set(order.customerId, agg);
  }

  const profilesById = await fetchProfileBriefs([...customerIds]);

  const customers: CustomerRecord[] = [];
  for (const id of customerIds) {
    const profile = profilesById.get(id);
    const agg = aggregation.get(id) ?? { orderCount: 0, totalSpent: 0 };
    customers.push({
      id,
      name: profile?.fullName ?? "Customer",
      phone: profile?.phoneNumber ?? "",
      status: "active",
      orderCount: agg.orderCount,
      totalSpent: agg.totalSpent,
      dueAmount: 0,
    });
  }

  customers.sort((a, b) => b.totalSpent - a.totalSpent);
  return customers;
}

export async function getCustomerById(
  customerId: string,
): Promise<CustomerRecord | undefined> {
  const customers = await getCustomers();
  return customers.find((customer) => customer.id === customerId);
}