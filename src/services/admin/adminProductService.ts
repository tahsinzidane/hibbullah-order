import { supabase } from "../../lib/supabase";
import { ProductFormInput } from "../../components/admin/ProductForm";
import { uploadToCloudinary } from "../cloudinaryService";
import { getProductById, mapProductRow, type ProductRow } from "../productService";
import type { Product } from "../../types/product";

export const getAdminProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase admin products fetch error:", error.message);
    throw new Error(error.message);
  }

  return (data as ProductRow[] | null)?.map(mapProductRow) ?? [];
};

export const createProduct = async (formInput: ProductFormInput) => {
  console.log("[CreateProduct] Starting with input:", formInput);

  let primaryUrl = formInput.primaryImage || "";
  let secondaryUrl = formInput.secondaryImage || "";

  try {
    if (primaryUrl && !primaryUrl.startsWith("http")) {
      console.log("[Cloudinary] Uploading primary image...");
      primaryUrl = await uploadToCloudinary(primaryUrl);
    }

    if (secondaryUrl && !secondaryUrl.startsWith("http")) {
      console.log("[Cloudinary] Uploading secondary image...");
      secondaryUrl = await uploadToCloudinary(secondaryUrl);
    }
  } catch (cloudinaryErr: any) {
    console.error("[Cloudinary Error]:", cloudinaryErr);
    throw new Error(`Image Upload Failed: ${cloudinaryErr?.message || cloudinaryErr}`);
  }

  const finalMainImage = primaryUrl || formInput.image || secondaryUrl || "";

  const payload = {
    name: formInput.name,
    brand: formInput.brand,
    generic_name: formInput.genericName,
    category_id: formInput.categoryId,
    manufacturer_id: formInput.manufacturerId,
    unit: formInput.unit,
    description: formInput.description,
    price: Number(formInput.price),
    original_price: formInput.originalPrice ? Number(formInput.originalPrice) : null,
    discount_percent: formInput.discountPercent ? Number(formInput.discountPercent) : null,
    stock: Number(formInput.stock),
    image: finalMainImage,
    primary_image: primaryUrl,
    secondary_image: secondaryUrl,
    batch_number: formInput.batchNumber || null,
    expiry_date: formInput.expiryDate || null,
    is_active: formInput.isActive,
    is_featured: formInput.isFeatured,
  };

  console.log("[Supabase] Executing payload insert:", payload);

  const { data, error } = await supabase
    .from("products")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[Supabase Insert Error]:", error);
    throw new Error(`Database Error: ${error.message}`);
  }

  console.log("[Supabase] Upload Success:", data);
  return data ? mapProductRow(data as ProductRow) : undefined;
};

export const updateProduct = async (
  productId: string,
  formInput: ProductFormInput,
): Promise<Product> => {
  let primaryUrl = formInput.primaryImage || "";
  let secondaryUrl = formInput.secondaryImage || "";

  if (primaryUrl && !primaryUrl.startsWith("http")) {
    primaryUrl = await uploadToCloudinary(primaryUrl);
  }

  if (secondaryUrl && !secondaryUrl.startsWith("http")) {
    secondaryUrl = await uploadToCloudinary(secondaryUrl);
  }

  const finalMainImage = primaryUrl || formInput.image || secondaryUrl || "";

  const payload = {
    name: formInput.name,
    brand: formInput.brand,
    generic_name: formInput.genericName,
    category_id: formInput.categoryId,
    manufacturer_id: formInput.manufacturerId,
    unit: formInput.unit,
    description: formInput.description,
    price: Number(formInput.price),
    original_price: formInput.originalPrice ? Number(formInput.originalPrice) : null,
    discount_percent: formInput.discountPercent ? Number(formInput.discountPercent) : null,
    stock: Number(formInput.stock),
    image: finalMainImage,
    primary_image: primaryUrl,
    secondary_image: secondaryUrl,
    batch_number: formInput.batchNumber || null,
    expiry_date: formInput.expiryDate || null,
    is_active: formInput.isActive,
    is_featured: formInput.isFeatured,
  };

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    console.error("[Supabase Update Error]:", error);
    throw new Error(`Database Error: ${error.message}`);
  }

  return data ? mapProductRow(data as ProductRow) : (await getProductById(productId))!;
};

export const setProductActive = async (
  productId: string,
  isActive: boolean,
): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    console.error("[Supabase Active Toggle Error]:", error);
    throw new Error(`Database Error: ${error.message}`);
  }

  return mapProductRow(data as ProductRow);
};

export const deleteProduct = async (productId: string): Promise<void> => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("[Supabase Delete Error]:", error);
    throw new Error(`Database Error: ${error.message}`);
  }
};