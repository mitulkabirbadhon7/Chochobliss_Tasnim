"use server";

import { prisma } from "@/lib/prisma";
import { SessionService } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  handleActionError,
  type ActionResult,
} from "@/lib/errors";

export interface WishlistItemDetail {
  id: string;
  productId: string;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    inventory: number;
    images: string[];
    category: string;
    cacaoPercentage: number | null;
  };
}

/**
 * Retrieves the current authenticated user's wishlist items.
 * Strictly limited to the current user's own items.
 */
export async function getWishlistAction(): Promise<ActionResult<WishlistItemDetail[]>> {
  try {
    const user = await SessionService.getCurrentUser();
    if (!user) {
      throw new AuthenticationError("Sign in to access your wishlist.");
    }

    const items = await prisma.wishlistItem.findMany({
      where: {
        userId: user.id,
        product: {
          deletedAt: null,
          isPublished: true,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            inventory: true,
            images: true,
            category: true,
            cacaoPercentage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted: WishlistItemDetail[] = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: Number(item.product.price),
        salePrice: item.product.salePrice ? Number(item.product.salePrice) : null,
        inventory: item.product.inventory,
        images: item.product.images,
        category: item.product.category,
        cacaoPercentage: item.product.cacaoPercentage,
      },
    }));

    return { success: true, data: formatted };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Toggles a product in the authenticated user's wishlist.
 */
export async function toggleWishlistAction(
  productId: string
): Promise<ActionResult<{ inWishlist: boolean }>> {
  try {
    const user = await SessionService.getCurrentUser();
    if (!user) {
      throw new AuthenticationError("Sign in to save items to your wishlist.");
    }

    if (!productId || typeof productId !== "string") {
      throw new ValidationError("Valid product ID is required.");
    }

    await enforceRateLimit("user:wishlist:toggle", user.id);

    // Verify product exists and is active
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        isPublished: true,
      },
    });

    if (!product) {
      throw new NotFoundError("Product not found or unavailable.");
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      return { success: true, data: { inWishlist: false } };
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          productId,
        },
      });
      return { success: true, data: { inWishlist: true } };
    }
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Removes an item from the wishlist by wishlist item ID.
 * Strictly verifies ownership.
 */
export async function removeFromWishlistAction(
  wishlistId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await SessionService.getCurrentUser();
    if (!user) {
      throw new AuthenticationError("Sign in to manage your wishlist.");
    }

    if (!wishlistId || typeof wishlistId !== "string") {
      throw new ValidationError("Valid wishlist item ID is required.");
    }

    const item = await prisma.wishlistItem.findUnique({
      where: { id: wishlistId },
    });

    if (!item) {
      throw new NotFoundError("Wishlist item not found.");
    }

    if (item.userId !== user.id) {
      throw new AuthorizationError("You cannot modify another user's wishlist.");
    }

    await prisma.wishlistItem.delete({
      where: { id: wishlistId },
    });

    return { success: true, data: { success: true } };
  } catch (error) {
    return handleActionError(error);
  }
}
