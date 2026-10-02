import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SessionService } from "@/lib/auth/session";

export async function GET() {
  const envCheck = {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    databaseUrlHost: process.env.DATABASE_URL ? process.env.DATABASE_URL.split("@")[1]?.split("/")[0] : null,
    nodeEnv: process.env.NODE_ENV,
    hasFirebaseKey: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    hasFirebaseProjectId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  };

  let sessionResult: any = null;
  let sessionError: any = null;

  try {
    const user = await SessionService.getCurrentUser();
    sessionResult = { user };
  } catch (err: any) {
    sessionError = {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    };
  }

  let dbResult: any = null;
  let dbError: any = null;

  try {
    const count = await prisma.product.count();
    dbResult = { productCount: count };
  } catch (err: any) {
    dbError = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
    };
  }

  return NextResponse.json({
    status: "ok",
    envCheck,
    sessionResult,
    sessionError,
    dbResult,
    dbError,
  });
}
