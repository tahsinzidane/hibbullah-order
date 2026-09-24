import type { ViewStyle } from "react-native";
import colors from "./colors";

type ShadowStyle = ViewStyle;

export type ShadowElevation = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

export function buildShadows(shadowColor: string): Record<ShadowElevation, ShadowStyle> {
  return {
    none: { shadowColor: "transparent", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
    xs: { shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
    sm: { shadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
    md: { shadowColor, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 3 },
    lg: { shadowColor, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 5 },
    xl: { shadowColor, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.09, shadowRadius: 32, elevation: 8 },
    xxl: { shadowColor, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 40, elevation: 10 },
  };
}

export const shadowPresets = {
  card: "xs",
  cardHover: "sm",
  modal: "lg",
  dropdown: "sm",
  nav: "sm",
  fab: "md",
  toast: "sm",
} as const;

export const industrialElevation = {
  recessed: { borderWidth: 1, borderRadius: 8 },
  flat: { borderWidth: 1, borderRadius: 12 },
  raised: { borderWidth: 1, borderRadius: 12 },
  floating: { borderWidth: 1, borderRadius: 16 },
} as const;

export const shadows = buildShadows(colors.ink);

export default shadows;