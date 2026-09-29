import React from "react";
import { AdminGuard } from "@/lib/auth/admin-guard";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await AdminGuard.verifyAdmin();

  return <ProductForm isEdit={false} />;
}
