import { isBackendReady } from "../lib/env";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import type { DeliveryCycle, DeliveryCycleStatus } from "../types/deliveryCycle";

type DeliveryCycleRow = Database["public"]["Tables"]["delivery_cycles"]["Row"];

/**
 * Fetches the active delivery cycle for a customer from Supabase.
 *
 * The delivery_cycles table is still optional in the backend; when it is
 * missing (or empty / not permitted), this resolves to null so screens can
 * render a graceful "no active cycle" state instead of crashing.
 */
export async function getActiveDeliveryCycle(
  customerId?: string | null,
): Promise<DeliveryCycle | null> {
  if (!customerId) return null;
  if (!isBackendReady()) return null;

  try {
    const { data, error } = await supabase
      .from("delivery_cycles")
      .select("*")
      .eq("customer_id", customerId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return mapDeliveryCycle(data);
  } catch {
    return null;
  }
}

function mapDeliveryCycle(data: DeliveryCycleRow): DeliveryCycle {
  return {
    id: data.id,
    customerId: data.customer_id,
    status: data.status as DeliveryCycleStatus,
    startedAt: data.started_at,
    closesAt: data.closes_at,
    // The product list / estimate are not backed by the table yet.
    estimatedTotal: 0,
    products: [],
  };
}