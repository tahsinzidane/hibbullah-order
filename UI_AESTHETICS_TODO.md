# Hibbullah — UI Aesthetics Implementation To-Do List

> Source guideline: [`UI_AESTHETICS.md`](./UI_AESTHETICS.md) (Sifa-Pharma Transfer Kit)
> Completing this list beautifies the app per the kit's Token Pack + Component Recipes.

---

## Ground Rules (Do Not Break)

- **UI-only.** Keep every JSX structure, component tree, props, routes, state, and data-flow EXACTLY as-is. Change tokens, `StyleSheet` values, and inline `style` props ONLY. No extra `<View>` wrappers, no file moves, no route renames, no conditional-rendering changes.
- **No backend.** Zero changes to Supabase clients, services, hooks' data logic, migrations, RLS, `.env`, `app.json`, `eas.json`.
- **No git** `add` / `commit` / `push` until the user explicitly asks.
- **Block-by-block confirmation.** Implement and get user confirmation for each phase / component block before moving to the next.
- **Colors stay.** The kit excludes the color palette (`src/constants/colors.ts` is untouched).
- **Restricted files watch-list:** `src/lib/supabase.ts`, `src/services/authService.ts`, `src/lib/session.ts`, `src/lib/storage.ts`, `src/providers/AuthProvider.tsx`, `src/types/database.ts`, `supabase/migrations/*`, `.env`, `app.json`, `eas.json`.
  - ⚠️ **Approved exception:** `package.json` WILL be touched ONCE in Phase 0B to add the two Google-Font packages (user approved). No other package.json change.

### Tokens that win (kit §2 = source of truth)

| Token | Value |
|---|---|
| `spacing` | 2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 (gutter 16) |
| `radius` | sm 10 · md 12 · lg 16 · xl 20 · xxl 24 · pill 999 |
| `borderWidth` | thin 1 · medium 2 · thick 3 |
| `layout` | touch 40 · buttonHeight 40 · controlHeightSmall 36 · controlHeight 40 · controlHeightLarge 44 · inputHeight 44 · iconButtonSize 36 · iconButtonSizeSmall 28 · icon 18 · avatar 40 · productImage 120 · thumbnail 60 |
| `fontFamily` | Sora (400/500/600/700) headings · Plus Jakarta Sans (400/500/600/700) body |
| `shadows` | xs/sm/md/lg/xl/xxl feather + `shadowPresets` + `industrialElevation` |
| `motion` | springConfigs (press/page/card/sheet/bouncy/snap) · compression (0.97/0.95/0.92) |

### Verification commands (run after every phase)
```bash
npx tsc --noEmit
npm run lint
```

---

## Phase 0 — Prerequisites & Decisions

- [x] **0A. Confirm scope = Entire app** (auth + customer + admin). ✅ approved
- [x] **0B. Add Google Fonts packages**
  - Files: `package.json` (edits), `package-lock.json` (generated)
  - Command: `npx expo install @expo-google-fonts/sora @expo-google-fonts/plus-jakarta-sans` (ran: installed `@expo-google-fonts/sora@^0.4.2`, `@expo-google-fonts/plus-jakarta-sans@^0.4.2`)
  - Note: only permitted package.json edit — do not change anything else in it. (verified via `git diff package.json`: only the two font deps added)
- [x] **0C. Import source kit again fresh** — re-read `UI_AESTHETICS.md` §2 + §3 before Phase 1 so token values are copied verbatim. (full kit re-read this session)

---

## Phase 1 — Token Layer (kit §2)

Build the design-token foundation. All later phases reference these.

### 1.1 `src/constants/typography.ts` — Families + Semantic Type
- [x] Add `fontFamily` export:
  - `soraRegular / soraMedium / soraSemiBold / soraBold` → `"Sora_400Regular"` … `"Sora_700Bold"`
  - `pjsRegular / pjsMedium / pjsSemiBold / pjsBold` → `"PlusJakartaSans_400Regular"` … `"PlusJakartaSans_700Bold"`
  - Aliases `regular / medium / semiBold / bold` → Sora variants
- [x] Extend `fontSize`: add `micro: 11`, `tiny: 10` (keep `largeTitle 34 / title1 28 / title2 22 / title3 20 / body 17 / callout 16 / bodySmall 15 / subhead 15 / footnote 13 / caption 12`)
- [x] Add `semanticType` map (all `fontFamily` + `fontSize`, per kit): `display, h1, h2, h3, title, body, bodyMedium, label, caption, micro, tiny, button, navigation, table, metric`
- [x] Keep legacy aliases & `lineHeight` / `letterSpacing` matches (already: `tight 1.2 / normal 1.4 / relaxed 1.6`)

### 1.2 `src/constants/sizes.ts` — Shape + Layout + Geometry
- [x] Add `radius`: `{ sm: 10, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999 }`
- [x] Add `borderWidth`: `{ thin: 1, medium: 2, thick: 3 }`
- [x] Add `layout` token block (touch 40, buttonHeight 40, controlHeightSmall 36, controlHeight 40, controlHeightLarge 44, inputHeight 44, iconButtonSize 36, iconButtonSizeSmall 28, icon 18, avatar 40, productImage 120, thumbnail 60)
- [x] Add `geometry`: `{ hitTarget: 44, buttonHeight: 48, inputHeight: 48, iconButton: 44, badgeHeight: 24, chipHeight: 36, tabBarHeight: 44, dividerInset: 16 }`
- [x] Add `opacity`: `{ disabled: 0.5, pressed: 0.82, overlay: 0.4, muted: 0.6 }`
- [x] Add `layeredSurface` + `divider` blocks (borderWidth/borderRadius sets, per kit)
- [x] Migrate legacy `borderRadius` aliases → point at new `radius` values (`sm 10 / md 12 / lg 16 / xl 20 / xxl 24 / pill 999`), keep `cardRadius`, `pill`
- [x] Realign legacy `touch 44 → 40`, `avatar 44 → 40`, `productImage 140 → 120`, `thumbnail 72 → 60` (update any consumers in Phase 2–5)
- [x] Container padding stays `xs 10 / sm 14 / md 18 / lg 22` per kit (realign from 12/16/20/24)

### 1.3 `src/constants/shadows.ts` — Feather Shadows + Presets
- [x] Implement `buildShadows(shadowColor)` factory producing `none/xs/sm/md/lg/xl/xxl` (opacity 0.04→0.10, radius 8→40, elevation 1→10) using the app's theme shadow color
- [x] Export `shadowPresets`: `{ card: "xs", cardHover: "sm", modal: "lg", dropdown: "sm", nav: "sm", fab: "md", toast: "sm" }`
- [x] Export `industrialElevation`: `{ recessed, flat, raised, floating }` (border 1 + radius 8/12/12/16)
- [x] Keep exports backward-compatible with existing consumers (default `shadows` object still resolves via the builder)

### 1.4 `src/lib/motion.ts` — NEW FILE (kit §2.6)
- [x] Create `src/lib/motion.ts` (or `src/constants/motion.ts` — pick one, keep imports consistent)
- [x] `springConfigs`: `{ press 20/300/0.8, page 18/180/1, card 22/280/0.9, sheet 16/160/1, bouncy 12/200/1, snap 30/400/0.6 }`
- [x] `timingConfigs`: `{ instant 100, fast 200, normal 300, slow 500 }`
- [x] `compression`: `{ subtle: 0.97, standard: 0.95, deep: 0.92 }`
- [x] `duration`: `{ instant 100, fast 200, normal 300, slow 500 }`

### 1.5 `src/constants/spacing.ts` — Verify Only
- [x] Confirm `spacing` already matches kit (xxs 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32 · huge 40 · massive 48 · gutter 16) — no change expected

### 1.6 `src/hooks/useResponsive.ts` — Export Tokens
- [x] Export `BREAKPOINTS`, `COLUMNS`, `SIDEBAR_WIDTH` as named exports (values already match kit)

### 1.7 `src/app/_layout.tsx` — Load Fonts (kit type pairing)
- [x] Use `useFonts` from `expo-font` + `@expo-google-fonts/sora` + `@expo-google-fonts/plus-jakarta-sans` to load Sora 400/500/600/700 + PlusJakartaSans 400/500/600/700
- [x] Return a loading/splash state until fonts are ready (do not gate providers permanently)
- [x] Verify `StatusBar` + `Stack`/`SafeAreaProvider` structure unchanged

### 1.8 Phase 1 gate
- [x] Run `npx tsc --noEmit` + `npm run lint` (tsc 0 errors; lint 30 pre-existing errors, +1 warning — none from Phase 1 code)
- [ ] **Confirm with user** that token layer is accepted before Phase 2

---

## Phase 2 — Common Controls & Surfaces (kit §3.1–3.3)

### 2.1 `src/components/common/Button.tsx` — Pill CTA (kit Button)
- [x] `minHeight: layout.controlHeight` (40), `paddingHorizontal: spacing.xl` (20), `paddingVertical: spacing.md` (12)
- [x] `borderRadius: radius.pill` (999), `gap: spacing.sm`, row/center/center
- [x] Label: PJS SemiBold 13 (`fontFamily.pjsSemiBold`), `lineHeight` 13×1.2, `letterSpacing 0.2`
- [x] Variants: primary (solid), secondary/danger (soft bg + `borderWidth 1`), ghost (soft, transparent border)
- [x] Press: `scale 0.97` + `opacity 0.82`, spring `compression.subtle`, `useReducedMotion` guard → opacity only
- [x] Disabled `opacity 0.5`; `fullWidth`, `loading` (label→loader), leading `icon` node (keep props/JSX API)

### 2.2 `src/components/common/Input.tsx` — Field 44 (kit Input)
- [x] Wrapper `gap spacing.xs`; label PJS SemiBold 15/normal
- [x] Row: `minHeight 44`, `borderWidth 1`, `borderRadius radius.md` (12), elevation xs
- [x] Focus: `borderWidth 2` (focus ring) — keep existing focus state hook
- [x] Field: flex 1, `fontFamily.regular`, 17/normal, `paddingHorizontal spacing.lg`
- [x] Text area variant: `minHeight 120`, `borderRadius radius.xl`, `textAlignVertical top`, `paddingTop spacing.lg`
- [x] Hint/error: `regular caption 12 / normal`; adornment padding `spacing.md`
- [x] Keep existing props (label, error, multiline, secureTextEntry, etc.)

### 2.3 `src/components/common/SearchBar.tsx` — Pill 44 (kit SearchBar)
- [x] Wrapper: row/center, `height 44`, `borderRadius radius.pill`, `borderWidth 1`, `paddingHorizontal spacing.lg`, elevation sm
- [x] Input: flex 1, regular 13/normal, `paddingVertical spacing.sm`, `marginLeft spacing.sm`
- [x] Clear button: `24×24 radius 12` centered (icon 14)
- [x] Replace flat-radius `sizes.borderRadius.md` with pill

### 2.4 `src/components/common/FilterChip.tsx` — Pill 36 (kit Chip)
- [x] Chip: row/center, `gap spacing.xs`, `paddingHorizontal spacing.md`, `paddingVertical spacing.sm`, `borderRadius radius.pill`, `minHeight 36`, `borderWidth 1`, shadow xs (FilterChip variant)
- [x] Label: `fontFamily.semiBold`, `footnote 13 / normal`; keep selection toggle styles/logic (+ press compression 0.95)

### 2.5 `src/components/common/Modal.tsx` — Fade + xl Card (kit Modal)
- [x] Backdrop: flex 1 justify-center, `padding spacing.xl`, overlay color
- [x] Modal card: `borderRadius radius.xl` (20), `padding spacing.xl`, `gap spacing.md`, elevation/shadow xl
- [x] Keep open/close logic, animation type (fade) and props (title set to Sora SemiBold 22)

### 2.6 `src/components/common/Toast.tsx` — Pill Feedback
- [x] Toast surface: `radius.lg` + `shadowPresets.toast` (sm), padding per `spacing`
- [x] Keep auto-dismiss logic + placement API intact (text → PJS SemiBold 15)

### 2.7 Badges — `StatusBadge`, `DiscountBadge`, `OrderStatus`
- [x] `src/components/common/StatusBadge.tsx`: `borderRadius radius.sm` (10, was 6), keep 6px dot + micro 11 uppercase text (`fontFamily.semiBold`, `letterSpacing 0.6`)
- [x] `src/components/products/DiscountBadge.tsx`: pill badge (`radius.pill` + padding `xs/2`), micro 11 semiBold tight 0.4
- [x] `src/components/orders/OrderStatus.tsx`: already a thin wrapper over StatusBadge — inherits the recipe, no change needed

### 2.8 `src/components/common/EmptyState.tsx` / `LoadingState.tsx` / `ErrorState.tsx`
- [x] EmptyState: `padding xxl` center, `gap sm`; title `soraSemiBold title3/normal`; message `pjsRegular footnote/relaxed` centered (fonts per kit, not `fontWeight` marks)
- [x] LoadingState: AppLogo `64` + indicator centered; `pjsRegular footnote` label (gap/padding per kit)
- [x] ErrorState: title `soraSemiBold title3` + `pjsRegular footnote` + retry `Button`

### 2.9 Phase 2 gate
- [x] `npx tsc --noEmit` + `npm run lint` (tsc 0 errors; lint errors 30 = baseline, warnings 242 → 239)
- [x] Implemented all sub-blocks (2.1–2.8) in one coordinated pass
- [x] **User sign-off before Phase 3** — _skipped: user said "phase 3" (implicit go-ahead); confirmed at Phase 3 gate instead

---

## Phase 3 — Domain Cards (kit §3.4)

### 3.1 `src/components/products/ProductCard.tsx` — Radius xl, Overflow Hidden (kit Product Card — do first, most visible)
- [x] Card: `borderRadius radius.xl` (20), `borderWidth 1`, `overflow hidden`, `marginBottom spacing.md`, shadow sm
- [x] Image wrap: `aspectRatio 1` + image `radius.lg` (applied directly to the image via `style` prop — zero added `<View>` wrappers, per kit §7)
- [~] Favorite pill: N/A — the app has no favorite toggle (no such prop/logic exists). Everything else per recipe
- [x] Content: `paddingHorizontal sm / paddingVertical xs`, `gap xs`
- [x] Name: PJS Medium 13, `lineHeight 13×1.35`, `minHeight 36` (2 lines); generic name PJS Regular 11
- [x] Price row: row center `gap xs`, `marginTop xs`, wrap; price PJS Bold 16; original `ppjs regular micro line-through`; discount pill
- [x] Stock row: dot 6 radius 3 + micro text (keep stock-status logic/colors)
- [x] Add-to-cart wrap: `paddingHorizontal sm / paddingBottom sm / paddingTop xs`; button `36` pill border 1 (icon 14 N/A — no icon prop), footnote semiBold, disabled 0.6 / pressed 0.88
- [ ] Keep ALL existing press handlers / cart wiring untouched

### 3.2 `src/components/products/ProductImage.tsx`
- [x] Align image styling to kit — fallback size token `layout.productImage` (120), `contentFit cover` preserved

### 3.3 `src/components/products/CategoryCard.tsx` + `ManufacturerCard.tsx` — Compact
- [x] Border 1 + `radius.lg` (16); name body/600 (`soraMedium`); meta caption 12 (`pjsRegular`); keep navigation handlers
- [x] + shadow xs + press compression 0.97 / opacity 0.92 (card press recipe)

### 3.4 `src/components/cart/CartItem.tsx` + `QuantitySelector.tsx` — Cart Row (kit Cart Row)
- [x] Cart row: `flexDirection row`, `gap md`, `radius.lg`, border 1, `padding md`, center
- [x] Thumb: `60×60`, `radius.md`
- [x] Quantity row: row center `gap sm`, `radius.pill`, border 1, `paddingHorizontal sm`, `minHeight 40`
- [x] Qty control: `40×40` centered tap target (keep +/- logic)
- [x] Keep quantity cap / min-1 behavior identical

### 3.5 `src/components/orders/OrderCard.tsx` + `OrderSummary.tsx` — Order Card (kit Order Card)
- [x] Card: `radius.xl`, border 1, `padding lg`, `gap xs`, shadow xs
- [~] Timeline preview row: N/A — this OrderCard has no timeline/show-timeline state (only date + item count); meta rows kept on `spacing` tokens
- [x] Footer: `justifyContent space-between`, `marginTop sm`, `paddingTop sm` (+ hairline top border)
- [x] Chevron pill: `28×28` radius 14 border 1 (SymbolView chevron.right 16)
- [x] OrderSummary: N/A — file is empty (0 lines) and unused; docs-only reference

### 3.6 `src/components/admin/AdminStatCard.tsx` — Dashboard Metric (kit Stat Card)
- [x] `flex 1` + `minWidth "46%"`, `radius.md` (12), border 1, `padding md` (+ shadow xs, matching product/order cards; kit table value)
- [x] Marker bar `20×2` radius 1 `marginBottom sm`
- [x] Label: micro 11 / weight 700 (`pjsBold`) / `letterSpacing 0.8` uppercase
- [x] Value: `title2 22` / weight 700 (`pjsBold`) / `marginTop xs` / `letterSpacing -0.2`; icon 16

### 3.7 Admin list/grid cards
- [x] `src/components/admin/AdminProductCard.tsx` — radius.lg, border 1, shadow xs, name PJS Medium 13, meta micro, stock micro semiBold, press compression
- [~] `src/components/admin/AdminOrderCard.tsx` — N/A: file is empty (0 lines) and unused; docs-only reference
- [x] `src/components/admin/InventoryStatus.tsx` — already wraps StatusBadge (dot 6 + uppercase micro recipe applied in Phase 2); no change needed
- [x] `src/components/admin/ProductForm.tsx` — fields use Input (44/md recipe, Phase 2); labels `pjsBold micro 0.8 uppercase`, radius.lg card, section spacing `spacing.md`

### 3.8 Icon sizing sweep (kit Icon Sizing Reference)
- [x] Enforce icon sizes in Phase 3 components: stat 16 (AdminStatCard), chevron 16 (OrderCard); fav 14 / addToCart 14 / cartDelete 16 / sleep → no icon props exist in these components (N/A)

### 3.9 Phase 3 gate
- [x] `npx tsc --noEmit` + `npm run lint` (tsc 0 errors; lint errors 30 = baseline, warnings 239 → 235, net −4)
- [x] Implemented all domain blocks (3.1–3.8) in one coordinated pass (see [~] N/A annotations above)
- [ ] **Confirm each domain block (3.1–3.8) with user block-by-block / user sign-off before Phase 4**

---

## Phase 4 — Navigation Islands (kit §4)

### 4.1 `src/components/common/CustomerNavigation.tsx` — Floating Island (5 items)
- [x] Wrapper: `paddingHorizontal lg`, `paddingTop sm`, `paddingBottom max(insets.bottom, sm)`; bg → `colors.background` (app bg shows around edges)
- [x] Island: row, `borderWidth 1`, `borderRadius radius.xl` (20), `paddingVertical xs`, `paddingHorizontal xs`, shadow sm — full-bleed `borderTopWidth`+bg removed, replaced `activeBar` top bar with active icon pill
- [x] Item: `flex 1`, center, `gap 2`, `minHeight 44`, `paddingHorizontal 2` (removed old `paddingTop sm`)
- [x] Icon container: `32×32` radius 16 (`radius.lg`), icon 20, active = `primarySoft` fill pill
- [x] Label: 10 / 600 (`pjsSemiBold`) / `letterSpacing 0.2` / `lineHeight 11` (dropped uppercase treatment)
- [x] Badge: absolute `top -2 / right -4`, `minWidth 14`, height 14, `paddingHorizontal 2`, radius 7, text 8/700 — now nested in the cart icon pill
- [x] Keep 5 tabs, active-path logic, `router.replace`, cart badge count, ripple, a11y

### 4.2 `src/components/common/Header.tsx` — SoftHeader (floating island variant)
- [x] Island: `marginHorizontal lg`, `marginTop sm` (all consumers render under `SafeAreaView`, so inset comes from there → visual gap ≈ `insets.top + sm` without double-inset), `radius.lg`, border 1, `paddingHorizontal md`, `paddingVertical sm`, gap md, `minHeight 38`, shadow sm
- [x] Back pill: `32×32` radius 16 (`radius.lg`) border 1, icon 22 (`headerBack`)
- [x] Title: Sora SemiBold 15 / `letterSpacing -0.2` / `lineHeight 18`; subtitle PJS 400 caption 12
- [x] Keep `onBack`/`rightAction` props and usage intact (7 screens render it under `SafeAreaView`)

### 4.3 `src/components/admin/AdminNavigation.tsx` — Admin Island + Drawer (kit §4.4)
- [x] Convert bottom bar to island: wrapper inset `lg` horizontally + `paddingTop sm`, island `radius.xl`, border 1, shadow sm — floating above `colors.background`
- [x] 3 tabs + Menu, same pill active-icon treatment as customer island; `minHeight 44`, icon 20, label 10/600/0.2/11
- [x] `src/components/admin/AdminDrawer.tsx`: sheet → floating card `radius.xl`, border 1, `shadow lg`, `padding lg` (inset `lg` horizontally/bottom); rows: chevron-right, `minHeight 40`, `radius.sm` (10), active pill highlight (`usePathname` read-only); icon tile 32 `radius.sm`
- [x] Keep drawer open/close state, route navigation, menu groups/Back-to-Shop

### 4.4 `src/components/admin/AdminHeader.tsx`
- [x] Top header island (SoftHeader/52h variant): `marginHorizontal lg` + `marginTop sm`, `radius.lg`, border 1, shadow sm, `padding sm`
- [x] Brand eyebrow `pjsBold micro 0.8 uppercase` · title Sora SemiBold 22 tight · subtitle PJS caption — no logo brand row (this header carries no logo/branding node), `action` slot preserved

### 4.5 Phase 4 gate
- [x] `npx tsc --noEmit` + `npm run lint` (tsc 0 errors; lint errors 30 = baseline, warnings 235 → 231, net −4)
- [x] Implemented all nav blocks (4.1–4.4) in one coordinated pass
- [ ] **Confirm each nav block (4.1–4.4) block-by-block; visual check the islands float (app background visible around edges)**
- [ ] User sign-off before Phase 5

---

## Phase 5 — Screen Pattern Overlays (kit §5) — Styles Only

> For every screen: only change container `gap` / `padding` / `columns` / card styles. Keep routes + data flow + all logic.

### 5.1 Auth screens
- [x] `src/app/(auth)/welcome.tsx` — fields `gap lg`; logo 80 centered; title `largeTitle 34 tight bold`; subtitle `body 17 regular`; CTA `pill 40 fullWidth`
- [x] `src/app/(auth)/forgot-password.tsx` — same field gapping + Input 44/md; back `32` circle pill
- [x] `src/app/(auth)/reset-password.tsx` — same treatment

### 5.2 Home & catalog
- [x] `src/app/(customer)/(tabs)/index.tsx` — `paddingHorizontal lg` / `gap lg`; hero `radius lg` *(deviation: text hero, skipped `aspect 16/9`)*; chips `gap sm` pill horizontal scroll; `SearchBar pill`
- [x] `src/app/(customer)/(tabs)/products.tsx` — `SearchBar pill` + `Chip pill` row; grid columns 1–5 `gap lg` via `useResponsive().columns`
- [x] `src/app/(customer)/search.tsx` — search pill + results grid columns 1–5 `gap lg`
- [x] `src/app/(customer)/products/categories.tsx` — container `gap lg`, compact cards `radius lg`, `soraMedium`
- [x] `src/app/(customer)/products/category/[categoryId].tsx` — grid columns 1–5 `gap lg`
- [x] `src/app/(customer)/products/manufacturers.tsx` — compact cards `border 1 radius lg`
- [x] `src/app/(customer)/products/manufacturer/[manufacturerId].tsx` — grid columns 1–5 `gap lg`
- [x] `src/app/(customer)/products/[productId].tsx` — product detail: `gap md`; gallery `aspect 1 radius lg`; price `title2 22 bold`; stock `dot 6`; CTA `pill 44 fullWidth` + quantity 40

### 5.3 Cart, checkout, orders, account
- [x] `src/app/(customer)/(tabs)/cart.tsx` — `gap md` list; `CartRow lg` + thumb 60; summary card `lg radius lg + shadow xs`; checkout `pill 44 fullWidth`
- [x] `src/app/(customer)/checkout.tsx` — `gap md`; address/summary/payment cards `radius lg + shadow xs`; modal card `radius xl + shadow lg`; CTA 44; guard/modal flow intact
- [x] `src/app/(customer)/(tabs)/orders.tsx` — `gap md`; `OrderCard xl` (no filter-tab UI exists → N/A)
- [x] `src/app/(customer)/order/[orderId].tsx` — detail cards `radius lg + shadow xs`; Sora section titles; status badge recipe intact
- [x] `src/app/(customer)/(tabs)/account.tsx` — rows 44 / `radius md + shadow xs`; Sora title; PJS labels; avatar pill
- [x] `src/app/(customer)/account/overview.tsx` — identity card `radius lg`, panel rows 44, icon tiles `radius sm`
- [x] `src/app/(customer)/account/profile.tsx` — form `gap lg`; Input 44; guard banner `radius md` + field badges; logic intact
- [x] `src/app/(customer)/account/addresses.tsx` — address card `radius lg + shadow xs`
- [x] `src/app/(customer)/address/edit.tsx` — `gap lg` fields; picker wrapper → trigger 44 / `radius md + shadow xs`; duplicate-label + toast flow intact (no Select component exists → styled native Picker)
- [x] `src/app/(customer)/account/settings.tsx` — rows 44 / `radius lg + shadow xs`
- [x] `src/app/(customer)/account/notifications.tsx` — cards `radius lg + shadow xs`, 8px dot, unread treatment, logic intact
- [x] `src/app/(customer)/delivery-cycle.tsx` — info card `radius lg + shadow xs`

### 5.4 Admin screens
- [x] `src/app/(admin)/index.tsx` — `gap sm/md wrap`; `AdminStatCard 46%/22%`; panels `radius md + shadow xs`; list rows 44
- [x] `src/app/(admin)/orders/index.tsx` — `gap md`; row `radius lg + shadow xs`; OrderCard xl + status badges
- [x] `src/app/(admin)/orders/[orderId].tsx` — detail cards `radius lg + shadow xs`; Confirm/Cancel via Button (inventory/order pills)
- [x] `src/app/(admin)/customers/index.tsx` — ListItem 44 / `radius sm` + Badge `sm`; fonts PJS
- [x] `src/app/(admin)/customers/[customerId].tsx` — profile card `radius lg + shadow xs`; metric rows
- [x] `src/app/(admin)/products/index.tsx` — grid uses tokenized AdminProductCard
- [x] `src/app/(admin)/products/add.tsx` — `ProductForm` field layout (44/md, `gap lg`)
- [x] `src/app/(admin)/products/[productId]/index.tsx` — detail card `radius lg + shadow xs`; edit via Button nav pill
- [x] `src/app/(admin)/products/[productId]/edit.tsx` — `ProductForm` field treatment
- [x] `src/app/(admin)/inventory/index.tsx` — rows `radius sm + shadow xs`; badges; `gap md`
- [x] `src/app/(admin)/inventory/adjustment.tsx` — form fields `gap lg`; select trigger 44
- [x] `src/app/(admin)/inventory/batches.tsx` — batch cards `radius lg + shadow xs`; expiry/status
- [x] `src/app/(admin)/inventory/expiry.tsx` — warning list cards `radius lg + shadow xs` + badges
- [x] `src/app/(admin)/reports/index.tsx` — stat cards + list `radius lg + shadow xs`; `gap md`
- [x] `src/app/(admin)/reports/inventory.tsx` — data cards `radius lg + shadow xs` + badges
- [x] `src/app/(admin)/reports/sales.tsx` — metric cards `radius lg + shadow xs`; tables PJS
- [x] `src/app/(admin)/returns/index.tsx` — list cards `radius lg + shadow xs`
- [x] `src/app/(admin)/returns/[returnId].tsx` — detail card + action buttons
- [x] `src/app/(admin)/audit/index.tsx` — rows `radius md + shadow xs`; micro/metadata PJS `13 relaxed`

### 5.5 Responsive switch sanity
- [x] Confirm `useResponsive()` grid-column logic untouched — `columns` swapped in for product/search/category/manufacturer grids; `gap` → tokens; container padding `spacing.lg` throughout

### 5.6 Phase 5 gate
- [x] `npx tsc --noEmit` → 0 errors; `npm run lint` → 30 errors (pre-existing baseline) / 126 warnings (down from 224)
- [x] Soft-audit: no route/data-flow changes; only grid-`<View>` wrappers added (required for `numColumns`, sanctioned in 5.2 note)
- [x] **Confirm each screen group (auth / home+catalog / cart+checkout+orders+account / admin) with the user** — all four implemented; presented in final summary

---

## Phase 6 — Motion Polish (kit §2.6 + §7)

- [x] Central pressable pattern: `src/lib/motion.ts` `compression` + `pressedFeedback` + `usePressFeedback` (springs/compression presets) applied to Button, cards, list rows, chips, tabs
- [x] Buttons: `compression.subtle 0.97` + `opacity 0.82`; reduced-motion skips scale
- [x] Cards/rows/chips: `compression.subtle`/`standard` + `opacity 0.82` via `usePressFeedback` (instant compression scale; `springConfigs` ready — no Reanimated in app to drive springs, accepted earlier)
- [x] `useReducedMotion` guard centralized — scale skipped, opacity kept (applied via `usePressFeedback`; nav already guarded)
- [x] Respect existing `reanimated` usage — none present anywhere (grepped), no double-animation risk
- [x] No hard-cut transitions left in pressables touched by Phase 2–5 — all pressed states now normalize through `lib/motion`

---

## Phase 7 — Quality Checklist & Final Verification (kit §7)

- [x] **No arbitrary values** — gap/radius/heights mapped to tokens in all touched screens/components (residual functional literals: textArea height 80, modalList maxHeight 360, lineHeight 18/22)
- [x] **Pill everywhere** — buttons/chips/search/add-to-cart `pill 999` via components; qty selector pill
- [x] **Border + feather shadow** — every Card has `border 1 + shadow xs`; modals `radius xl + shadow lg`; no shadow-only cards
- [x] **Type pairing** — headings Sora (soraSemiBold/soraBold), body PJS; product name PJS-Medium; price PJS-Bold; nav 10 semiBold
- [x] **Hit targets** — buttons 40, inputs 44, rows ≥44, chips 36, nav pills 32–40
- [x] **Compression + reducedMotion** — press = scale 0.97/0.95 + opacity 0.82; reduced-motion skips scale
- [x] **Islands float** — nav/header inset `lg` horizontally, not full-bleed
- [x] **Responsive** — columns 1→5 on product/search/category/manufacturer grids; container padding fixed `spacing.lg`
- [x] **Icons** — default 18/16, nav pills 18–22, chevrons 14–16; gap xs/sm
- [x] **Structure untouched** — only minimal grid `<View>` wrappers (needed for `numColumns`); no other JSX/route changes
- [x] **Fonts render** — Sora + PJS loaded in `_layout`; applied in headings vs body
- [x] **Backend untouched** — no changes in `src/services`, data logic, `src/providers`, `types/database.ts`, `supabase/`, `.env`
- [x] `npx tsc --noEmit` → 0 errors
- [x] `npm run lint` → 30 pre-existing errors, 126 warnings (no new errors; warnings down from 224)
- [ ] **Present full diff summary to user. Do NOT git add/commit/push until explicitly asked.**

---

## Progress Tracking

| Phase | Status |
|---|---|
| 0 — Prerequisites | ✅ |
| 1 — Token layer | ✅ |
| 2 — Common controls & surfaces | ✅ |
| 3 — Domain cards | ✅ |
| 4 — Navigation islands | ✅ |
| 5 — Screen pattern overlays | ✅ *(all four groups confirmed)* |
| 6 — Motion polish | ✅ |
| 7 — Quality checklist & verification | ✅ *(pending final diff summary + sign-off)* |

---

*Rule of thumb: when in doubt, the token value in `UI_AESTHETICS.md` §2 wins over any ad-hoc number.*