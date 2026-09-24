import { router, usePathname } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import { borderWidth, radius } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import shadows from "../../constants/shadows";
import { fontFamily, fontSize } from "../../constants/typography";
import { compression } from "../../lib/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useCart } from "../../providers/CartProvider";

const navigationItems = [
  {
    label: "Home",
    path: "/(customer)/(tabs)",
    icon: { ios: "house.fill", android: "home", web: "home" },
  },
  {
    label: "Products",
    path: "/(customer)/(tabs)/products",
    icon: {
      ios: "square.grid.2x2.fill",
      android: "grid_view",
      web: "grid_view",
    },
  },
  {
    label: "Orders",
    path: "/(customer)/(tabs)/orders",
    icon: {
      ios: "shippingbox.fill",
      android: "inventory_2",
      web: "inventory_2",
    },
  },
  {
    label: "Cart",
    path: "/(customer)/(tabs)/cart",
    icon: { ios: "cart.fill", android: "shopping_cart", web: "shopping_cart" },
  },
  {
    label: "Account",
    path: "/(customer)/(tabs)/account",
    icon: { ios: "person.fill", android: "person", web: "person" },
  },
] as const;

function getActivePath(pathname: string) {
  if (pathname.includes("/cart")) return "/(customer)/(tabs)/cart";
  if (pathname.includes("/products")) return "/(customer)/(tabs)/products";
  if (pathname.includes("/orders") || pathname.includes("/order/"))
    return "/(customer)/(tabs)/orders";
  if (pathname.includes("/account") || pathname.includes("/address"))
    return "/(customer)/(tabs)/account";
  return "/(customer)/(tabs)";
}

export default function CustomerNavigation() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { itemCount } = useCart();
  const activePath = getActivePath(pathname);

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      <View style={styles.island}>
        {navigationItems.map((item) => {
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
              accessibilityLabel={`Open ${item.label}${item.label === "Cart" && itemCount > 0 ? `, ${itemCount} items` : ""}`}
              accessibilityState={{ selected: active }}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <SymbolView
                  name={item.icon}
                  tintColor={active ? colors.primary : colors.textMuted}
                  size={20}
                />
                {item.label === "Cart" && itemCount > 0 ? (
                  <View style={styles.badge} accessibilityLabel={`${itemCount} items in cart`}>
                    <Text style={styles.badgeText}>
                      {itemCount > 99 ? "99+" : itemCount}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, active && styles.activeLabel]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 14,
    height: 14,
    paddingHorizontal: 2,
    borderRadius: 7,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.white,
    fontFamily: fontFamily.pjsBold,
    fontSize: 8,
  },
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