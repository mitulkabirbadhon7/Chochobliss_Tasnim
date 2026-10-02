import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const envCheck = {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    nodeEnv: process.env.NODE_ENV,
    hasFirebaseKey: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    hasFirebaseProjectId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    hasFirebaseClientEmail: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
    hasFirebasePrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
  };

  let firebaseAppImportError: any = null;
  let firebaseAuthImportError: any = null;

  try {
    const fa = await import("firebase-admin/app");
    firebaseAppImportError = "Loaded successfully: " + typeof fa.initializeApp;
  } catch (err: any) {
    firebaseAppImportError = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
    };
  }

  try {
    const fauth = await import("firebase-admin/auth");
    firebaseAuthImportError = "Loaded successfully: " + typeof fauth.getAuth;
  } catch (err: any) {
    firebaseAuthImportError = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
    };
  }

  let dbResult: any = null;
  try {
    const count = await prisma.product.count();
    dbResult = { productCount: count };
  } catch (err: any) {
    dbResult = { error: err?.message };
  }

  return NextResponse.json({
    status: "ok",
    envCheck,
    firebaseAppImportError,
    firebaseAuthImportError,
    dbResult,
  });
}
