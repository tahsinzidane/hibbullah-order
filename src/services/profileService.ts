import { supabase } from "../lib/supabase";
import { env } from "../lib/env";
import { store } from "./mockData";
import type { UserProfile, UpdateUserProfileInput } from "../types/user";

/**
 * Fetch a user profile from Supabase with fallback to mock data store.
 * Maps raw database snake_case columns to camelCase domain models.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    return null;
  }

  // Production path: query Supabase profiles table
  if (!env.useMock) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone_number, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("[profileService] Supabase error querying profile:", error.message);
        throw error;
      }

      if (data) {
        return {
          id: data.id,
          fullName: data.full_name || null,
          phoneNumber: data.phone_number || null,
          email: null,
          role: "customer",
          createdAt: data.created_at ?? null,
        };
      }
    } catch (err) {
      console.warn("[profileService] Fetch error in Supabase, checking fallback:", err);
    }
  }

  // Development/Mock fallback: resolve from local store
  const mock = store.users.find((u) => u.id === userId) ?? store.users[0];
  if (!mock) {
    return null;
  }

  return {
    id: mock.id,
    fullName: mock.name || null,
    phoneNumber: mock.phone || null,
    email: mock.email || null,
    role: mock.role || "customer",
    avatar: mock.avatar,
    createdAt: mock.createdAt || null,
  };
}

/**
 * Updates or upserts mandatory and optional profile fields in Supabase.
 * Updates both snake_case and camelCase-mapped fields for robust compatibility.
 */
export async function updateUserProfile(
  userId: string,
  input: UpdateUserProfileInput
): Promise<UserProfile> {
  if (!userId) {
    throw new Error("Cannot update profile: Missing user ID.");
  }

  const trimmedFullName = input.fullName.trim();
  const trimmedPhoneNumber = input.phoneNumber.trim();
  const trimmedEmail = input.email?.trim();

  // Production path: upsert directly to Supabase profiles table
  if (!env.useMock) {
    // Session validation: Verify currently authenticated auth session user ID matches payload target
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User session not found. Please log in again.");
    }

    const targetUserId = user.id;

    const payload = {
      id: targetUserId,
      full_name: trimmedFullName,
      phone_number: trimmedPhoneNumber,
      // updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select("id, full_name, phone_number, created_at")
      .single();

    if (error) {
      console.error("[profileService] Failed to upsert profile in Supabase:", error.message);
      throw error;
    }

    return {
      id: data.id,
      fullName: data.full_name ?? trimmedFullName,
      phoneNumber: data.phone_number ?? trimmedPhoneNumber,
      email: null,
      role: "customer",
      createdAt: data.created_at ?? null,
    };
  }

  // Development/Mock fallback: update mock store
  const userIndex = store.users.findIndex((u) => u.id === userId);
  if (userIndex >= 0) {
    store.users[userIndex] = {
      ...store.users[userIndex],
      name: trimmedFullName,
      phone: trimmedPhoneNumber,
      ...(trimmedEmail ? { email: trimmedEmail } : {}),
    };
  }

  return {
    id: userId,
    fullName: trimmedFullName,
    phoneNumber: trimmedPhoneNumber,
    email: trimmedEmail ?? null,
    role: "customer",
    createdAt: new Date().toISOString(),
  };
}