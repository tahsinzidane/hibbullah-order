import { isBackendReady } from "../lib/env";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import { fetchUserProfile } from "./profileService";

type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

export type SaveAddressInput = {
  userId: string;
  userEmail?: string | null;
  label: string;
  phone: string;
  comment?: string | null;
  division: string;
  district: string;
  upazila: string;
};

export type DeliveryDetailsStatus = {
  hasAddress: boolean;
  hasPhone: boolean;
  hasFullName: boolean;
  /** True when the user can place an order without re-entering details. */
  ready: boolean;
};

export async function getAddresses(userId: string): Promise<AddressRow[]> {
  if (!userId) return [];

  if (!isBackendReady()) {
    throw new Error("Backend is not configured to load addresses.");
  }

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function saveAddress(input: SaveAddressInput): Promise<AddressRow> {
  if (!isBackendReady()) {
    throw new Error("Backend is not configured to save addresses.");
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: input.userId,
      user_email: input.userEmail ?? null,
      label: input.label,
      phone: input.phone,
      comment: input.comment ?? null,
      division: input.division,
      district: input.district,
      upazila: input.upazila,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

/**
 * Checks whether the user has everything needed to place an order directly:
 * a saved delivery address plus a phone number and full name (from the
 * address row and/or the user profile). Used by the order-flow redirection
 * guard to decide between checkout and the address/edit setup screen.
 */
export async function getDeliveryDetailsStatus(
  userId: string,
): Promise<DeliveryDetailsStatus> {
  if (!userId) {
    return { hasAddress: false, hasPhone: false, hasFullName: false, ready: false };
  }

  let address: AddressRow | null = null;
  try {
    const addresses = await getAddresses(userId);
    address = addresses[0] ?? null;
  } catch {
    address = null;
  }

  let profile: Awaited<ReturnType<typeof fetchUserProfile>> = null;
  try {
    profile = await fetchUserProfile(userId);
  } catch {
    profile = null;
  }

  const fullName = profile?.fullName ?? null;
  const phone = address?.phone ?? profile?.phoneNumber ?? null;

  const hasAddress = Boolean(address);
  const hasPhone = Boolean(phone && phone.trim().length > 0);
  const hasFullName = Boolean(fullName && fullName.trim().length > 0);

  return {
    hasAddress,
    hasPhone,
    hasFullName,
    ready: hasAddress && hasPhone && hasFullName,
  };
}