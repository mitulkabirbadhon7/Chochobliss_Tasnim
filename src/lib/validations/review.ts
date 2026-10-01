import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required."),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1 star.")
    .max(5, "Rating cannot exceed 5 stars."),
  title: z
    .string()
    .trim()
    .max(100, "Review title must not exceed 100 characters.")
    .nullable()
    .optional(),
  comment: z
    .string()
    .trim()
    .min(5, "Review comment must be at least 5 characters.")
    .max(1000, "Review comment must not exceed 1000 characters."),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
