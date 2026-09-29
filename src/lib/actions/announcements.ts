"use server";

import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AdminGuard } from "@/lib/auth/admin-guard";
import { enforceRateLimit } from "@/lib/rate-limit";
import { announcementSchema, type AnnouncementInput } from "@/lib/validations/announcement";
import {
  ValidationError,
  NotFoundError,
  handleActionError,
  type ActionResult,
} from "@/lib/errors";

function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag, "default");
  } catch {
    // Proceed silently in test runner
  }
}

/**
 * Cached fetch of active public storefront announcements.
 */
export const getCachedActiveAnnouncements = unstable_cache(
  async () => {
    const now = new Date();
    return prisma.announcement.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["active-announcements"],
  { revalidate: 1800, tags: ["announcements"] }
);

/**
 * Public action to retrieve active announcement banners.
 */
export async function getActiveAnnouncements(): Promise<
  ActionResult<Awaited<ReturnType<typeof getCachedActiveAnnouncements>>>
> {
  try {
    const data = await getCachedActiveAnnouncements();
    return { success: true, data };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Creates a new announcement banner.
 * Admin-only operation.
 */
export async function createAnnouncement(rawInput: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await AdminGuard.verifyAdmin();
    await enforceRateLimit("announcement:create", admin.id);

    const validation = announcementSchema.safeParse(rawInput);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0]?.message || "Invalid announcement data.",
        validation.error.issues
      );
    }

    const input: AnnouncementInput = validation.data;

    const created = await prisma.announcement.create({
      data: {
        title: input.title,
        content: input.content,
        bannerType: input.bannerType,
        linkUrl: input.linkUrl ?? null,
        bannerImage: input.bannerImage ?? null,
        isActive: input.isActive,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
      },
      select: { id: true },
    });

    safeRevalidateTag("announcements");

    return { success: true, data: created };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Deletes an announcement banner.
 * Admin-only operation.
 */
export async function deleteAnnouncement(announcementId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const admin = await AdminGuard.verifyAdmin();
    await enforceRateLimit("announcement:delete", admin.id);

    if (!announcementId || typeof announcementId !== "string") {
      throw new ValidationError("Valid announcement ID is required.");
    }

    const existing = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existing) {
      throw new NotFoundError("Announcement not found.");
    }

    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    safeRevalidateTag("announcements");

    return { success: true, data: { success: true } };
  } catch (error) {
    return handleActionError(error);
  }
}
