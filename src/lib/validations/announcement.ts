import { z } from "zod";

export const announcementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(150, "Title is too long."),
  content: z
    .string()
    .trim()
    .min(5, "Content must be at least 5 characters.")
    .max(500, "Content cannot exceed 500 characters."),
  bannerType: z.enum(["PROMO", "ANNOUNCEMENT", "ALERT"]).default("PROMO"),
  linkUrl: z.string().url("Link must be a valid URL.").nullable().optional(),
  bannerImage: z.string().url("Banner image must be a valid URL.").nullable().optional(),
  isActive: z.boolean().default(true),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
