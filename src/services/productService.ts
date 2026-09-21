/* src/services/productService.ts */

import { supabase } from "../lib/supabase";
import { ProductFormInput } from "../components/admin/ProductForm";
import { uploadToCloudinary } from "./cloudinaryService";
import type { Product } from "../types/product";

export type ProductFilters = {
  query?: string;
  categoryId?: string;
  manufacturerId?: string;
  brand?: string;
  page?: number;
  pageSize?: number;
};

export type ProductRow = {
  id: string;
  name: string;
  brand: string;
  generic_name: string;
  category_id: string;
  manufacturer_id: string;
  unit: string;
  description: string;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  stock: number;
  image: string | null;
  primary_image: string | null;
  secondary_image: string | null;
  batch_number: string | null;
  expiry_date: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
};

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    genericName: row.generic_name,
    manufacturerId: row.manufacturer_id,
    categoryId: row.category_id,
    description: row.description,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    discountPercent:
      row.discount_percent != null ? Number(row.discount_percent) : undefined,
    stock: Number(row.stock),
    unit: row.unit,
    image: row.image ?? undefined,
    primaryImage: row.primary_image ?? undefined,
    secondaryImage: row.secondary_image ?? undefined,
    isActive: row.is_active,
    isFeatured: row.is_featured ?? false,
    batchNumber: row.batch_number ?? undefined,
    expiryDate: row.expiry_date ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<{ data: Product[]; hasMore: boolean }> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.manufacturerId) {
    query = query.eq("manufacturer_id", filters.manufacturerId);
  }
  if (filters.brand) {
    query = query.ilike("brand", `%${filters.brand}%`);
  }
  if (filters.query) {
    query = query.or(
      `name.ilike.%${filters.query}%,brand.ilike.%${filters.query}%,generic_name.ilike.%${filters.query}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase products fetch error:", error.message);
    throw new Error(error.message);
  }

  const products = (data as ProductRow[] | null)?.map(mapProductRow) ?? [];
  return { data: products, hasMore: products.length === pageSize };
}

export async function getProductById(
  productId: string,
): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    console.error("Supabase single product fetch error:", error.message);
    throw new Error(error.message);
  }

  return data ? mapProductRow(data as ProductRow) : undefined;
}

export const createProduct = async (formInput: ProductFormInput) => {
  let primaryImageUrl = formInput.primaryImage || "";
  let secondaryImageUrl = formInput.secondaryImage || "";

  /* Primary image Cloudinary te upload */
  if (primaryImageUrl) {
    primaryImageUrl = await uploadToCloudinary(primaryImageUrl);
  }

  /* Secondary image Cloudinary te upload */
  if (secondaryImageUrl) {
    secondaryImageUrl = await uploadToCloudinary(secondaryImageUrl);
  }

  /* Main image URL set kora */
  const finalMainImage = primaryImageUrl || formInput.image || "";

  /* Supabase Database e insert */
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        name: formInput.name,
        brand: formInput.brand,
        generic_name: formInput.genericName,
        category_id: formInput.categoryId,
        manufacturer_id: formInput.manufacturerId,
        unit: formInput.unit,
        description: formInput.description,
        price: formInput.price,
        original_price: formInput.originalPrice,
        discount_percent: formInput.discountPercent,
        stock: formInput.stock,
        image: finalMainImage,
        primary_image: primaryImageUrl,
        secondary_image: secondaryImageUrl,
        batch_number: formInput.batchNumber,
        expiry_date: formInput.expiryDate,
        is_active: formInput.isActive,
        is_featured: formInput.isFeatured,
      },
    ])
    .select();

  if (error) {
    console.error("Supabase insert error:", error.message);
    throw new Error(error.message);
  }

  return data;
};