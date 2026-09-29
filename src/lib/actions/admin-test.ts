"use server";

import { AdminGuard } from "@/lib/auth/admin-guard";
import type { ActionResult } from "@/lib/actions/auth";

/**
 * Protected Admin Server Action for verifying server-side administrative access.
 * Non-admin users calling this will be rejected with an authorization error.
 */
export async function executeAdminTaskAction(taskName: string): Promise<ActionResult<{ executedBy: string; task: string }>> {
  try {
    const adminUser = await AdminGuard.verifyAdmin();

    return {
      success: true,
      data: {
        executedBy: adminUser.email,
        task: taskName,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Access denied.";
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message,
      },
    };
  }
}
