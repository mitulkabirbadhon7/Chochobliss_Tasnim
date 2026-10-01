"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

import { ADMIN_CONTACT_EMAILS } from "@/lib/constants/admins";

import { contactFormSchema, type ContactFormInput } from "@/lib/validations/contact";

export type ContactInput = ContactFormInput;

export type ContactActionResult =
  | { success: true; data: { id: string; directMailtoUrl: string; adminEmails: string[] } }
  | { success: false; error: { code: string; message: string } };

export async function submitContactMessageAction(rawInput: unknown): Promise<ContactActionResult> {
  // 1. Rate limiting check
  const rateLimitResult = rateLimit("contact:submit", { maxTokens: 5, refillIntervalMs: 60000 });
  if (!rateLimitResult.success) {
    return {
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many messages sent. Please wait a moment." },
    };
  }

  // 2. Validation
  const validation = contactFormSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validation.error.issues[0]?.message || "Invalid input data.",
      },
    };
  }

  const { name, email, phone, category, subject, message } = validation.data;

  try {
    // 3. Save to database
    const savedMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        category,
        subject,
        message,
      },
    });

    // 4. Contact message persisted to Neon DB for admin inbox review

    // 5. Generate direct mailto link for direct sending as well
    const mailtoRecipients = ADMIN_CONTACT_EMAILS.join(",");
    const mailtoSubject = encodeURIComponent(`[ChocoBliss ${category}] ${subject}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nCategory: ${category}\n\nMessage:\n${message}\n\nSent via ChocoBliss Concierge`
    );
    const directMailtoUrl = `mailto:${mailtoRecipients}?subject=${mailtoSubject}&body=${mailtoBody}`;

    return {
      success: true,
      data: {
        id: savedMessage.id,
        directMailtoUrl,
        adminEmails: ADMIN_CONTACT_EMAILS,
      },
    };
  } catch (error) {
    console.error("Error saving contact message:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to transmit message. Please try again or write directly to our administrators.",
      },
    };
  }
}

export async function getContactMessagesAdminAction() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { success: true, data: messages };
  } catch {
    return { success: false, data: [] };
  }
}
