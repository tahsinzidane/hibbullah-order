import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import colors from "../../constants/colors";
import { radius } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize } from "../../constants/typography";
import shadows from "../../constants/shadows";

type ToastProps = {
  message: string | null;
  onHide: () => void;
  duration?: number;
};

export default function Toast({ message, onHide, duration = 2200 }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) {
      return;
    }

    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onHide());
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onHide, opacity]);

  if (!message) return null;

  return (
    <Animated.View
      style={[styles.toast, { opacity }]}
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: spacing.huge,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  text: {
    color: colors.white,
    fontSize: fontSize.bodySmall,
    fontFamily: fontFamily.pjsSemiBold,
    textAlign: "center",
  },
});