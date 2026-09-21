import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import typography from "../../constants/typography";
import { useNotifications } from "../../hooks/useNotifications";

export default function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Pressable
      style={styles.button}
      onPress={() => router.push("/(customer)/account/notifications")}
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0
          ? `Open notifications, ${unreadCount} unread`
          : "Open notifications"
      }
      hitSlop={4}
    >
      <SymbolView
        name={{ ios: "bell.fill", android: "notifications", web: "notifications" }}
        tintColor={colors.primary}
        size={23}
      />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 3,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.label,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 17,
  },
});