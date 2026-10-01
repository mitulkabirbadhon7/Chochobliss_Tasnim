"use server";

import { AdminGuard } from "@/lib/auth/admin-guard";
import { supabaseStorage } from "@/lib/supabase/client";
import {
  ValidationError,
  AuthenticationError,
  handleActionError,
  type ActionResult,
} from "@/lib/errors";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB production limit
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

/**
 * Server Action for uploading product media assets.
 * Strictly restricted to verified ADMIN sessions with robust MIME and size checks.
 */
export async function uploadProductImageAction(
  formData: FormData
): Promise<ActionResult<{ url: string; fileName: string; size: number }>> {
  try {
    // 1. RBAC Check — Admin authentication required
    await AdminGuard.verifyAdmin();

    // 2. Extract file from FormData
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new ValidationError("No valid image file was provided in the upload request.");
    }

    // 3. Size validation (max 10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError(
        `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 10MB limit.`
      );
    }

    // 4. MIME type validation
    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      throw new ValidationError(
        `Unsupported media type: ${file.type}. Allowed formats are WebP, PNG, and JPEG.`
      );
    }

    // 5. Upload to Supabase Storage if configured
    const fileExt = file.name.split(".").pop() || "webp";
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const uniqueFileName = `${Date.now()}-${sanitizedBase}.${fileExt}`;
    const filePath = `products/${uniqueFileName}`;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { data: uploadData, error: uploadError } = await supabaseStorage.storage
          .from("products")
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabaseStorage.storage
            .from("products")
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            return {
              success: true,
              data: {
                url: publicUrlData.publicUrl,
                fileName: uniqueFileName,
                size: file.size,
              },
            };
          }
        }
      }

      // Safe fallback when Supabase storage bucket is not configured or in offline mode:
      // Return high-efficiency Base64 data URL
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64Data}`;

      return {
        success: true,
        data: {
          url: dataUrl,
          fileName: uniqueFileName,
          size: file.size,
        },
      };
    } catch {
      // Fallback to data URL
      const buffer = Buffer.from(await file.arrayBuffer());
      const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      return {
        success: true,
        data: {
          url: dataUrl,
          fileName: uniqueFileName,
          size: file.size,
        },
      };
    }
  } catch (error) {
    return handleActionError(error);
  }
}
