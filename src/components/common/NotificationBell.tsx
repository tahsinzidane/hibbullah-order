import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import { radius } from "../../constants/sizes";
import shadows from "../../constants/shadows";
import spacing from "../../constants/spacing";
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
      <MaterialIcons name="notifications-none" size={20} color={colors.primary} />
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
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.xs,
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