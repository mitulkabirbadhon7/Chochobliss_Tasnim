"use server";

import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AdminGuard } from "@/lib/auth/admin-guard";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  createProductSchema,
  updateProductSchema,
  productFilterSchema,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductFilterInput,
} from "@/lib/validations/product";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  handleActionError,
  type ActionResult,
} from "@/lib/errors";
import { Prisma } from "@prisma/client";

/**
 * Helper to slugify product name when slug is not explicitly provided.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Safely invalidates Next.js cache tags without throwing in test runners.
 */
function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag, "default");
  } catch {
    // Suppressed when called outside of Next.js request context (e.g., in unit tests)
  }
}

// ==========================================
// READ OPERATIONS (CACHED)
// ==========================================

/**
 * Internal query to fetch active storefront products.
 */
async function fetchStorefrontProducts(filters?: ProductFilterInput) {
  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    isPublished: true,
  };

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.isFeatured !== undefined) {
    where.isFeatured = filters.isFeatured;
  }

  if (filters?.inStockOnly) {
    where.inventory = { gt: 0 };
  }

  if (filters?.minPrice || filters?.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { origin: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
    })),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

/**
 * Cached storefront product listing.
 */
export const getCachedProducts = unstable_cache(
  async (filters?: ProductFilterInput) => fetchStorefrontProducts(filters),
  ["storefront-products"],
  { revalidate: 3600, tags: ["products"] }
);

/**
 * Public action to retrieve storefront products.
 */
export async function getProducts(
  rawFilters?: unknown
): Promise<ActionResult<Awaited<ReturnType<typeof fetchStorefrontProducts>>>> {
  try {
    const filters = rawFilters ? productFilterSchema.parse(rawFilters) : undefined;
    const data = await getCachedProducts(filters);
    return { success: true, data };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Cached product detail query by slug.
 */
export const getCachedProductBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      const product = await prisma.product.findFirst({
        where: {
          slug,
          deletedAt: null,
          isPublished: true,
        },
      });

      if (!product) return null;

      return {
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
      };
    },
    [`product-${slug}`],
    { revalidate: 3600, tags: ["products", `product-${slug}`] }
  )();

/**
 * Public action to get product details by slug.
 */
export async function getProductBySlug(
  slug: string
): Promise<ActionResult<NonNullable<Awaited<ReturnType<typeof getCachedProductBySlug>>>>> {
  try {
    if (!slug || typeof slug !== "string") {
      throw new ValidationError("A valid product slug is required.");
    }

    const product = await getCachedProductBySlug(slug);
    if (!product) {
      throw new NotFoundError("Product not found or unavailable.");
    }

    return { success: true, data: product };
  } catch (error) {
    return handleActionError(error);
  }
}

// ==========================================
// MUTATIONS (ADMIN ONLY, RATE LIMITED, VALIDATED)
// ==========================================

/**
 * Creates a new artisanal chocolate product.
 * Restricted strictly to verified ADMIN users.
 */
export async function createProduct(rawInput: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // 1. Verify Admin privilege server-side
    const admin = await AdminGuard.verifyAdmin();

    // 2. Rate limit mutation
    await enforceRateLimit("product:create", admin.id);

    // 3. Strict Server-Side Zod Validation
    const validation = createProductSchema.safeParse(rawInput);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0]?.message || "Invalid product data.",
        validation.error.issues
      );
    }

    const input: CreateProductInput = validation.data;
    const generatedSlug = input.slug || slugify(input.name);

    // 4. Check for duplicate slug or SKU
    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug: generatedSlug }, { sku: input.sku }],
      },
    });

    if (existing) {
      if (existing.slug === generatedSlug) {
        throw new ConflictError("A product with this slug already exists.");
      }
      if (existing.sku === input.sku) {
        throw new ConflictError("A product with this SKU already exists.");
      }
    }

    // 5. Database creation
    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: generatedSlug,
        description: input.description,
        price: new Prisma.Decimal(input.price),
        salePrice: input.salePrice != null ? new Prisma.Decimal(input.salePrice) : null,
        sku: input.sku,
        inventory: input.inventory,
        cacaoPercentage: input.cacaoPercentage ?? null,
        origin: input.origin ?? null,
        flavorNotes: input.flavorNotes,
        ingredients: input.ingredients ?? null,
        allergens: input.allergens,
        weight: input.weight ?? null,
        images: input.images,
        category: input.category,
        isFeatured: input.isFeatured,
        isPublished: input.isPublished,
      },
      select: { id: true, slug: true },
    });

    // 6. Cache Invalidation
    safeRevalidateTag("products");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Updates an existing product.
 * Restricted strictly to verified ADMIN users.
 */
export async function updateProduct(
  productId: string,
  rawInput: unknown
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    // 1. Verify Admin privilege server-side
    const admin = await AdminGuard.verifyAdmin();

    // 2. Rate limit mutation
    await enforceRateLimit("product:update", admin.id);

    // 3. Validate ID
    if (!productId || typeof productId !== "string") {
      throw new ValidationError("Valid product ID required.");
    }

    // 4. Validate partial input
    const validation = updateProductSchema.safeParse(rawInput);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0]?.message || "Invalid update data.",
        validation.error.issues
      );
    }

    const input: UpdateProductInput = validation.data;

    // 5. Verify target exists and is not soft-deleted
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing || existing.deletedAt !== null) {
      throw new NotFoundError("Product not found or has been deleted.");
    }

    // 6. Check unique constraints if updating slug or sku
    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await prisma.product.findUnique({ where: { slug: input.slug } });
      if (slugConflict) throw new ConflictError("Slug already in use by another product.");
    }

    if (input.sku && input.sku !== existing.sku) {
      const skuConflict = await prisma.product.findUnique({ where: { sku: input.sku } });
      if (skuConflict) throw new ConflictError("SKU already in use by another product.");
    }

    // 7. Update in database
    const updateData: Prisma.ProductUpdateInput = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.price !== undefined) updateData.price = new Prisma.Decimal(input.price);
    if (input.salePrice !== undefined) {
      updateData.salePrice = input.salePrice != null ? new Prisma.Decimal(input.salePrice) : null;
    }
    if (input.sku !== undefined) updateData.sku = input.sku;
    if (input.inventory !== undefined) updateData.inventory = input.inventory;
    if (input.cacaoPercentage !== undefined) updateData.cacaoPercentage = input.cacaoPercentage;
    if (input.origin !== undefined) updateData.origin = input.origin;
    if (input.flavorNotes !== undefined) updateData.flavorNotes = input.flavorNotes;
    if (input.ingredients !== undefined) updateData.ingredients = input.ingredients;
    if (input.allergens !== undefined) updateData.allergens = input.allergens;
    if (input.weight !== undefined) updateData.weight = input.weight;
    if (input.images !== undefined) updateData.images = input.images;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;
    if (input.isPublished !== undefined) updateData.isPublished = input.isPublished;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      select: { id: true, slug: true },
    });

    // 8. Cache Invalidation
    safeRevalidateTag("products");
    safeRevalidateTag(`product-${existing.slug}`);
    if (updated.slug !== existing.slug) {
      safeRevalidateTag(`product-${updated.slug}`);
    }

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Soft-deletes a product by setting deletedAt timestamp.
 * Preserves historical references in existing orders.
 * Restricted strictly to verified ADMIN users.
 */
export async function deleteProduct(productId: string): Promise<ActionResult<{ success: boolean; id: string }>> {
  try {
    // 1. Verify Admin privilege server-side
    const admin = await AdminGuard.verifyAdmin();

    // 2. Rate limit mutation
    await enforceRateLimit("product:delete", admin.id);

    // 3. Validate ID
    if (!productId || typeof productId !== "string") {
      throw new ValidationError("Valid product ID required.");
    }

    // 4. Verify product exists
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing || existing.deletedAt !== null) {
      throw new NotFoundError("Product not found or already deleted.");
    }

    // 5. Perform Soft Deletion
    await prisma.product.update({
      where: { id: productId },
      data: {
        deletedAt: new Date(),
        isPublished: false,
      },
    });

    // 6. Cache Invalidation
    safeRevalidateTag("products");
    safeRevalidateTag(`product-${existing.slug}`);

    return {
      success: true,
      data: { success: true, id: productId },
    };
  } catch (error) {
    return handleActionError(error);
  }
}
