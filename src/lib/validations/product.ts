import { z } from "zod";

/**
 * Base schema definition for Product attributes.
 */
export const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters.")
    .max(120, "Product name must not exceed 120 characters."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens.")
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be a positive number."),
  salePrice: z.coerce.number().positive("Sale price must be a positive number.").nullable().optional(),
  sku: z
    .string()
    .trim()
    .min(3, "SKU must be at least 3 characters.")
    .max(50, "SKU must not exceed 50 characters.")
    .toUpperCase(),
  inventory: z.coerce.number().int().min(0, "Inventory cannot be negative."),
  cacaoPercentage: z.coerce.number().int().min(0).max(100).nullable().optional(),
  origin: z.string().trim().max(100).nullable().optional(),
  flavorNotes: z.array(z.string().trim()).default([]),
  ingredients: z.string().trim().nullable().optional(),
  allergens: z.array(z.string().trim()).default([]),
  weight: z.string().trim().max(50).nullable().optional(),
  images: z
    .array(
      z.string().refine(
        (val) =>
          val.startsWith("http://") ||
          val.startsWith("https://") ||
          val.startsWith("/") ||
          val.startsWith("data:image/"),
        { message: "Each image must be a valid URL, local path, or image data." }
      )
    )
    .min(1, "At least one product image is required."),
  hoverImage: z
    .string()
    .refine(
      (val) =>
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("/") ||
        val.startsWith("data:image/"),
      { message: "Hover image must be a valid URL, local path, or image data." }
    )
    .nullable()
    .optional(),
  flavors: z.array(z.string().trim()).default([]),
  category: z.string().trim().min(1, "Category is required.").default("Bars"),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

/**
 * Schema for creating a product with sale price constraint.
 */
export const createProductSchema = productBaseSchema.refine(
  (data) => {
    if (data.salePrice != null) {
      return data.salePrice < data.price;
    }
    return true;
  },
  {
    message: "Sale price must be less than regular price.",
    path: ["salePrice"],
  }
);

/**
 * Schema for updating an existing product.
 */
export const updateProductSchema = productBaseSchema
  .partial()
  .refine(
    (data) => {
      if (data.salePrice != null && data.price != null) {
        return data.salePrice < data.price;
      }
      return true;
    },
    {
      message: "Sale price must be less than regular price.",
      path: ["salePrice"],
    }
  );

export const productFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  isFeatured: z.coerce.boolean().optional(),
  inStockOnly: z.coerce.boolean().optional(),
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
