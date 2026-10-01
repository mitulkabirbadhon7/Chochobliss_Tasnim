"use server";

import { prisma } from "@/lib/prisma";
import { SessionService } from "@/lib/auth/session";
import { AdminGuard } from "@/lib/auth/admin-guard";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createReviewSchema, type CreateReviewInput } from "@/lib/validations/review";
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  handleActionError,
  type ActionResult,
} from "@/lib/errors";
import { ReviewStatus } from "@/lib/constants/reviews";

/**
 * Creates a product review.
 * Strictly limited to verified buyers who have a DELIVERED order containing the product.
 * Rate limited to prevent spam submissions.
 */
export async function createReview(
  rawInput: unknown
): Promise<ActionResult<{ id: string; status: ReviewStatus; message: string }>> {
  try {
    // 1. Session Authentication
    const currentUser = await SessionService.getCurrentUser();
    if (!currentUser) {
      throw new AuthenticationError("You must be logged in to submit a review.");
    }

    // 2. Token-Bucket Rate Limiting (max 5 review attempts per hour)
    await enforceRateLimit("review:create", currentUser.id);

    // 3. Zod Input Validation
    const validation = createReviewSchema.safeParse(rawInput);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0]?.message || "Invalid review data.",
        validation.error.issues
      );
    }

    const input: CreateReviewInput = validation.data;

    // 4. Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: input.productId, deletedAt: null },
      select: { id: true, name: true },
    });

    if (!product) {
      throw new NotFoundError("The chocolate product could not be found.");
    }

    // 5. Asynchronous Verification: Check for DELIVERED order containing this product
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId: currentUser.id,
        status: "DELIVERED",
        items: {
          some: {
            productId: input.productId,
          },
        },
      },
      select: { id: true },
    });

    if (!deliveredOrder) {
      return {
        success: false,
        error: {
          code: "UNVERIFIED_BUYER",
          message: "Only verified buyers who have received this product can review it.",
        },
      };
    }

    // 6. Create review in PENDING status for moderation
    const review = await (prisma.review as any).create({
      data: {
        userId: currentUser.id,
        productId: input.productId,
        rating: input.rating,
        title: input.title?.trim() || null,
        comment: input.comment.trim(),
        status: ReviewStatus.PENDING,
        isApproved: false,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return {
      success: true,
      data: {
        id: review.id,
        status: review.status,
        message: "Thank you! Your verified review has been submitted for moderation.",
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Checks whether the currently logged-in user is a verified buyer for a product.
 */
export async function checkIsVerifiedBuyerAction(
  productId: string
): Promise<ActionResult<{ isVerified: boolean; isAuthenticated: boolean }>> {
  try {
    const currentUser = await SessionService.getCurrentUser();
    if (!currentUser) {
      return { success: true, data: { isVerified: false, isAuthenticated: false } };
    }

    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId: currentUser.id,
        status: "DELIVERED",
        items: {
          some: {
            productId,
          },
        },
      },
      select: { id: true },
    });

    return {
      success: true,
      data: {
        isVerified: Boolean(deliveredOrder),
        isAuthenticated: true,
      },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Fetches approved reviews for a specific product.
 */
export async function getProductReviewsAction(
  productId: string
): Promise<
  ActionResult<
    Array<{
      id: string;
      rating: number;
      title: string | null;
      comment: string;
      createdAt: Date;
      user: { name: string | null; email: string };
    }>
  >
> {
  try {
    const reviews = await (prisma.review as any).findMany({
      where: {
        OR: [
          { status: ReviewStatus.APPROVED },
          { isApproved: true },
        ],
        productId,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: reviews,
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Fetches curated approved reviews across all products for footer/testimonials.
 */
export async function getCuratedTestimonialsAction(
  limit = 3
): Promise<
  ActionResult<
    Array<{
      id: string;
      rating: number;
      title: string | null;
      comment: string;
      userName: string;
      productName: string;
    }>
  >
> {
  try {
    const reviews = await (prisma.review as any).findMany({
      where: {
        OR: [
          { status: ReviewStatus.APPROVED },
          { isApproved: true },
        ],
        rating: { gte: 4 },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true } },
      },
    });

    return {
      success: true,
      data: (reviews as any[]).map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        userName: r.user.name || "Verified Connoisseur",
        productName: r.product.name,
      })),
    };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Fetches all approved reviews across the entire site for the public Reviews section / modal.
 */
export async function getAllApprovedReviewsAction(): Promise<
  ActionResult<
    Array<{
      id: string;
      rating: number;
      title: string | null;
      comment: string;
      createdAt: Date;
      userName: string;
      productName: string;
      productSlug: string;
    }>
  >
> {
  try {
    const reviews = await (prisma.review as any).findMany({
      where: {
        OR: [
          { status: ReviewStatus.APPROVED },
          { isApproved: true },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, slug: true } },
      },
    });

    return {
      success: true,
      data: (reviews as any[]).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt,
        userName: r.user.name || "Verified Customer",
        productName: r.product.name,
        productSlug: r.product.slug,
      })),
    };
  } catch (error) {
    return handleActionError(error);
  }
}

// ==========================================
// ADMIN MODERATION ACTIONS
// ==========================================

export async function getAdminReviewsAction(): Promise<
  ActionResult<
    Array<{
      id: string;
      rating: number;
      title: string | null;
      comment: string;
      status: ReviewStatus;
      createdAt: Date;
      productName: string;
      userName: string;
      userEmail: string;
    }>
  >
> {
  try {
    await AdminGuard.verifyAdmin();

    const reviews = await (prisma.review as any).findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
    });

    return {
      success: true,
      data: (reviews as any[]).map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        status: r.status || (r.isApproved ? ReviewStatus.APPROVED : ReviewStatus.PENDING),
        createdAt: r.createdAt,
        productName: r.product.name,
        userName: r.user.name || "Customer",
        userEmail: r.user.email,
      })),
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function approveReviewAction(
  reviewId: string
): Promise<ActionResult<{ id: string; status: ReviewStatus }>> {
  try {
    await AdminGuard.verifyAdmin();

    const updated = await (prisma.review as any).update({
      where: { id: reviewId },
      data: {
        status: ReviewStatus.APPROVED,
        isApproved: true,
      },
      select: { id: true, status: true },
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function rejectReviewAction(
  reviewId: string
): Promise<ActionResult<{ id: string; status: ReviewStatus }>> {
  try {
    await AdminGuard.verifyAdmin();

    const updated = await (prisma.review as any).update({
      where: { id: reviewId },
      data: {
        status: ReviewStatus.REJECTED,
        isApproved: false,
      },
      select: { id: true, status: true },
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    return handleActionError(error);
  }
}
