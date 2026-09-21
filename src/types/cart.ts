import type { Product } from "./product";

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  /** Snapshot of the unit price at the time the item was added to the cart. */
  unitPrice?: number;
  /** Snapshot of the authenticated user's email stored alongside the item. */
  userEmail?: string;
  product: Product;
};

export type CartSummary = {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};
