import type { ViewStyle } from "react-native";
import { opacity } from "../constants/sizes";
import { useReducedMotion } from "../hooks/useReducedMotion";

export const springConfigs = {
  press: { damping: 20, stiffness: 300, mass: 0.8 },
  page: { damping: 18, stiffness: 180, mass: 1 },
  card: { damping: 22, stiffness: 280, mass: 0.9 },
  sheet: { damping: 16, stiffness: 160, mass: 1 },
  bouncy: { damping: 12, stiffness: 200, mass: 1 },
  snap: { damping: 30, stiffness: 400, mass: 0.6 },
} as const;

export const timingConfigs = {
  instant: { duration: 100 },
  fast: { duration: 200 },
  normal: { duration: 300 },
  slow: { duration: 500 },
} as const;

export const compression = {
  subtle: 0.97,
  standard: 0.95,
  deep: 0.92,
} as const;

export const duration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

export type PressKind = keyof typeof compression;

// Central pressable pattern: pressed = opacity fade (always) + scale
// compression (skipped when the user prefers reduced motion).
export function pressedFeedback(
  pressed: boolean,
  reducedMotion: boolean,
  kind: PressKind = "subtle",
): ViewStyle | undefined {
  if (!pressed) return undefined;
  return {
    opacity: opacity.pressed,
    ...(reducedMotion
      ? {}
      : { transform: [{ scale: compression[kind] }] }),
  };
}

export function usePressFeedback(kind: PressKind = "subtle") {
  const reducedMotion = useReducedMotion();
  return (pressed: boolean) => pressedFeedback(pressed, reducedMotion, kind);
}