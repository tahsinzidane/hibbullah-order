import { router, usePathname } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { borderWidth, radius } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { shadows } from "../../constants/shadows";
import { fontFamily, fontSize, letterSpacing } from "../../constants/typography";
import { usePressFeedback } from "../../lib/motion";

type IconName = SymbolViewProps["name"];

const MENU_ITEMS: {
  label: string;
  path: string;
  icon: IconName;
}[] = [
  { label: "Inventory", path: "/(admin)/inventory", icon: { ios: "archivebox.fill", android: "inventory", web: "inventory" } },
  { label: "Customers", path: "/(admin)/customers", icon: { ios: "person.2.fill", android: "people", web: "people" } },
  { label: "Reports", path: "/(admin)/reports", icon: { ios: "chart.bar.fill", android: "bar_chart", web: "bar_chart" } },
  { label: "Returns", path: "/(admin)/returns", icon: { ios: "arrow.uturn.backward", android: "assignment_return", web: "assignment_return" } },
  { label: "Audit log", path: "/(admin)/audit", icon: { ios: "doc.text.fill", android: "description", web: "description" } },
  { label: "Settings", path: "/(admin)/settings", icon: { ios: "gearshape.fill", android: "settings", web: "settings" } },
];

const SHOP_ITEM = {
  label: "Back to Shop",
  path: "/(customer)/(tabs)" as const,
  icon: { ios: "storefront.fill", android: "store", web: "store" } as IconName,
};

export default function AdminDrawer({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const feedback = usePressFeedback();

  const navigate = (path: string) => {
    onClose();
    router.push(path as never);
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Menu</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <SymbolView
                name={{ ios: "xmark", android: "close", web: "close" }}
                tintColor={colors.textMuted}
                size={18}
              />
            </Pressable>
          </View>

          <View style={styles.section}>
            {MENU_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [
                    styles.menuItem,
                    active && styles.menuItemActive,
                    feedback(pressed),
                  ]}
                  onPress={() => navigate(item.path)}
                  android_ripple={{ color: colors.ripple.primary }}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${item.label}`}
                  accessibilityState={{ selected: active }}
                >
                  <View style={styles.iconTile}>
                    <SymbolView
                      name={item.icon}
                      tintColor={active ? colors.primary : colors.textMuted}
                      size={18}
                    />
                  </View>
                  <Text
                    style={[
                      styles.menuLabel,
                      active && styles.menuLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <SymbolView
                    name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
                    tintColor={colors.textMuted}
                    size={14}
                  />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              feedback(pressed),
            ]}
            onPress={() => navigate(SHOP_ITEM.path)}
            android_ripple={{ color: colors.ripple.primary }}
            accessibilityRole="button"
            accessibilityLabel="Back to shop"
          >
            <View style={styles.iconTile}>
              <SymbolView name={SHOP_ITEM.icon} tintColor={colors.success} size={18} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.success }]}>{SHOP_ITEM.label}</Text>
            <SymbolView
              name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
              tintColor={colors.textMuted}
              size={14}
            />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  drawer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.xl,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    ...shadows.lg,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.md,
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: colors.hairline,
  },
  drawerTitle: {
    color: colors.text,
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.title3,
    letterSpacing: letterSpacing.tight,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    minHeight: 40,
  },
  menuItemActive: { backgroundColor: colors.primarySoft },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamily.pjsMedium,
    fontSize: fontSize.bodySmall,
  },
  menuLabelActive: { color: colors.primary },
  divider: {
    height: borderWidth.thin,
    backgroundColor: colors.hairline,
    marginVertical: spacing.sm,
  },
});