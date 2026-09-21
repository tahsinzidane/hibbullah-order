import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, CartSummary } from "../types/cart";
import * as cartService from "../services/cartService";
import { isBackendReady } from "../lib/env";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthProvider";

type CartContextValue = {
  items: CartItem[];
  summary: CartSummary;
  loading: boolean;
  itemCount: number;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

const emptySummary: CartSummary = { subtotal: 0, discount: 0, deliveryFee: 0, total: 0 };

export function CartProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.userId ?? null;

  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>(emptySummary);
  const [loading, setLoading] = useState(true);

  const itemsRef = useRef<CartItem[]>([]);
  const commitItems = useCallback((next: CartItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const refresh = useCallback(async () => {
    const nextItems = await cartService.getCartItems();
    commitItems(nextItems);
    setSummary(cartService.summarizeCart(nextItems));
    setLoading(false);
  }, [commitItems]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const nextItems = await cartService.getCartItems();
        if (!active) return;
        commitItems(nextItems);
        setSummary(cartService.summarizeCart(nextItems));
      } catch (err) {
        console.warn("Failed to sync cart:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [commitItems, userId]);

  // Keep the local cart in sync with the database in real time (multiple
  // devices, checkout clearing the cart, etc.) for the authenticated user.
  useEffect(() => {
    if (!userId || !isBackendReady()) return;

    const channel = supabase
      .channel(`cart-items-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          refresh().catch(() => {
            console.warn("Failed to sync cart on realtime change.");
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh, userId]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const next = await cartService.addToCart(productId, quantity);
      commitItems(next);
      setSummary(cartService.summarizeCart(next));
    },
    [commitItems],
  );

  const setQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const previous = itemsRef.current;
      const optimistic =
        quantity <= 0
          ? previous.filter((entry) => entry.id !== itemId)
          : previous.map((entry) =>
              entry.id === itemId ? { ...entry, quantity } : entry,
            );

      commitItems(optimistic);
      setSummary(cartService.summarizeCart(optimistic));
      try {
        const next = await cartService.updateCartQuantity(itemId, quantity);
        commitItems(next);
        setSummary(cartService.summarizeCart(next));
      } catch (err) {
        commitItems(previous);
        setSummary(cartService.summarizeCart(previous));
        throw err;
      }
    },
    [commitItems],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const previous = itemsRef.current;
      const target = previous.find((entry) => entry.id === itemId);

      commitItems(previous.filter((entry) => entry.id !== itemId));
      setSummary(
        cartService.summarizeCart(previous.filter((entry) => entry.id !== itemId)),
      );
      try {
        const next = target
          ? await cartService.removeFromCart(target.productId)
          : await cartService.removeCartItem(itemId);
        commitItems(next);
        setSummary(cartService.summarizeCart(next));
      } catch (err) {
        commitItems(previous);
        setSummary(cartService.summarizeCart(previous));
        throw err;
      }
    },
    [commitItems],
  );

  const value = useMemo(
    () => ({
      items,
      summary,
      loading,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      refresh,
      addItem,
      setQuantity,
      removeItem,
    }),
    [items, summary, loading, refresh, addItem, setQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}