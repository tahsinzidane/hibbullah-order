import { router, usePathname } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AdminDrawer from "./AdminDrawer";
import colors from "../../constants/colors";
import { borderWidth, radius } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import shadows from "../../constants/shadows";
import { fontFamily, fontSize } from "../../constants/typography";
import { compression } from "../../lib/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type IconName = SymbolViewProps["name"];

const MAIN_TABS: {
  label: string;
  path: string;
  icon: IconName;
}[] = [
  { label: "Dashboard", path: "/(admin)", icon: { ios: "square.grid.2x2.fill", android: "grid_view", web: "grid_view" } },
  { label: "Orders", path: "/(admin)/orders", icon: { ios: "shippingbox.fill", android: "inventory_2", web: "inventory_2" } },
  { label: "Products", path: "/(admin)/products", icon: { ios: "pills.fill", android: "medication", web: "medication" } },
];

function getActivePath(pathname: string): string {
  if (pathname.includes("/orders")) return "/(admin)/orders";
  if (pathname.includes("/products")) return "/(admin)/products";
  return "/(admin)";
}

export default function AdminNavigation() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activePath = getActivePath(pathname);
  const isMenuActive = !["/(admin)", "/(admin)/orders", "/(admin)/products"].some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  return (
    <>
      <View
        style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
      >
        <View style={styles.island}>
          {MAIN_TABS.map((item) => {
            const active = item.path === activePath;
            return (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.item,
                  pressed && !reducedMotion && styles.pressed,
                ]}
                onPress={() => router.replace(item.path as never)}
                android_ripple={{ color: colors.ripple.primary }}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.label}`}
                accessibilityState={{ selected: active }}
              >
                <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                  <SymbolView
                    name={item.icon}
                    tintColor={active ? colors.primary : colors.textMuted}
                    size={20}
                  />
                </View>
                <Text style={[styles.label, active && styles.activeLabel]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            style={({ pressed }) => [
              styles.item,
              pressed && !reducedMotion && styles.pressed,
            ]}
            onPress={() => setDrawerOpen(true)}
            android_ripple={{ color: colors.ripple.primary }}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            accessibilityState={{ selected: isMenuActive }}
          >
            <View style={[styles.iconWrap, isMenuActive && styles.iconWrapActive]}>
              <SymbolView
                name={{ ios: "line.3.horizontal", android: "menu", web: "menu" }}
                tintColor={isMenuActive ? colors.primary : colors.textMuted}
                size={20}
              />
            </View>
            <Text style={[styles.label, isMenuActive && styles.activeLabel]}>
              Menu
            </Text>
          </Pressable>
        </View>
      </View>

      <AdminDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
  },
  island: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundAlt,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    borderRadius: radius.xl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    ...shadows.sm,
  },
  item: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
    paddingHorizontal: 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: { backgroundColor: colors.primarySoft },
  label: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.tiny,
    letterSpacing: 0.2,
    lineHeight: 11,
  },
  activeLabel: { color: colors.primary },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: compression.subtle }],
  },
});