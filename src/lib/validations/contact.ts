import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  phone: z.string().optional(),
  category: z.enum(["COMPLAINT", "INQUIRY", "FEEDBACK", "CUSTOM_ORDER", "GENERAL"]).default("GENERAL"),
  subject: z.string().min(3, "Subject must be at least 3 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
