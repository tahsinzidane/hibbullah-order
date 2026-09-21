# Client-Side Navigation Guard Implementation Guide

A client-side navigation guard has been implemented to enforce mandatory profile completion before accessing the Checkout screen, following React Native, Expo Router (v57), TypeScript, and Supabase best practices.

---

### Architecture & Implementation Overview


```

┌────────────────────────────────────────────────────────┐
│ UI Layer                                               │
│ • checkout.tsx (Guarded Screen with ActivityIndicator) │
│ • ProfileGuard.tsx (Reusable Navigation Guard Wrapper) │
│ • profile.tsx (Error Param Warning Banner & Form)      │
└──────────────────────────┬─────────────────────────────┘
│
┌──────────────────────────▼─────────────────────────────┐
│ Hook Layer (useUserProfile.ts)                         │
│ • supabase.auth.getUser() session resolution           │
│ • Completeness check: full_name, phone_number, address │
│ • isProfileComplete boolean & missingFields array      │
└──────────────────────────┬─────────────────────────────┘
│
┌──────────────────────────▼─────────────────────────────┐
│ Domain Service Layer (profileService.ts)               │
│ • Database queries: profiles table (Supabase)          │
│ • snake_case -> camelCase mapping (UserProfile domain) │
│ • Mock fallback support when env.useMock is enabled    │
└────────────────────────────────────────────────────────┘

```

---

### 1. Supabase Profile Check Hook & Domain Service

#### `src/types/user.ts`

Domain contracts matching `camelCase` requirements without leaking database `snake_case` column names into React components:

```typescript
export type UserProfile = {
  id: string;
  fullName: string | null;
  phoneNumber: string | null;
  shippingAddress: string | null;
  email?: string | null;
  role?: "customer" | "admin";
  avatar?: string;
  createdAt?: string | null;
};

export type UpdateUserProfileInput = {
  fullName: string;
  phoneNumber: string;
  shippingAddress: string;
  email?: string;
};

export type RequiredProfileField = "full_name" | "phone_number" | "shipping_address";

```

#### `profileService.ts`

Handles data access to Supabase profiles with fallback to mock data when `env.useMock` is active:

* **`profileService.ts:10`**: Queries profiles for `full_name`, `phone_number`, `shipping_address`, and maps to `UserProfile`.
* **`profileService.ts:68`**: Upserts mandatory profile fields into Supabase profiles.

#### `useUserProfile.ts`

Reusable hook fetching the authenticated user with `supabase.auth.getUser()`:

* **`isProfileComplete`**: Evaluates to `true` only if `fullName`, `phoneNumber`, and `shippingAddress` are all non-null, defined, and contain non-empty trimmed strings.
* **`missingFields`**: Returns an array of missing fields (`"full_name"` | `"phone_number"` | `"shipping_address"`) for granular UI feedback.
* **`updateProfile` & `refetch**`: Methods to mutate and synchronize state.

---

### 2. Navigation Guard Implementation

#### `ProfileGuard.tsx`

A reusable wrapper component for guarding any screen:

```tsx
<ProfileGuard>
  <CheckoutScreenContent/>
</ProfileGuard>

```

#### `checkout.tsx`

Integrated directly into the Checkout screen:

1. **Loading State**: Displays a centered `ActivityIndicator` at `checkout.tsx:85` while profile data is resolving.
2. **Completeness Check**: If `isProfileComplete === false`, triggers `Alert.alert` informing the user why they are being redirected and calls:
```typescript
router.replace({
  pathname: "/(customer)/account/profile",
  params: { error: "please_complete_profile" },
});

```


3. **Data Prefill**: Once verified, the user's verified `shippingAddress` automatically pre-fills the checkout delivery address.

---

### 3. Profile Screen Handling

#### `profile.tsx`

1. **Route Param Detection**:
```typescript
const params = useLocalSearchParams<{ error?: string }>();
const isRedirectedFromCheckout = params.error === "please_complete_profile";

```


2. **Warning Banner**: If `isRedirectedFromCheckout` is `true`, displays an alert banner explaining that mandatory profile fields are missing, rendering badges for each missing field (`full_name`, `phone_number`, `shipping_address`).
3. **Mandatory Field Inputs**:
* Full name *
* Phone number *
* Shipping address * (multiline address with Bangladesh District/Upazila selector integration)


4. **Supabase Mutation & Return**:
* Calls `updateProfile` to upsert changes to the Supabase `profiles` table.
* Refreshes auth and profile states.
* Prompts the user with an alert: *"Save & Proceed to Checkout"*, triggering `router.replace("/(customer)/checkout")`.



---

### Verification

* **TypeScript Check**: `npx tsc --noEmit` passed with 0 errors.
* **Restricted Files**: No restricted files (`supabase.ts`, `authService.ts`, `session.ts`, `storage.ts`, `AuthProvider.tsx`, `supabase/migrations/*`, `package.json`) were altered.

```

```