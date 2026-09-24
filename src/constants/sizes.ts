export const radius = {
  sm: 10,  // badges, dots
  md: 12,  // inputs, selects, stat cards
  lg: 16,  // standard cards, header islands
  xl: 20,  // product/order cards, nav islands, modals
  xxl: 24, // feature islands (reserve)
  pill: 999,
} as const;

export const borderWidth = {
  thin: 1,   // default cards/borders
  medium: 2, // focus rings
  thick: 3,  // heavy emphasis (rare)
} as const;

export const layout = {
  touch: 40,
  buttonHeight: 40,
  controlHeightSmall: 36,
  controlHeight: 40,
  controlHeightLarge: 44,
  inputHeight: 44,
  iconButtonSize: 36,
  iconButtonSizeSmall: 28,
  icon: 18,
  avatar: 40,
  productImage: 120,
  thumbnail: 60,
} as const;

export const containerPadding = {
  xs: 10,
  sm: 14,
  md: 18,
  lg: 22,
} as const;

export const maxWidth = {
  sm: 540,
  md: 720,
  lg: 960,
  xl: 1140,
  xxl: 1320,
} as const;

export const opacity = {
  disabled: 0.5,
  pressed: 0.82,
  overlay: 0.4,
  muted: 0.6,
} as const;

export const layeredSurface = {
  base: { borderWidth: 0 },
  raised: { borderWidth: 1 },
  sunken: { borderWidth: 1, borderRadius: 8 },
  elevated: { borderWidth: 1, borderRadius: 12 },
  floating: { borderWidth: 1, borderRadius: 16 },
} as const;

export const divider = {
  strong: { borderWidth: 1 },
  default: { borderWidth: 1 },
  subtle: { borderWidth: 1 },
  hairline: { borderWidth: 0.5 },
} as const;

export const geometry = {
  hitTarget: 44,
  buttonHeight: 48,
  inputHeight: 48,
  iconButton: 44,
  badgeHeight: 24,
  chipHeight: 36,
  tabBarHeight: 44,
  dividerInset: 16,
} as const;

export const sizes = {
  borderRadius: radius,

  cardRadius: radius.lg,
  pill: radius.pill,

  touch: layout.touch,
  buttonHeight: layout.buttonHeight,
  inputHeight: layout.inputHeight,
  icon: layout.icon,
  avatar: layout.avatar,
  productImage: layout.productImage,
  thumbnail: layout.thumbnail,

  radius,
  borderWidth,
  layout,
  geometry,
  opacity,
  layeredSurface,
  divider,
  containerPadding,
  maxWidth,
} as const;

export default sizes;