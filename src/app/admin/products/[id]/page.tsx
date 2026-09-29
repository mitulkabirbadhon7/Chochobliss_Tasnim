import React from "react";
import { notFound } from "next/navigation";
import { AdminGuard } from "@/lib/auth/admin-guard";
import { getAdminProductByIdAction } from "@/lib/actions/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await AdminGuard.verifyAdmin();
  const { id } = await params;

  const res = await getAdminProductByIdAction(id);
  if (!res.success || !res.data) {
    notFound();
  }

  const p = res.data;

  return (
    <ProductForm
      isEdit={true}
      initialData={{
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice,
        sku: p.sku,
        inventory: p.inventory,
        cacaoPercentage: p.cacaoPercentage,
        origin: p.origin,
        flavorNotes: p.flavorNotes,
        ingredients: p.ingredients,
        allergens: p.allergens,
        weight: p.weight,
        images: p.images,
        category: p.category,
        isFeatured: p.isFeatured,
        isPublished: p.isPublished,
      }}
    />
  );
}
