import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Header from "../../../components/common/Header";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import LoadingState from "../../../components/common/LoadingState";
import { colors } from "../../../constants/colors";
import { spacing } from "../../../constants/spacing";
import { radius } from "../../../constants/sizes";
import { fontFamily, fontSize } from "../../../constants/typography";
import { useAuth } from "../../../hooks/useAuth";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { normalizeError } from "../../../utils/errorHandling";

export default function ProfileScreen() {
  const params = useLocalSearchParams<{ error?: string }>();
  const isRedirectedFromCheckout = params.error === "please_complete_profile";

  const { user, refreshUser } = useAuth();
  const {
    profile,
    loading: profileLoading,
    missingFields,
    updateProfile,
    refetch,
  } = useUserProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.fullName ?? "");
      setPhone(profile.phoneNumber ?? "");
      setEmail(profile.email ?? user?.email ?? "");
    } else if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
    }
  }, [profile, user]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      Alert.alert("Validation Error", "Full name is required.");
      return;
    }

    // if (!trimmedPhone) {
    //   Alert.alert("Validation Error", "Phone number is required.");
    //   return;
    // }

    setSaving(true);
    try {
      await updateProfile({
        fullName: trimmedName,
        phoneNumber: trimmedPhone,
        email: email.trim() || undefined,
      });

      if (refreshUser) {
        await refreshUser();
      }

      await refetch();

      if (isRedirectedFromCheckout) {
        Alert.alert(
          "Profile Completed",
          "Your profile has been successfully saved! You can now proceed back to Checkout.",
          [
            {
              text: "Proceed to Checkout",
              onPress: () => router.replace("/(customer)/checkout"),
            },
            {
              text: "Stay on Profile",
              style: "cancel",
            },
          ]
        );
      } else {
        Alert.alert("Success", "Profile updated successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (err: unknown) {
      const normalized = normalizeError(err);
      Alert.alert("Update Failed", normalized.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading && !profile) {
    return <LoadingState label="Loading profile..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Profile" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        {isRedirectedFromCheckout && (
          <View style={styles.warningBanner} accessibilityRole="alert">
            <View style={styles.warningHeader}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningTitle}>Profile Incomplete</Text>
            </View>
            <Text style={styles.warningText}>
              Mandatory profile details are required before accessing Checkout.
              Please complete your Full Name and Phone Number below.
            </Text>
            {missingFields.length > 0 && (
              <View style={styles.missingBadgeContainer}>
                <Text style={styles.missingBadgeLabel}>Missing:</Text>
                {missingFields.map((field) => (
                  <View key={field} style={styles.missingBadge}>
                    <Text style={styles.missingBadgeText}>
                      {field === "full_name"
                        ? "Full Name"
                        : field === "phone_number"
                          ? "Phone Number"
                          : field}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Input
            label="Full name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. John Doe"
          />

          {/* <Input
            label="Phone number *"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="e.g. +8801700000000"
          /> */}

          <Input
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="e.g. user@example.com"
          />
        </View>

        <Button
          title={
            saving
              ? "Saving changes..."
              : isRedirectedFromCheckout
                ? "Save & Proceed to Checkout"
                : "Save changes"
          }
          variant={isRedirectedFromCheckout ? "primary" : "secondary"}
          onPress={handleSave}
          loading={saving}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  warningBanner: {
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  warningIcon: {
    fontSize: fontSize.body,
  },
  warningTitle: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.pjsBold,
    color: colors.warning,
  },
  warningText: {
    fontSize: fontSize.footnote,
    fontFamily: fontFamily.pjsRegular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  missingBadgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  missingBadgeLabel: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.pjsSemiBold,
    color: colors.textSecondary,
  },
  missingBadge: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  missingBadgeText: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.pjsSemiBold,
    color: colors.danger,
  },
  card: { gap: spacing.lg },
});