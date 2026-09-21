import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import Header from "../../../components/common/Header";
import LoadingState from "../../../components/common/LoadingState";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { useAuth } from "../../../hooks/useAuth";
import { supabase } from "../../../lib/supabase";
import { getAddresses } from "../../../services/addressService";
import type { Database } from "../../../types/database";

type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

export default function CustomerAddressesScreen() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);

      (async () => {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id ?? user?.id ?? null;
        let list: AddressRow[] = [];
        if (userId) {
          try {
            list = await getAddresses(userId);
          } catch (err) {
            console.error("Failed to load addresses:", err);
          }
        }
        if (active) {
          setAddresses(list);
          setLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  if (loading) return <LoadingState label="Loading addresses..." />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Addresses" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        {addresses.length === 0 ? (
          <EmptyState
            title="No saved addresses"
            message="Add a delivery address so you can place orders easily."
          />
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.card}>
              <Text style={styles.label}>{address.label}</Text>
              <Text style={styles.text}>{address.phone}</Text>
              <Text style={styles.text}>
                {address.upazila}, {address.district}, {address.division}
              </Text>
              {address.comment ? (
                <Text style={styles.text}>{address.comment}</Text>
              ) : null}
            </View>
          ))
        )}
        <Button
          title="Add address"
          onPress={() => router.push("/(customer)/address/edit")}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.backgroundAlt, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  label: { color: colors.text, fontSize: typography.body, fontWeight: '700', marginBottom: spacing.xs },
  text: { color: colors.textMuted, fontSize: typography.bodySmall },
});