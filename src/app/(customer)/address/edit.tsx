import React, { useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import Header from "../../../components/common/Header";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import Toast from "../../../components/common/Toast";
import { colors } from "../../../constants/colors";
import { spacing } from "../../../constants/spacing";
import { layout, radius } from "../../../constants/sizes";
import { shadows } from "../../../constants/shadows";
import { fontFamily, fontSize } from "../../../constants/typography";
import { useAuth } from "../../../providers/AuthProvider";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useCart } from "../../../hooks/useCart";
import { supabase } from "../../../lib/supabase";
import { getAddresses, saveAddress } from "../../../services/addressService";
import { submitOrder } from "../../../services/orderService";

// Areas dataset for Bangladesh Division, District and Upazila selections
import locationData from "../../../../areas.json";

interface DistrictData {
  district: string;
  upazilas: string[];
}

interface DivisionData {
  division: string;
  districts: DistrictData[];
}

export default function EditAddressScreen() {
  const params = useLocalSearchParams<{ reason?: string }>();
  const isAddressRequired = params.reason === "address_required";

  const { session, user } = useAuth();
  const { updateProfile } = useUserProfile();
  const { items, refresh } = useCart();

  // Prefill the delivery details from the resolved auth user so repeat orders
  // are quick to submit when only the address itself is missing.
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [label, setLabel] = useState("Home");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [comment, setComment] = useState("");

  // Location selection states
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedUpazila, setSelectedUpazila] = useState("");

  // Filtered dropdown lists
  const [availableDistricts, setAvailableDistricts] = useState<DistrictData[]>([]);
  const [availableUpazilas, setAvailableUpazilas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Success toast feedback for the standalone address management flow.
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigateBackAfterToast = useRef(false);

  const handleToastHide = () => {
    setToastMessage(null);
    if (navigateBackAfterToast.current) {
      navigateBackAfterToast.current = false;
      router.back();
    }
  };

  // Handle Division Selection
  const handleDivisionChange = (divisionName: string) => {
    setSelectedDivision(divisionName);
    setSelectedDistrict("");
    setSelectedUpazila("");
    setAvailableUpazilas([]);

    const matchedDivision = (locationData.divisions as DivisionData[]).find(
      (d) => d.division === divisionName
    );

    if (matchedDivision) {
      setAvailableDistricts(matchedDivision.districts);
    } else {
      setAvailableDistricts([]);
    }
  };

  // Handle District Selection
  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    setSelectedUpazila("");

    const matchedDistrict = availableDistricts.find(
      (d) => d.district === districtName
    );

    if (matchedDistrict) {
      setAvailableUpazilas(matchedDistrict.upazilas);
    } else {
      setAvailableUpazilas([]);
    }
  };

  const handleSave = async () => {
    const trimmedFullName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFullName) {
      Alert.alert("Validation Error", "Full name is required.");
      return;
    }
    if (!trimmedPhone) {
      Alert.alert("Validation Error", "Phone number is required.");
      return;
    }
    if (!selectedDivision || !selectedDistrict || !selectedUpazila) {
      Alert.alert(
        "Validation Error",
        "Please select Division, District, and Upazila."
      );
      return;
    }

    setSaving(true);
    try {
      const { data: authUser } = await supabase.auth.getUser();
      const userId = authUser.user?.id ?? session?.userId ?? null;
      const userEmail = authUser.user?.email ?? session?.email ?? null;

      if (!userId) {
        throw new Error("Please sign in to save your address.");
      }

      // Prevent saving a second address under the same label so the user cannot
      // end up with ambiguous entries like two addresses labelled "Home".
      const existingAddresses = await getAddresses(userId);
      const normalizedLabel = label.trim().toLowerCase();
      const duplicateLabel = existingAddresses.some(
        (address) => address.label.trim().toLowerCase() === normalizedLabel,
      );
      if (duplicateLabel) {
        Alert.alert(
          "Duplicate Label",
          "An address with this label is already saved.",
        );
        return;
      }

      // Persist the profile details so subsequent orders skip this step.
      await updateProfile({
        fullName: trimmedFullName,
        phoneNumber: trimmedPhone,
      });

      const savedAddress = await saveAddress({
        userId,
        userEmail,
        label: label.trim(),
        phone: trimmedPhone,
        comment: comment.trim() || null,
        division: selectedDivision,
        district: selectedDistrict,
        upazila: selectedUpazila,
      });

      // Standalone address management (not the order flow): show the toast and
      // navigate back to the address list once it auto-dismisses.
      if (!isAddressRequired) {
        navigateBackAfterToast.current = true;
        setToastMessage("Address saved successfully!");
        return;
      }

      // Order flow: combine the saved details with the active cart and submit.
      if (!items.length) {
        Alert.alert(
          "Your cart is empty",
          "Add items to your cart before placing an order.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      await submitOrder({
        customerId: userId,
        addressId: savedAddress.id,
      });
      await refresh();

      router.dismissAll();
      router.navigate("/(customer)/(tabs)/orders");
    } catch (err) {
      console.error("Failed to save delivery details:", err);
      Alert.alert("Error", "Failed to save your delivery details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Delivery details" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        {isAddressRequired && (
          <View style={styles.warningBanner} accessibilityRole="alert">
            <Text style={styles.warningTitle}>Delivery details required</Text>
            <Text style={styles.warningText}>
              Please save your delivery details to place your order.
            </Text>
          </View>
        )}
        <View style={styles.form}>
          <Input
            label="Full Name *"
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. John Doe"
          />

          <Input
            label="Phone Number *"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 01XXXXXXXXX"
            keyboardType="phone-pad"
          />

          <Input
            label="Address Label"
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Home, Office"
          />

          <Input
            label="Delivery instructions / Comment"
            value={comment}
            onChangeText={setComment}
            placeholder="Any specific delivery instructions"
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          {/* 1. Division Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Division (Bangladesh) *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedDivision}
                onValueChange={(itemValue) => handleDivisionChange(itemValue)}
              >
                <Picker.Item label="Select Division..." value="" />
                {(locationData.divisions as DivisionData[]).map((item) => (
                  <Picker.Item
                    key={item.division}
                    label={item.division}
                    value={item.division}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* 2. District Dropdown */}
          {selectedDivision !== "" && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>District (Bangladesh) *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedDistrict}
                  onValueChange={(itemValue) => handleDistrictChange(itemValue)}
                >
                  <Picker.Item label="Select District..." value="" />
                  {availableDistricts.map((item) => (
                    <Picker.Item
                      key={item.district}
                      label={item.district}
                      value={item.district}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {/* 3. Upazila Dropdown */}
          {selectedDistrict !== "" && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Upazila (Bangladesh) *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedUpazila}
                  onValueChange={(itemValue) => setSelectedUpazila(itemValue)}
                >
                  <Picker.Item label="Select Upazila..." value="" />
                  {availableUpazilas.map((upazila) => (
                    <Picker.Item key={upazila} label={upazila} value={upazila} />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        </View>

        <Button
          title={
            saving
              ? "Saving details..."
              : isAddressRequired
                ? "Save details & place order"
                : "Save address"
          }
          onPress={handleSave}
          loading={saving}
          fullWidth
        />
      </ScrollView>

      <Toast message={toastMessage} onHide={handleToastHide} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  form: { gap: spacing.lg },
  fieldContainer: { gap: spacing.xs },
  label: {
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.bodySmall,
    color: colors.text,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAlt,
    overflow: "hidden",
    minHeight: layout.controlHeightLarge,
    justifyContent: "center",
    ...shadows.xs,
  },
  warningBanner: {
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  warningTitle: {
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.body,
    color: colors.warning,
  },
  warningText: {
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
});