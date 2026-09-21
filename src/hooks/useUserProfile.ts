import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { fetchUserProfile, updateUserProfile } from "../services/profileService";
import type {
  RequiredProfileField,
  UpdateUserProfileInput,
  UserProfile,
} from "../types/user";
import { useAuth } from "./useAuth";

export interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isProfileComplete: boolean;
  missingFields: RequiredProfileField[];
  refetch: () => Promise<void>;
  updateProfile: (input: UpdateUserProfileInput) => Promise<UserProfile>;
}

/**
 * Checks if all required profile fields are present, non-null, and non-empty.
 * Mandatory fields: full_name, phone_number.
 */
export function evaluateProfileCompleteness(
  profile: UserProfile | null
): { isComplete: boolean; missingFields: RequiredProfileField[] } {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: ["full_name", "phone_number"],
    };
  }

  const missingFields: RequiredProfileField[] = [];

  const hasFullName =
    typeof profile.fullName === "string" && profile.fullName.trim().length > 0;
  if (!hasFullName) {
    missingFields.push("full_name");
  }

  const hasPhoneNumber =
    typeof profile.phoneNumber === "string" && profile.phoneNumber.trim().length > 0;
  if (!hasPhoneNumber) {
    missingFields.push("phone_number");
  }

  const isComplete =
    hasFullName && hasPhoneNumber;

  return { isComplete, missingFields };
}

/**
 * Custom hook to fetch, evaluate completeness, and update user profile in Supabase.
 * Uses `supabase.auth.getUser()` to resolve the authenticated user, then queries the
 * `profiles` table for `full_name`, `phone_number`, and `shipping_address`.
 */
export function useUserProfile(): UseUserProfileReturn {
  const { user: authUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch current authenticated user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.warn("[useUserProfile] supabase.auth.getUser error:", authError.message);
      }

      // Resolve user id from Supabase auth session or fallback context user (for mock sessions)
      const currentUserId = authData?.user?.id ?? authUser?.id;

      if (!currentUserId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // 2. Query profiles table for full_name, phone_number, and shipping_address
      const profileData = await fetchUserProfile(currentUserId);
      setProfile(profileData);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load user profile.";
      console.error("[useUserProfile] loadProfile error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const currentUserId = authData?.user?.id ?? authUser?.id;

        if (!currentUserId) {
          if (isMounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const profileData = await fetchUserProfile(currentUserId);
        if (isMounted) {
          setProfile(profileData);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Failed to load user profile.";
          setError(message);
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      isMounted = false;
    };
  }, [authUser?.id]);

  // Evaluate profile completeness
  const { isComplete: isProfileComplete, missingFields } = useMemo(
    () => evaluateProfileCompleteness(profile),
    [profile]
  );

  const handleUpdateProfile = useCallback(
    async (input: UpdateUserProfileInput): Promise<UserProfile> => {
      // Determine active user ID
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id ?? authUser?.id;

      if (!currentUserId) {
        throw new Error("Cannot update profile: No active user session.");
      }

      const updated = await updateUserProfile(currentUserId, input);
      setProfile(updated);

      // Sync auth context if present
      if (refreshUser) {
        try {
          await refreshUser();
        } catch {
          // Non-fatal
        }
      }

      return updated;
    },
    [authUser?.id, refreshUser]
  );

  return {
    profile,
    loading,
    error,
    isProfileComplete,
    missingFields,
    refetch: loadProfile,
    updateProfile: handleUpdateProfile,
  };
}
