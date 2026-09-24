import type { Product } from "../types/product";

/**
 * Canonical image resolver — admin side stores primary_image as source of truth,
 * older rows may only have image, some have secondary_image.
 * Order: primaryImage → image → secondaryImage
 */
export function getProductImageUri(product: Pick<Product, "image" | "primaryImage" | "secondaryImage"> | null | undefined): string | undefined {
  if (!product) return undefined;
  return product.primaryImage || product.image || product.secondaryImage || undefined;
}

export function resolveProductImage(product: Pick<Product, "image" | "primaryImage" | "secondaryImage"> | null | undefined, fallback?: string): string | undefined {
  return getProductImageUri(product) ?? fallback;
}
