import React from "react";
import ProductForm, { ProductFormInput } from "../components/admin/ProductForm";
import { createProduct } from "../services/productService";

export default function AddProductScreen({ categories, manufacturers, navigation }: any) {

    const handleSubmit = async (input: ProductFormInput) => {
        try {
            await createProduct(input);
            console.log("Product upload successful!");
            navigation.goBack();
        } catch (error) {
            console.error("Upload error details:", error);
        }
    };

    return (
        <ProductForm
            categories={categories}
            manufacturers={manufacturers}
            submitLabel="Create Product"
            onSubmit={handleSubmit}
        />
    );
}