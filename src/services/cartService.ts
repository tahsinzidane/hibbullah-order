import config from "../constants/config";
import { isBackendReady } from "../lib/env";
import { supabase } from "../lib/supabase";
import type { CartItem, CartSummary } from "../types/cart";
import type { Database } from "../types/database";
import type { Product } from "../types/product";
import { store } from "./mockData";
import { getProductById } from "./productService";

type CartItemRow = Database["public"]["Tables"]["cart_items"]["Row"];

type AuthCtx = {
  id: string;
  email: string | null;
};

async function getCurrentAuthUser(): Promise<AuthCtx | null> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

function shouldPersistToDatabase(userId: string | null): userId is string {
  return Boolean(userId && isBackendReady());
}

function refreshCartProducts(): void {
  store.cartItems.forEach((item) => {
    const product = store.products.find((entry) => entry.id === item.productId);
    if (product) item.product = product;
  });
}

async function resolveProduct(productId: string): Promise<Product | undefined> {
  const mockProduct = store.products.find((entry) => entry.id === productId);
  if (mockProduct) return mockProduct;
  try {
    return await getProductById(productId);
  } catch {
    return undefined;
  }
}

function buildSnapshotProduct(row: CartItemRow): Product {
  return {
    id: row.product_id,
    name: row.product_name || "Product unavailable",
    brand: "",
    genericName: "",
    manufacturerId: "",
    categoryId: "",
    description: "",
    price: Number(row.unit_price) || 0,
    stock: row.quantity,
    unit: "",
    image: row.product_image ?? undefined,
    isActive: true,
    createdAt: row.created_at,
  };
}

async function mapRowsToCartItems(rows: CartItemRow[]): Promise<CartItem[]> {
  const items: CartItem[] = [];
  for (const row of rows) {
    const product = await resolveProduct(row.product_id);

    if (product) {
      items.push({
        id: row.id,
        productId: row.product_id,
        quantity: row.quantity,
        unitPrice: Number(row.unit_price),
        userEmail: row.user_email ?? undefined,
        product: {
          ...product,
          name: row.product_name || product.name,
          image: row.product_image ?? product.image,
        },
      });
      continue;
    }

    // The live product row may be gone (deleted/unpublished) — fall back to the
    // snapshot stored on the cart item so the row can still be rendered.
    items.push({
      id: row.id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPrice: Number(row.unit_price),
      userEmail: row.user_email ?? undefined,
      product: buildSnapshotProduct(row),
    });
  }
  return items;
}

function effectiveUnitPrice(item: CartItem): number {
  return item.unitPrice ?? item.product.price;
}

export function summarizeCart(
  items: CartItem[] = store.cartItems,
): CartSummary {
  const subtotal = items.reduce(
    (sum, item) => sum + effectiveUnitPrice(item) * item.quantity,
    0,
  );
  const discount = items.reduce((sum, item) => {
    const original = item.product.originalPrice ?? item.product.price;
    return sum + Math.max(0, original - effectiveUnitPrice(item)) * item.quantity;
  }, 0);
  const deliveryFee = items.length ? config.deliveryFee : 0;
  return {
    subtotal,
    discount,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
}

export async function getCartItems(): Promise<CartItem[]> {
  const userId = (await getCurrentAuthUser())?.id ?? null;

  if (shouldPersistToDatabase(userId)) {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    return mapRowsToCartItems(data ?? []);
  }

  refreshCartProducts();
  return [...store.cartItems];
}

export async function getCartSummary(): Promise<CartSummary> {
  const userId = (await getCurrentAuthUser())?.id ?? null;

  if (shouldPersistToDatabase(userId)) {
    return summarizeCart(await getCartItems());
  }

  refreshCartProducts();
  return summarizeCart();
}

export async function addToCart(
  productId: string,
  quantity: number,
): Promise<CartItem[]> {
  const product = await resolveProduct(productId);

  if (!product || !product.isActive)
    throw new Error("This product is unavailable.");
  if (
    product.expiryDate &&
    new Date(product.expiryDate).getTime() <= Date.now()
  ) {
    throw new Error("This product has expired and cannot be added.");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Choose a valid quantity.");
  }
  if (product.stock < quantity)
    throw new Error("Not enough stock for that quantity.");

  const authUser = await getCurrentAuthUser();
  const userId = authUser?.id ?? null;

  if (shouldPersistToDatabase(userId)) {
    const { data: existingRow, error: fetchError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);

    const nextQuantity = (existingRow?.quantity ?? 0) + quantity;
    if (nextQuantity > product.stock) {
      throw new Error("The requested quantity exceeds available stock.");
    }

    // Snapshot the product + user metadata alongside the price so the cart can
    // still render correctly even if the live product row changes or is deleted.
    const snapshot = {
      user_id: userId,
      user_email: authUser?.email ?? null,
      product_id: productId,
      product_name: product.name,
      product_image: product.image ?? null,
      unit_price: product.price,
    };

    if (existingRow) {
      const { error } = await supabase
        .from("cart_items")
        .update({
          ...snapshot,
          quantity: nextQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRow.id);

      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("cart_items")
        .upsert(
          { ...snapshot, quantity: nextQuantity },
          { onConflict: "user_id, product_id" },
        );

      if (error) throw new Error(error.message);
    }

    return getCartItems();
  }

  const existing = store.cartItems.find((item) => item.productId === productId);
  if (existing) {
    if (existing.quantity + quantity > product.stock) {
      throw new Error("The requested quantity exceeds available stock.");
    }
    existing.quantity += quantity;
  } else {
    store.cartItems.push({
      id: `cart-${Date.now()}`,
      productId,
      quantity,
      product,
    });
  }
  return [...store.cartItems];
}

export async function updateCartQuantity(
  itemId: string,
  quantity: number,
): Promise<CartItem[]> {
  if (!Number.isInteger(quantity)) throw new Error("Choose a valid quantity.");

  const userId = (await getCurrentAuthUser())?.id ?? null;

  if (shouldPersistToDatabase(userId)) {
    if (quantity <= 0) {
      return removeCartItem(itemId);
    }

    const { data: row, error: fetchError } = await supabase
      .from("cart_items")
      .select("id, product_id")
      .eq("id", itemId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!row) throw new Error("Cart item not found.");

    const product = await resolveProduct(row.product_id);
    if (product && quantity > product.stock) {
      throw new Error("The requested quantity exceeds available stock.");
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", itemId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);

    return getCartItems();
  }

  const item = store.cartItems.find((entry) => entry.id === itemId);
  if (!item) throw new Error("Cart item not found.");
  if (quantity > item.product.stock)
    throw new Error("The requested quantity exceeds available stock.");
  if (quantity <= 0) {
    store.cartItems = store.cartItems.filter((entry) => entry.id !== itemId);
  } else {
    item.quantity = quantity;
  }
  return [...store.cartItems];
}

export async function removeFromCart(productId: string): Promise<CartItem[]> {
  const userId = (await getCurrentAuthUser())?.id ?? null;

  if (shouldPersistToDatabase(userId)) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw new Error(error.message);

    return getCartItems();
  }

  store.cartItems = store.cartItems.filter(
    (entry) => entry.productId !== productId,
  );
  return [...store.cartItems];
}

export async function removeCartItem(itemId: string): Promise<CartItem[]> {
  const userId = (await getCurrentAuthUser())?.id ?? null;

  if (shouldPersistToDatabase(userId)) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);

    return getCartItems();
  }

  store.cartItems = store.cartItems.filter((entry) => entry.id !== itemId);
  return [...store.cartItems];
}

export async function clearCart(): Promise<void> {
  const userId = (await getCurrentAuthUser())?.id ?? null;

  if (shouldPersistToDatabase(userId)) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return;
  }

  store.cartItems = [];
}