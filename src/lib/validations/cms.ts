import { z } from "zod";

export const siteContentSchema = z.object({
  key: z.string().min(1, "Content key is required.").max(100),
  title: z.string().min(1, "Title is required.").max(200),
  content: z.record(z.string(), z.any()),
  mediaUrl: z.string().nullable().optional(),
});

export type SiteContentInput = z.infer<typeof siteContentSchema>;
