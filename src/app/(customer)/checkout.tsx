import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Header from "../../components/common/Header";
import Input from "../../components/common/Input";
import LoadingState from "../../components/common/LoadingState";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { radius } from "../../constants/sizes";
import { shadows } from "../../constants/shadows";
import { fontFamily, fontSize } from "../../constants/typography";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useUserProfile } from "../../hooks/useUserProfile";
import { submitOrder } from "../../services/orderService";
import { supabase } from "../../lib/supabase";
import { getAddresses } from "../../services/addressService";
import type { Database } from "../../types/database";
import { formatCurrency } from "../../utils/currency";
import { normalizeError } from "../../utils/errorHandling";

type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

export default function CheckoutScreen() {
  const { items, summary, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const { profile, isProfileComplete, loading: profileLoading } = useUserProfile();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectedRef = useRef(false);

  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);

  const savedAddress =
    addresses.find((entry) => entry.id === selectedAddressId) ??
    addresses[0] ??
    null;

  // Reload the saved addresses whenever the screen regains focus so that a
  // freshly saved address (from /address/edit) is picked up before ordering.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setAddressLoading(true);

      (async () => {
        try {
          const { data: authData } = await supabase.auth.getUser();
          const userId = authData?.user?.id ?? user?.id ?? null;

          if (!userId) {
            if (active) {
              setAddresses([]);
              setSelectedAddressId(null);
              setAddressLoading(false);
            }
            return;
          }

          const list = await getAddresses(userId);
          if (active) {
            setAddresses(list);
            setSelectedAddressId((current) => current ?? list[0]?.id ?? null);
            setAddressLoading(false);
          }
        } catch (err) {
          console.error("Failed to load saved addresses:", err);
          if (active) {
            setAddresses([]);
            setSelectedAddressId(null);
            setAddressLoading(false);
          }
        }
      })();

      return () => {
        active = false;
      };
    }, [user])
  );

  // Smart order-flow guard:
  // If the user has no saved address, or their profile is missing the phone
  // number / full name, send them directly to the address setup screen
  // (bypassing any intermediate pages such as the standalone profile screen).
  useEffect(() => {
    if (
      !addressLoading &&
      !profileLoading &&
      !redirectedRef.current
    ) {
      const missingAddress = !savedAddress;
      const incompleteProfile = !isProfileComplete;

      if (missingAddress || incompleteProfile) {
        redirectedRef.current = true;
        router.replace({
          pathname: "/(customer)/address/edit",
          params: { reason: "address_required" },
        });
      }
    }
  }, [addressLoading, profileLoading, savedAddress, isProfileComplete]);

  const submitWithAddress = useCallback(
    async (addressId: string) => {
      if (!items.length || submitting) return;
      setSubmitting(true);
      setError(null);
      setShowAddressModal(false);
      try {
        await submitOrder({
          customerId: user?.id ?? profile?.id ?? "",
          addressId,
        });
        router.replace("/(customer)/(tabs)/orders");
      } catch (nextError) {
        setError(normalizeError(nextError).message);
        setSubmitting(false);
      }
    },
    [items.length, submitting, user, profile],
  );

  const handleSubmit = async () => {
    if (!items.length || submitting) return;
    if (!savedAddress) {
      Alert.alert(
        "Delivery Address Required",
        "Please save your delivery address before placing an order.",
        [
          {
            text: "Add Address",
            onPress: () =>
              router.replace({
                pathname: "/(customer)/address/edit",
                params: { reason: "address_required" },
              }),
          },
        ]
      );
      return;
    }

    // With more than one saved address, ask the customer which one to deliver to.
    if (addresses.length > 1) {
      setShowAddressModal(true);
      return;
    }

    await submitWithAddress(savedAddress.id);
  };

  // 1. Show ActivityIndicator while profile/address verification is in progress
  if (profileLoading || addressLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Checkout" onBack={() => router.back()} />
        <View style={styles.centerContainer} accessibilityRole="progressbar">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {profileLoading
              ? "Verifying profile requirements..."
              : "Checking delivery details..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Prevent UI flash while redirected to add delivery details
  if (!isProfileComplete || !savedAddress) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Checkout" onBack={() => router.back()} />
        <View style={styles.centerContainer} accessibilityRole="progressbar">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Redirecting to add delivery details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 3. Cart loading state
  if (cartLoading) return <LoadingState label="Loading checkout" />;

  // 4. Empty cart state
  if (!items.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Checkout" onBack={() => router.back()} />
        <EmptyState
          title="Your cart is empty"
          message="Add a medicine before checking out."
          actionLabel="Browse products"
          onAction={() => router.replace("/(customer)/(tabs)/products")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Checkout" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <Input
          label="Customer name"
          value={profile?.fullName ?? user?.name ?? "Customer"}
          editable={false}
        />

        <View style={styles.addressBox}>
          <Text style={styles.sectionTitle}>Delivery address</Text>
          <Text style={styles.addressLabel}>{savedAddress.label}</Text>
          <Text style={styles.addressText}>Phone: {savedAddress.phone}</Text>
          <Text style={styles.addressText}>
            {savedAddress.upazila}, {savedAddress.district},{" "}
            {savedAddress.division}
          </Text>
          {savedAddress.comment ? (
            <Text style={styles.addressText}>{savedAddress.comment}</Text>
          ) : null}
          <Button
            title="Change address"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/(customer)/address/edit",
                params: { reason: "address_required" },
              })
            }
            fullWidth
          />
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.sectionTitle}>Order summary</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text>{item.product.name}</Text>
              <Text>
                {item.quantity} x {formatCurrency(item.product.price)}
              </Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(summary.subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Discount</Text>
            <Text>-{formatCurrency(summary.discount)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Delivery</Text>
            <Text>{formatCurrency(summary.deliveryFee)}</Text>
          </View>
          <View style={[styles.row, styles.total]}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalText}>
              {formatCurrency(summary.total)}
            </Text>
          </View>
        </View>

        <View style={styles.paymentBox}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <Text style={styles.paymentMethod}>Cash on Delivery</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title="Place order"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!savedAddress}
          fullWidth
        />
      </ScrollView>

      {/* Address selection: shown when the customer has more than one saved
          address so they can pick the delivery destination for this order. */}
      <RNModal
        visible={showAddressModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddressModal(false)}
        accessibilityViewIsModal
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowAddressModal(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Select a delivery address
            </Text>
            <ScrollView style={styles.modalList}>
              {addresses.map((address) => {
                const selected = address.id === selectedAddressId;
                return (
                  <Pressable
                    key={address.id}
                    style={[
                      styles.addressOption,
                      selected && styles.addressOptionSelected,
                    ]}
                    onPress={() => submitWithAddress(address.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Deliver to ${address.label}`}
                  >
                    <Text style={styles.addressOptionLabel}>
                      {address.label}
                      {selected ? "  •" : ""}
                    </Text>
                    <Text style={styles.addressOptionText}>
                      Phone: {address.phone}
                    </Text>
                    <Text style={styles.addressOptionText}>
                      {address.upazila}, {address.district}, {address.division}
                    </Text>
                    {address.comment ? (
                      <Text style={styles.addressOptionMuted}>
                        {address.comment}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setShowAddressModal(false)}
              fullWidth
            />
          </View>
        </Pressable>
      </RNModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  summaryBox: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.xs,
  },
  addressBox: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.xs,
  },
  addressLabel: {
    color: colors.text,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.body,
  },
  addressText: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.bodySmall,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.title3,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  total: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  totalText: {
    color: colors.text,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.body,
  },
  paymentBox: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.xs,
  },
  paymentMethod: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.bodySmall,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.bodySmall,
    textAlign: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.footnote,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  modalList: {
    maxHeight: 360,
  },
  addressOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xxs,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  addressOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  addressOptionLabel: {
    color: colors.text,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.body,
  },
  addressOptionText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.bodySmall,
  },
  addressOptionMuted: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.bodySmall,
  },
});