import { NextResponse } from "next/server";
import { AdminGuard } from "@/lib/auth/admin-guard";
import { getAdminDashboardMetricsAction } from "@/lib/actions/admin";

export async function GET() {
  try {
    // 1. Strict Server-Side Verification: Throws if unauthenticated or not ADMIN
    const admin = await AdminGuard.verifyAdmin();

    const metricsResult = await getAdminDashboardMetricsAction();

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      metrics: metricsResult.success ? metricsResult.data : null,
    });
  } catch (error: unknown) {
    const err = error as Error;
    const isUnauth = err?.message?.includes("UNAUTHENTICATED");
    const isForbidden = err?.message?.includes("FORBIDDEN");

    const status = isUnauth ? 401 : isForbidden ? 403 : 500;
    const code = isUnauth ? "UNAUTHORIZED" : isForbidden ? "FORBIDDEN" : "INTERNAL_ERROR";

    return NextResponse.json(
      {
        success: false,
        error: code,
        message: err?.message || "Access denied.",
      },
      { status }
    );
  }
}
