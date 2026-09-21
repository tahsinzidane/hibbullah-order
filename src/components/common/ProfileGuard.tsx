import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import colors from "../../constants/colors";
import spacing from "../../constants/spacing";
import typography from "../../constants/typography";
import { useUserProfile } from "../../hooks/useUserProfile";

export interface ProfileGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAlert?: boolean;
}

/**
 * Reusable client-side navigation guard component.
 * Verifies that the user's mandatory profile information (full_name, phone_number,
 * shipping_address) is complete in Supabase before rendering children.
 * If incomplete, redirects to the Profile screen with `{ error: 'please_complete_profile' }`.
 */
export default function ProfileGuard({
  children,
  fallback,
  showAlert = true,
}: ProfileGuardProps) {
  const { isProfileComplete, loading } = useUserProfile();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!loading && !isProfileComplete && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;

      if (showAlert) {
        Alert.alert(
          "Profile Incomplete",
          "Mandatory profile details (full name, phone number, and shipping address) are required before continuing.",
          [{ text: "Complete Profile" }]
        );
      }

      router.replace({
        pathname: "/(customer)/account/profile",
        params: { error: "please_complete_profile" },
      });
    }
  }, [loading, isProfileComplete, showAlert]);

  // While checking Supabase profile data, show an ActivityIndicator
  if (loading) {
    if (fallback) return <>{fallback}</>;
    return (
      <View
        style={styles.loadingContainer}
        accessibilityRole="progressbar"
        accessibilityLabel="Checking profile status"
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Verifying profile requirements...</Text>
      </View>
    );
  }

  // Prevent flash of guarded content while redirection is occurring
  if (!isProfileComplete) {
    return (
      <View
        style={styles.loadingContainer}
        accessibilityRole="progressbar"
        accessibilityLabel="Redirecting to profile"
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Redirecting to complete profile...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: typography.footnote,
  },
});
