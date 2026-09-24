# UI Aesthetics — Transfer Kit

> **Purpose:** Drop this file into any same-category app (store / catalog / pharma / grocery) and apply the Sifa-Pharma aesthetic by changing **styles/tokens only** — no JSX or route restructuring.
>
> **Rule: UI-Only.** Keep your component tree, props, and file layout exactly as they are. Replace only: design tokens, `StyleSheet` values, and style props. If a recipe says “add a wrapper”, do it as a style wrapper, not a structural refactor.
>
> **Exclusion:** Color palette is intentionally omitted. Apply your own theme; all other dimensions (shape, spacing, typography, elevation, motion, layout) are copy-ready here.
>
> **How to get best results:** 1) Copy the Token Pack verbatim → 2) Map your component names → 3) Paste each Component Recipe’s style overrides → 4) Run the Quality Checklist.

---

## Table of Contents

1. [How To Apply In Your Other App](#0-how-to-apply-in-your-other-app--read-first)
2. [Design Principles (Do Not Change)](#1-design-principles--immutable)
3. [Token Pack — Copy/Paste Ready](#2-token-pack--copypaste-ready)
4. [Component Recipes — UI-Only](#3-component-recipes--ui-only)
5. [Navigation Recipes — UI-Only](#4-navigation-recipes--ui-only)
6. [Screen Patterns — Style Overlays Only](#5-screen-patterns--style-overlays-only)
7. [Name Mapping Table](#6-name-mapping-table--fill-this-first)
8. [Quality Checklist](#7-quality-checklist--verify-before-ship)
9. [Appendix: Source Index](#8-appendix-source-index--sifa-reference)

---

## 0. How To Apply In Your Other App — Read First

### The UI-Only Contract

```
KEEP  → JSX structure, component hierarchy, props, routes, state, data fetching
CHANGE → tokens (spacing/radius/type/shadow/motion), StyleSheet values, style props, icon sizes, shadows/borders
```

**Never do:** Move files, rename routes, split components, add providers, or change conditional rendering to match Sifa.

**Always do:** Override `StyleSheet.create({})` entries and inline `style` props with the values from the Token Pack and Recipes.

### 3-Step Application

**Step 1 — Install Tokens (15 min)**
Create `src/constants/` in your app (or adapt existing paths) and paste the Token Pack from Section 2. Export a single `tokens.ts` barrel or keep separate files — either works if imports resolve.

```ts
// Example barrel: src/constants/tokens.ts
export { spacing } from "./spacing";
export { radius, borderWidth, layout, containerPadding, maxWidth, opacity, duration, spring } from "./sizes";
export { fontFamily, fontSize, lineHeight, letterSpacing, semanticType } from "./typography";
export { buildShadows, shadowPresets } from "./shadows";
export { layeredSurface, divider, technical, geometry, industrialElevation } from "./industrial";
export { springConfigs, timingConfigs, compression } from "./motion";
export { BREAKPOINTS, COLUMNS, SIDEBAR_WIDTH } from "./responsive";
```

**Step 2 — Map Names (5 min)**
Fill the Name Mapping Table (Section 6). Example: your `ItemCard` maps to `ProductCard`. All later recipes reference `Transfer Kit Name → Your Name` so you know what to override.

**Step 3 — Apply Recipes In Order (1–2 hrs)**
Work bottom-up for zero breakage:

1. Tokens → 2. Primitives (`Screen`, `Stack/Row`, `Text`) → 3. Controls (`Button`, `Input`, `SearchBar`, `Chip`, `Tabs`) → 4. Surfaces (`Card`, `ListItem`, `Badge`) → 5. Navigation islands → 6. Domain cards → 7. Screen gaps/padding

Each recipe has a **UI-Only Strip** — a minimal diff showing exactly which style keys to replace. Apply it, run the app, check one recipe at a time.

### Framework Adaptation

- **React Native / Expo:** Paste the TS constants and `StyleSheet.create` diffs as-is.
- **Other (Flutter / Web):** Use the JSON values in Token Pack and convert `radius` → `BorderRadius`, `spacing` → `EdgeInsets` / `gap`, `shadow` → `BoxShadow` / `elevation`.
- **Token names are intentionally generic** (`radius.lg`, `spacing.md`) so you can keep your own naming if you alias them.

---

## 1. Design Principles — Immutable

Do not negotiate these; they define the aesthetic even without color.

1. **Border over shadow.** Depth comes from `1px` borders + feather-light shadows. Never use heavy drop shadows alone.
2. **Pill-first.** Every interactive control (button, chip, tab, search) is `pill (999px)`. Hierarchy via scale/border, not corners.
3. **Islands, not bars.** Navigation and headers float as rounded islands with inset margins. App background must remain visible around them.
4. **Two-type system.** Headings = rounded geometric sans (personality). Body/data = dense humanist sans (efficiency). Display sizes only for hero moments; UI stays `13–15px`.
5. **Muted density.** Metadata (`stock`, `generic name`, `timestamps`) at `11–12px` with `relaxed` line height. Keep the canvas airy despite high density.
6. **Consistent compression.** Every pressable compresses (`0.92–0.97`) with a spring settle — never a hard cut.

---

## 2. Token Pack — Copy/Paste Ready

> Paste these into your app’s `src/constants/` (or equivalent). All values are framework-agnostic numbers; adapt the import path to your structure.

### 2.1 Spacing — 4px Base Grid

```ts
// src/constants/spacing.ts
export const spacing = {
  xxs: 2,   // micro gaps: badge padding, dots
  xs: 4,    // chip internal, label-to-input
  sm: 8,    // button icon gap, chip gap, card internal
  md: 12,   // section gaps, list item gap
  lg: 16,   // card padding, screen padding, gutters
  xl: 20,   // button H padding, modal padding
  xxl: 24,  // large screen padding (empty states)
  xxxl: 32, // section separation
  huge: 40, // hero separation
  massive: 48, // page separation
  gutter: 16,  // alias for lg
} as const;
```

**JSON (for non-TS):** `{ "xxs":2, "xs":4, "sm":8, "md":12, "lg":16, "xl":20, "xxl":24, "xxxl":32, "huge":40, "massive":48 }`

**Rule:** No arbitrary spacing. Every `padding`/`margin`/`gap` maps to a token.

### 2.2 Shape — Radius + Border Width

```ts
// src/constants/sizes.ts (shape section)
export const radius = {
  sm: 10,   // badges, dots
  md: 12,   // inputs, selects, stat cards
  lg: 16,   // standard cards, header islands
  xl: 20,   // product/order cards, nav islands, modals
  xxl: 24,  // feature islands (reserve)
  pill: 999, // all pill controls
} as const;

export const borderWidth = {
  thin: 1,   // default cards/borders
  medium: 2, // focus rings
  thick: 3,  // heavy emphasis (rare)
} as const;
```

**Usage map:** Controls `10–12` → Panels `16` → Large cards/Nav `20` → Pills `999`.

### 2.3 Layout Sizes + Container

```ts
// src/constants/sizes.ts (layout section)
export const layout = {
  touch: 40,               // min touch target (compact)
  buttonHeight: 40,        // default button
  controlHeightSmall: 36,  // small control
  controlHeight: 40,       // standard pill/tabs
  controlHeightLarge: 44,  // large CTA
  inputHeight: 44,         // default input/search
  iconButtonSize: 36,      // default icon button
  iconButtonSizeSmall: 28, // small icon button
  icon: 18,                // default icon
  avatar: 40,
  productImage: 120,
  thumbnail: 60,
} as const;

export const containerPadding = { xs: 10, sm: 14, md: 18, lg: 22 } as const;
export const maxWidth = { sm: 540, md: 720, lg: 960, xl: 1140, xxl: 1320 } as const;

export const opacity = { disabled: 0.5, pressed: 0.82, overlay: 0.4, muted: 0.6 } as const;

export const layeredSurface = {
  base:     { borderWidth: 0 },
  raised:   { borderWidth: 1 },
  sunken:   { borderWidth: 1, borderRadius: 8 },
  elevated: { borderWidth: 1, borderRadius: 12 },
  floating: { borderWidth: 1, borderRadius: 16 },
} as const;

export const divider = {
  strong:   { borderWidth: 1 },
  default:  { borderWidth: 1 },
  subtle:   { borderWidth: 1 },
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
```

### 2.4 Typography — Families, Scale, Semantics

```ts
// src/constants/typography.ts
export const fontFamily = {
  // Brand — headings, prominent UI
  soraRegular: "Sora_400Regular",
  soraMedium: "Sora_500Medium",
  soraSemiBold: "Sora_600SemiBold",
  soraBold: "Sora_700Bold",
  // Operational — body, data, tables
  pjsRegular: "PlusJakartaSans_400Regular",
  pjsMedium: "PlusJakartaSans_500Medium",
  pjsSemiBold: "PlusJakartaSans_600SemiBold",
  pjsBold: "PlusJakartaSans_700Bold",
  // Aliases (map to brand)
  regular: "Sora_400Regular",
  medium: "Sora_500Medium",
  semiBold: "Sora_600SemiBold",
  bold: "Sora_700Bold",
} as const;

export const fontSize = {
  largeTitle: 34, title1: 28, title2: 22, title3: 20,
  body: 17, callout: 16, bodySmall: 15, subhead: 15,
  footnote: 13, caption: 12, micro: 11, tiny: 10,
} as const;

export const semanticType = {
  display:    { fontFamily: fontFamily.soraBold,     fontSize: fontSize.largeTitle },
  h1:         { fontFamily: fontFamily.soraBold,     fontSize: fontSize.title1 },
  h2:         { fontFamily: fontFamily.soraSemiBold, fontSize: fontSize.title2 },
  h3:         { fontFamily: fontFamily.soraSemiBold, fontSize: fontSize.title3 },
  title:      { fontFamily: fontFamily.soraMedium,   fontSize: fontSize.body },
  body:       { fontFamily: fontFamily.pjsRegular,   fontSize: fontSize.bodySmall },
  bodyMedium: { fontFamily: fontFamily.pjsMedium,    fontSize: fontSize.bodySmall },
  label:      { fontFamily: fontFamily.pjsRegular,   fontSize: fontSize.footnote },
  caption:    { fontFamily: fontFamily.pjsRegular,   fontSize: fontSize.caption },
  micro:      { fontFamily: fontFamily.pjsRegular,   fontSize: fontSize.micro },
  tiny:       { fontFamily: fontFamily.pjsMedium,    fontSize: fontSize.tiny },
  button:     { fontFamily: fontFamily.pjsSemiBold,  fontSize: fontSize.footnote },
  navigation: { fontFamily: fontFamily.pjsSemiBold,  fontSize: fontSize.tiny },
  table:      { fontFamily: fontFamily.pjsRegular,   fontSize: fontSize.footnote },
  metric:     { fontFamily: fontFamily.pjsBold,      fontSize: fontSize.title2 },
} as const;

export const lineHeight = { tight: 1.2, normal: 1.4, relaxed: 1.6 } as const;
export const letterSpacing = { tight: -0.2, normal: 0, wide: 0.4, wider: 0.8, widest: 1.2 } as const;
```

**Pairing rule:** `Sora` for `display/h1/h2/h3/title/button` + legacy; `PJS` for `body/caption/micro/metric/table` and domain cards (product name/price).

**Line height convention:** Titles `tight`, body `normal`, empty-state `relaxed`. Variant computes `lineHeight = fontSize * token`.

### 2.5 Elevation — Feather Shadows + Industrial Levels

```ts
// src/constants/shadows.ts
export type ShadowElevation = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

// Build with your theme shadow color (do not hardcode)
const buildShadows = (shadowColor: string) => ({
  none: { shadowColor: "transparent", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  xs:   { shadowColor, shadowOffset: { width: 0, height: 2 },  shadowOpacity: 0.04, shadowRadius: 8,  elevation: 1 },
  sm:   { shadowColor, shadowOffset: { width: 0, height: 4 },  shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  md:   { shadowColor, shadowOffset: { width: 0, height: 8 },  shadowOpacity: 0.07, shadowRadius: 16, elevation: 3 },
  lg:   { shadowColor, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 5 },
  xl:   { shadowColor, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.09, shadowRadius: 32, elevation: 8 },
  xxl:  { shadowColor, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.10, shadowRadius: 40, elevation: 10 },
});

export const shadowPresets = { card: "xs", cardHover: "sm", modal: "lg", dropdown: "sm", nav: "sm", fab: "md", toast: "sm" } as const;

export const industrialElevation = {
  recessed: { borderWidth: 1, borderRadius: 8,  // wells/inputs
  },
  flat:     { borderWidth: 1, borderRadius: 12 }, // default cards
  raised:   { borderWidth: 1, borderRadius: 12 }, // elevated panels
  floating: { borderWidth: 1, borderRadius: 16 }, // modals/drawers
} as const;
```

**Apply:** Cards `xs` (default) / `sm` (hover/nav) / `lg`–`xl` (modals). Border always present — shadow is feather, never the sole depth cue.

### 2.6 Motion — Springs, Timing, Compression

```ts
// src/lib/motion.ts
export const springConfigs = {
  press:  { damping: 20, stiffness: 300, mass: 0.8 }, // buttons, icon buttons
  page:   { damping: 18, stiffness: 180, mass: 1 },   // page transitions
  card:   { damping: 22, stiffness: 280, mass: 0.9 }, // cards
  sheet:  { damping: 16, stiffness: 160, mass: 1 },   // modals/sheets
  bouncy: { damping: 12, stiffness: 200, mass: 1 },   // add-to-cart, favorites
  snap:   { damping: 30, stiffness: 400, mass: 0.6 }, // gestures, list items
} as const;

export const timingConfigs = {
  instant: { duration: 100 }, fast: { duration: 200 },
  normal:  { duration: 300 }, slow: { duration: 500 },
} as const;

export const compression = { subtle: 0.97, standard: 0.95, deep: 0.92 } as const;
export const duration = { instant: 100, fast: 200, normal: 300, slow: 500 } as const;
```

**Apply:** Buttons `subtle 0.97 press`, cards `subtle 0.97 card`, list items `0.98 snap`, chips `standard 0.95`. Opacity on press `0.82` (buttons) / `0.92` (cards). Disabled `0.5`. Guard all with `useReducedMotion` — skip scale, keep opacity.

### 2.7 Responsive — Breakpoints, Columns, Sidebar

```ts
// src/hooks/useResponsive.ts
export const BREAKPOINTS = { xs: 0, sm: 375, md: 576, lg: 768, xl: 1024, xxl: 1280 } as const;
export const COLUMNS    = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4, xxl: 5 } as const;
export const SIDEBAR_WIDTH = { lg: 260, xl: 280, xxl: 300 } as const;

// Derived: isMobile = w < 576, isTablet = 576–768, isDesktop = >=768, isWide = >=1024
// cardWidth = (contentWidth / columns) - (spacing.lg * (columns-1) / columns)
// contentWidth = isDesktop ? width - sidebarWidth : width
```

**Container:** Padding `xs 10 / sm 14 / md 18 / lg 22` grows with breakpoint; max widths `540/720/960/1140/1320`.

---

## 3. Component Recipes — UI-Only

> For each recipe: **Keep your JSX. Change only style keys listed in “UI-Only Strip”.**
> Font and spacing tokens come from Section 2. Replace your app’s hardcoded numbers with the tokens.

### 3.1 Primitives

**Screen**
- **Aesthetic:** `flex:1`, no internal padding. Safe-area top by default.
- **UI-Only Strip:** `style: { flex:1 }` + `paddingTop: insets.top` (via safe area). Your inner content provides the padding via `spacing.lg`.

**Stack / Row**
- **Aesthetic:** Unstyled flex primitives. `Stack = column`, `Row = row`, configurable `gap`, `align`, `justify`, `wrap`.
- **UI-Only Strip:** Replace arbitrary `margin` hacks with `gap: spacing.*`. Example:
  ```ts
  // Before (your app)
  <View style={{ flexDirection: "row", marginRight: 10 }}>
  // After (transfer)
  <Row gap={spacing.md} justify="between" align="center">
  ```

**Text**
- **Aesthetic:** Variant-driven, computes `lineHeight = fontSize * lineHeight` and `letterSpacing` per token.
- **Variants:** `largeTitle(34/tight) | title1(28) | title2(22) | title3(20) | body(17) | callout(16) | bodySmall(15) | footnote(13) | caption(12) | micro(11)` + weights `regular/medium/semiBold/bold`.
- **UI-Only Strip:**
  ```ts
  // Replace ad-hoc TextStyle
  <Text style={{
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.title3,               // 20
    lineHeight: fontSize.title3 * lineHeight.normal,
    letterSpacing: letterSpacing.tight,       // -0.2 for titles
  }}>
  ```

### 3.2 Controls

**Button — Pill CTA**
```ts
// UI-Only Strip → override your Button StyleSheet
const buttonBase = {
  minHeight: layout.controlHeight,      // 40
  paddingHorizontal: spacing.xl,        // 20
  paddingVertical: spacing.md,          // 12
  borderRadius: radius.pill,            // 999
  gap: spacing.sm,                      // 8
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
};
const buttonLabel = {
  fontFamily: fontFamily.semiBold,      // PJS SemiBold
  fontSize: fontSize.footnote,          // 13
  lineHeight: fontSize.footnote * lineHeight.tight, // 1.2
  letterSpacing: 0.2,
};
// States: disabled opacity 0.5, pressed scale 0.97 + opacity 0.82 (spring press 20/300/0.8), ripple on Android
// Variants: primary (solid), secondary/danger (soft + border 1), ghost (soft), link (transparent, zero padding)
```
Mods: `fullWidth: { width:"100%" }`, `loading` replaces label, `icon` leading node.

**Input**
```ts
const inputWrapper = { gap: spacing.xs }; // label→field
const inputLabel   = { fontFamily: fontFamily.semiBold, fontSize: fontSize.bodySmall, lineHeight: fontSize.bodySmall * lineHeight.normal };
const inputRow = {
  flexDirection: "row", alignItems: "center",
  minHeight: layout.inputHeight, // 44
  borderWidth: 1, borderRadius: radius.md, // 12
  // elevation xs
};
const inputFocused = { borderWidth: 2 }; // focus cue
const inputField = {
  flex: 1, fontFamily: fontFamily.regular, fontSize: fontSize.body, // 17
  lineHeight: fontSize.body * lineHeight.normal,
  paddingHorizontal: spacing.lg, minHeight: layout.inputHeight,
};
const textArea = { minHeight: 120, borderRadius: radius.xl, textAlignVertical: "top", paddingTop: spacing.lg };
// Adornment: paddingHorizontal spacing.md
```
Helpers: hint/error `regular caption 12/normal`.

**SearchBar — Pill 44**
```ts
const searchWrapper = {
  flexDirection: "row", alignItems: "center",
  height: layout.inputHeight, // 44
  borderRadius: radius.pill, borderWidth: 1,
  paddingHorizontal: spacing.lg, // elevation sm
};
const searchInput = { flex: 1, fontFamily: fontFamily.regular, fontSize: fontSize.footnote, lineHeight: fontSize.footnote*lineHeight.normal, paddingVertical: spacing.sm, marginLeft: spacing.sm };
const clearButton = { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" }; // icon 14
```

**Select — Trigger + Sheet**
```ts
const selectTrigger = { flexDirection:"row", alignItems:"center", justifyContent:"space-between", minHeight: layout.inputHeight, borderWidth:1, borderRadius: radius.md, paddingHorizontal: spacing.lg };
const selectSheet   = { borderRadius: radius.xl, padding: spacing.lg, /* elevation lg */ };
const option        = { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.md, minHeight: 40 };
```

**Chip / FilterChip — Pill 36**
```ts
const chip = { flexDirection:"row", alignItems:"center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, minHeight: 36, borderWidth: 1 };
const chipText = { fontFamily: fontFamily.semiBold, fontSize: fontSize.footnote, lineHeight: fontSize.footnote*lineHeight.normal };
// FilterChip adds shadow xs
```

**Tabs — Pill 40**
```ts
const tabsContainer = { flexDirection:"row", gap: spacing.sm, paddingHorizontal: spacing.lg, minHeight: layout.controlHeight, alignItems:"center" };
const tab = { flexDirection:"row", alignItems:"center", justifyContent:"center", paddingHorizontal: spacing.lg, height: layout.controlHeight, borderRadius: radius.pill, gap: spacing.xs, borderWidth: 1 };
// Active: solid + semiBold label; inactive: surface + medium label
```

### 3.3 Surfaces

**Card — Universal Surface**
```ts
const card = { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, /* shadow xs|sm */ };
// Pressable: scale 0.97 + opacity 0.92 (spring card 22/280/0.9)
```

**ListItem — Row 40**
```ts
const listRow = { flexDirection:"row", alignItems:"center", gap: spacing.md, minHeight: layout.touch, borderRadius: 10,
  paddingVertical: spacing.md, paddingHorizontal: spacing.lg }; // compact: sm/md
const listTitle = { fontFamily: fontFamily.medium, fontSize: fontSize.body, lineHeight: fontSize.body*lineHeight.normal };
const listSub   = { fontFamily: fontFamily.regular, fontSize: fontSize.footnote, lineHeight: fontSize.footnote*lineHeight.normal };
// Divider: borderTopWidth 1 (hairline), press scale 0.98 snap
```

**Badge — Pill 10 + Dot 8**
```ts
const badge = { alignSelf:"flex-start", paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radius.sm }; // text micro 11 semiBold tight 0.4
const dot   = { width: 8, height: 8, borderRadius: 4 };
```

**StatusBadge — With 6px Dot**
```ts
const statusBadge = { flexDirection:"row", alignItems:"center", gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs, borderRadius: radius.sm, borderWidth: 1 };
const statusDot   = { width: 6, height: 6, borderRadius: 3 };
const statusText  = { fontFamily: fontFamily.semiBold, fontSize: fontSize.micro, lineHeight: fontSize.micro*lineHeight.tight, letterSpacing: 0.6, textTransform: "uppercase" };
```

**Alert — Banner 12**
```ts
const alert = { borderWidth:1, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm };
const alertIcon = { width:20, height:20, borderRadius:10, alignItems:"center", justifyContent:"center" }; // symbol micro bold
```

**Modal — Fade + xl Card**
```ts
const backdrop = { flex:1, justifyContent:"center", padding: spacing.xl, /* overlay */ };
const modalCard = { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md, /* shadow xl */ };
```

**Empty / Loading / Error**
- Empty: `padding xxl center gap sm`, title `semiBold title3/normal`, message `regular footnote/relaxed center`.
- Loading: AppLogo `64` + indicator.
- Error: title `semiBold title3` + footnote + retry button.

### 3.4 Domain Cards — Map Your Names

**Product / Item Card — Radius xl (20), Overflow Hidden**
```ts
const productCard = { borderRadius: radius.xl, borderWidth:1, overflow:"hidden", marginBottom: spacing.md, /* shadow sm */ };
const imageWrap = { aspectRatio:1, alignItems:"center", justifyContent:"center", padding: spacing.xs };
const image = { width:"100%", height:"100%", borderRadius: radius.lg };
const favPill = { position:"absolute", top: spacing.sm, right: spacing.sm, width:30, height:30, borderRadius:15, borderWidth:1, alignItems:"center", justifyContent:"center" }; // icon 14, shadow y2 blur4 0.08
const cardContent = { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, gap: spacing.xs };
const productName = { fontFamily: fontFamily.pjsMedium, fontSize: fontSize.footnote, lineHeight: fontSize.footnote*1.35, minHeight: 36 }; // 2 lines
const genericName = { fontFamily: fontFamily.pjsRegular, fontSize: fontSize.micro, lineHeight: fontSize.micro*1.3 };
const priceRow = { flexDirection:"row", alignItems:"center", gap: spacing.xs, marginTop: spacing.xs, flexWrap:"wrap" };
const price = { fontFamily: fontFamily.pjsBold, fontSize: fontSize.callout, lineHeight: fontSize.callout*1.2 };
const originalPrice = { fontFamily: fontFamily.pjsRegular, fontSize: fontSize.micro, textDecorationLine:"line-through" };
const discountPill = { borderWidth:1, borderRadius: radius.pill, paddingHorizontal: spacing.xs, paddingVertical:2 };
const stockRow = { flexDirection:"row", alignItems:"center", gap: spacing.xs, marginTop: spacing.xs }; // dot 6 radius 3
const addWrap = { paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, paddingTop: spacing.xs };
const addButton = { height:36, borderRadius: radius.pill, borderWidth:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap: spacing.xs };
// Stateless: disabled opacity 0.6, pressed 0.88, icon 14 + text footnote semiBold
```

**Category / Manufacturer Card**
- Compact: `border 1 radius lg`, name `body/600`, meta `caption 12`.

**Cart Row — Radius lg + 60 Thumb**
```ts
const cartRow = { flexDirection:"row", gap: spacing.md, borderRadius: radius.lg, borderWidth:1, padding: spacing.md, alignItems:"center" };
const cartThumb = { width:60, height:60, borderRadius: radius.md };
const quantityRow = { flexDirection:"row", alignItems:"center", gap: spacing.sm, borderRadius: radius.pill, borderWidth:1, paddingHorizontal: spacing.sm, minHeight: 40 };
const qtyControl = { width:40, height:40, alignItems:"center", justifyContent:"center" };
```

**Order Card — Radius xl + Preview Timeline**
```ts
const orderCard = { borderRadius: radius.xl, borderWidth:1, padding: spacing.lg, gap: spacing.xs, /* shadow xs */ };
const timelinePreview = { flexDirection:"row", alignItems:"center", gap: spacing.xs, marginTop: spacing.xs }; // dots 6 radius3 + lines flex1 h1 maxW24
const orderFooter = { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginTop: spacing.sm, paddingTop: spacing.sm };
const chevronPill = { width:28, height:28, borderRadius:14, borderWidth:1, alignItems:"center", justifyContent:"center" };
```

**Stat Card (Dashboard) — 46% Width**
```ts
const statCard = { flex:1, minWidth:"46%", borderRadius: radius.md, borderWidth:1, padding: spacing.md, /* shadow sm */ };
const statMarker = { width:20, height:2, borderRadius:1, marginBottom: spacing.sm };
const statLabel = { fontSize: fontSize.micro, fontWeight:"700", letterSpacing:0.8, textTransform:"uppercase" };
const statValue = { fontSize: fontSize.title2, fontWeight:"700", marginTop: spacing.xs, letterSpacing: -0.2 };
```

**Icon Sizing Reference**
```ts
const iconSizes = { fav:14, addToCart:14, stat:16, cartDelete:16, desktopNav:16, check:18, navigationIsland:20, headerBack:22 };
// Default Icon wrapper = 20; override per context above.
```

---

## 4. Navigation Recipes — UI-Only

> Swap wrappers and item styles only. Keep your `router` / `navigation` logic untouched.

### 4.1 Mobile Bottom — Floating Island (5 items)

```ts
const mobileWrapper = { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: Math.max(insets.bottom, spacing.sm) };
const mobileIsland  = { flexDirection:"row", borderWidth:1, borderRadius: radius.xl, paddingVertical: spacing.xs, paddingHorizontal: spacing.xs, /* shadow sm */ };
const navItem = { flex:1, alignItems:"center", justifyContent:"center", gap:2, minHeight:44, paddingHorizontal:2 };
const iconContainer = { width:32, height:32, borderRadius:16, alignItems:"center", justifyContent:"center" }; // icon 20
const navLabel = { fontSize:10, fontWeight:"600", letterSpacing:0.2, lineHeight:11 };
const badge = { position:"absolute", top:-2, right:-4, minWidth:14, height:14, paddingHorizontal:2, borderRadius:7, alignItems:"center", justifyContent:"center" }; // text 8/700
```

### 4.2 Desktop Top — Header Island (52h)

```ts
const desktopWrapper = { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm };
const desktopIsland  = { flexDirection:"row", alignItems:"center", height:52, paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth:1, /* shadow sm */ };
const brandRow = { flexDirection:"row", alignItems:"center", gap: spacing.sm, marginRight: spacing.xl }; // logo 30 + name body 17 semiBold 1.3
const desktopNavItem = { flexDirection:"row", alignItems:"center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, minHeight:32 }; // icon 16 + label caption 12 medium 1.3
const notifButton = { width:36, height:36, borderRadius:18, borderWidth:1, alignItems:"center", justifyContent:"center" };
```

### 4.3 Headers

```ts
// Standard (full-width)
const header = { paddingBottom: spacing.md, paddingHorizontal: spacing.lg, paddingTop: insets.top + spacing.md };
const headerRow = { flexDirection:"row", alignItems:"center", gap: spacing.md, minHeight:44 };
const headerTitle = { fontSize: fontSize.title3, fontWeight:"600", letterSpacing: -0.2 }; // subtitle caption 12 marginTop xxs

// SoftHeader (floating island variant)
const softHeader = { marginHorizontal: spacing.lg, marginTop: insets.top + spacing.sm, borderRadius: radius.lg, borderWidth:1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.md, minHeight:38, /* shadow sm */ };
const softBack = { width:32, height:32, borderRadius:16, borderWidth:1, alignItems:"center", justifyContent:"center" };
const softTitle = { fontFamily:"Sora_600SemiBold", fontSize: fontSize.subhead, letterSpacing:-0.2, lineHeight:18 }; // subtitle PJS 400 caption 12
```

### 4.4 Admin (Same Geometry)

- Mobile island: 3 tabs + Menu — same `xl 20` pill as customer.
- Drawer: modal `overlay` + sheet `radius xl shadow lg padding lg`, rows with `chevron-right`.
- Desktop sidebar: fixed `260–300` (via `SIDEBAR_WIDTH`), vertical list active pills `radius pill`.

---

## 5. Screen Patterns — Style Overlays Only

> Keep routes and data flow. Only change container `gap`/`padding`/`columns`/`card` styles.

| Screen | Gap / Padding | Key Style Override |
|--------|---------------|--------------------|
| **Auth (welcome/login/register)** | `gap lg` between fields, `Input` 44/md, back `32 circle pill` | Logo `80` centered, title `largeTitle 34 tight bold`, subtitle `body 17 regular`, button `pill 40 fullWidth` |
| **Home** | `paddingHorizontal lg gap lg` | Hero `aspect 16/9 radius lg`, chips `gap sm horizontal scroll`, grid `columns 1–5 gap lg` |
| **Catalog / Search** | `gap sm` chip row + grid | `SearchBar pill 44` + `Chip pill 36` |
| **Cart** | `gap md` list | `CartRow lg + thumb 60`, summary card `lg padding lg`, checkout `pill 44 fullWidth` |
| **Favorites** | grid `gap lg` | EmptyState `padding xxl gap sm` |
| **Orders** | `gap md` | `OrderCard xl` + `Tabs pill 40` filter |
| **Product Detail** | `gap md` | Gallery `aspect 1 radius lg`, price `title2 22 bold`, stock `dot 6`, CTA `pill 44 fullWidth` + Quantity `40` |
| **Checkout** | `gap md` | Address card `lg`, summary card, CTA `40` |
| **Admin Dashboard** | `gap md wrap` | StatCard `46% md` + Sparkline `40h` |
| **Admin Tables** | `gap md` | ListItem `40 radius 10` + Badge `sm` + dot `6` |

**Responsive switch** (keep your logic, swap style values):
```ts
const { isMobile, columns } = useResponsive();
// Keep: {isMobile ? <MobileNav/> : <DesktopHeader/>}  — change only island styles above
// Keep: grid columns logic — change only gap to spacing.lg
```

---

## 6. Name Mapping Table — Fill This First

> Map **Transfer Kit → Your App** before pasting recipes. Keeps the glossary searchable without renaming files.

| Transfer Kit Name | Your App Name | File To Edit (your path) | Notes |
|-------------------|---------------|--------------------------|-------|
| `spacing` / `radius` / `fontSize` | `theme.spacing` etc. | `src/constants/*` | Alias if names differ |
| `Screen` | `Page` / `Container` | `components/Page.tsx` | `flex 1` only |
| `Button` (pill 40) | `PrimaryButton` | `components/Button.tsx` | pill recipe |
| `Card` (lg 16) | `Panel` / `Box` | `components/Card.tsx` | universal surface |
| `Input` (44/md) | `TextField` | `components/Input.tsx` | 44h |
| `SearchBar` (pill 44) | `SearchInput` | `components/SearchBar.tsx` | pill 44 |
| `Chip` (pill 36) | `Tag` / `Pill` | `components/Chip.tsx` | pill 36 |
| `Tabs` (pill 40) | `SegmentedControl` | `components/Tabs.tsx` | pill 40 |
| `Badge` / `StatusBadge` | `Tag` / `Status` | `components/Badge.tsx` | `sm 10` |
| `ListItem` (40/10) | `Row` / `Cell` | `components/ListItem.tsx` | `40` minHeight |
| `ProductCard` (xl) | `ItemCard` | `components/ItemCard.tsx` | most visible — do first |
| `CartItem` / `QuantitySelector` | `CartRow` / `Stepper` | `components/Cart*` | `lg` + `60` thumb |
| `OrderCard` | `OrderRow` | `components/OrderCard.tsx` | `xl` + preview |
| `CustomerNavigation` / `DesktopHeader` | `BottomTab` / `Header` | `components/Navigation.tsx` | islands |
| `AdminStatCard` | `MetricCard` | `components/MetricCard.tsx` | `46%` |

*Leave blank rows as “same name” if your app already matches.*

---

## 7. Quality Checklist — Verify Before Ship

Run through after each recipe; ship only when all pass.

- [ ] **No arbitrary values:** All gaps/radii/heights map to tokens (2/4/8/12/16/20/24 + 10/12/16/20/999).
- [ ] **Pill everywhere:** Buttons, chips, tabs, search, add-to-cart are `pill 999` — zero sharp controls left.
- [ ] **Border + feather shadow:** Every `Card` has `border 1 + shadow xs/sm`; modals `lg/xl`; no shadow-only cards.
- [ ] **Type pairing:** Headings Sora, body/PJS — confirm product names `PJS medium 13`, prices `PJS bold 16`, nav `10 semiBold`.
- [ ] **Hit targets:** All pressables `≥40` (buttons 40, inputs 44, chips 36, icon buttons 36, tabs 40).
- [ ] **Compression + reducedMotion:** Press = `scale 0.97/0.95 + opacity` with spring; `useReducedMotion` guard skips scale.
- [ ] **Islands float:** Mobile/desktop nav have inset margins (`lg` horizontal), not full-bleed.
- [ ] **Responsive:** `columns 1→5` and `sidebar 260–300` adapt at `576/768/1024`; container padding grows `10→22`.
- [ ] **Icons:** Default `18`, nav `20`, small `14–16`; paired with `gap xs/sm`.
- [ ] **Structure untouched:** No route/file moves — only style diffs. (Code review: search for added `<View>` wrappers — should be zero.)

---

## 8. Appendix: Source Index — Sifa Reference

<details>
<summary>Expand — original Sifa-Pharma file paths (for maintainers only; not needed to apply kit)</summary>

| Area | Sifa File |
|------|-----------|
| Tokens | `src/constants/tokens.ts:1`, `src/constants/typography.ts:1`, `src/constants/spacing.ts:1`, `src/constants/sizes.ts:1`, `src/constants/shadows.ts:1`, `src/constants/industrial.ts:1` |
| Motion | `src/lib/motion.ts:1` |
| Responsive | `src/hooks/useResponsive.ts:1` |
| Core | `src/components/common/Text.tsx:1`, `Screen.tsx:1`, `Layout.tsx:1`, `Header.tsx:1`, `SoftHeader.tsx:1`, `Button.tsx:1`, `Card.tsx:1`, `Input.tsx:1`, `SearchBar.tsx:1`, `Select.tsx:1`, `Chip.tsx:1`, `Tabs.tsx:1`, `Badge.tsx:1`, `StatusBadge.tsx:1`, `Alert.tsx:1`, `Modal.tsx:1`, `ListItem.tsx:1`, `EmptyState.tsx:1`, `Icon.tsx:1` |
| Nav | `src/components/common/CustomerNavigation.tsx:1`, `CustomerDesktopHeader.tsx:1`, `src/components/admin/AdminNavigation.tsx:1`, `AdminSidebar.tsx`, `AdminDrawer.tsx` |
| Domain | `src/components/products/ProductCard.tsx:1`, `ProductImage.tsx`, `CategoryCard.tsx`, `ManufacturerCard.tsx`, `src/components/cart/CartItem.tsx:1`, `QuantitySelector.tsx:1`, `src/components/orders/OrderCard.tsx:1`, `src/components/admin/AdminStatCard.tsx:1` |
| Screens | `src/app/_layout.tsx`, `src/app/(auth)/*`, `src/app/(customer)/_layout.tsx:1`, `src/app/(admin)/*` |

</details>

---

*Transfer Kit — keep your structure, swap your styles. When in doubt, the token value in Section 2 wins over any ad-hoc number.*
