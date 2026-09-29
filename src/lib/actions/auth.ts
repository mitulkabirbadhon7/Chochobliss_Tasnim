"use server";

import { adminAuth } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { SessionService, SESSION_DURATION_MS, type SessionUser } from "@/lib/auth/session";
import { loginSchema, registerSchema, passwordResetSchema } from "@/lib/validations/auth";

import { FIXED_ADMIN_EMAILS } from "@/lib/constants/admins";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

/**
 * Creates a verified session cookie from a client Firebase ID token.
 */
export async function createSessionAction(idToken: string): Promise<ActionResult<{ user: SessionUser }>> {
  // 1. Rate limiting check
  const rateLimitResult = rateLimit("auth:session", { maxTokens: 10, refillIntervalMs: 20000 });
  if (!rateLimitResult.success) {
    return {
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many authentication requests. Please try again later." },
    };
  }

  try {
    // 2. Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);
    const email = decodedToken.email;

    if (!email) {
      return {
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or credentials." },
      };
    }

    // 3. Create Firebase session cookie (5 days duration)
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    // 4. Set HttpOnly, Secure session cookie
    await SessionService.setSessionCookie(sessionCookie);

    // 5. Ensure synchronized record exists in Neon PostgreSQL
    const normalizedEmail = email.toLowerCase().trim();
    const isAdminEmail = FIXED_ADMIN_EMAILS.includes(normalizedEmail);

    let dbUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: decodedToken.name || normalizedEmail.split("@")[0],
          authProvider: "firebase",
          authProviderId: decodedToken.uid,
          role: isAdminEmail ? "ADMIN" : "CUSTOMER",
          cocoaPoints: isAdminEmail ? 1000 : 0,
        },
      });
    } else if (isAdminEmail && dbUser.role !== "ADMIN") {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { role: "ADMIN" },
      });
    }

    return {
      success: true,
      data: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role as SessionUser["role"],
          cocoaPoints: dbUser.cocoaPoints,
        },
      },
    };
  } catch {
    return {
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "Invalid email or credentials." },
    };
  }
}

/**
 * Server-side registration action with validation and Prisma synchronization.
 */
export async function registerAction(rawInput: unknown): Promise<ActionResult<{ userId: string }>> {
  // 1. Rate limiting
  const rateLimitResult = rateLimit("auth:register", { maxTokens: 5, refillIntervalMs: 20000 });
  if (!rateLimitResult.success) {
    return {
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many registration attempts. Please wait." },
    };
  }

  // 2. Input validation
  const validation = registerSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: validation.error.issues[0]?.message || "Invalid input data.",
      },
    };
  }

  const { name, email, password } = validation.data;

  try {
    // 3. Create user in Firebase Authentication
    const firebaseUser = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // 4. Create customer record in Neon PostgreSQL
    const dbUser = await prisma.user.create({
      data: {
        email,
        name,
        authProvider: "firebase",
        authProviderId: firebaseUser.uid,
        role: "CUSTOMER",
        cocoaPoints: 50, // Welcome reward bonus
      },
    });

    return {
      success: true,
      data: { userId: dbUser.id },
    };
  } catch (error: unknown) {
    // Generic error to avoid exposing whether account exists or internal schema
    const message = (error as { code?: string })?.code === "auth/email-already-exists"
      ? "An account with this email already exists."
      : "Unable to complete registration. Please verify your details.";

    return {
      success: false,
      error: { code: "REGISTRATION_FAILED", message },
    };
  }
}

/**
 * Secure password reset request. Uses generic success to prevent email enumeration.
 */
export async function resetPasswordAction(rawInput: unknown): Promise<ActionResult<{ message: string }>> {
  // 1. Rate limiting
  const rateLimitResult = rateLimit("auth:reset", { maxTokens: 5, refillIntervalMs: 30000 });
  if (!rateLimitResult.success) {
    return {
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many reset attempts. Please wait." },
    };
  }

  // 2. Input validation
  const validation = passwordResetSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Please provide a valid email address." },
    };
  }

  const { email } = validation.data;

  try {
    await adminAuth.generatePasswordResetLink(email);
  } catch {
    // Intentionally suppressed to avoid email enumeration
  }

  // Always return identical generic message
  return {
    success: true,
    data: {
      message: "If an account exists with this email, a password reset link has been dispatched.",
    },
  };
}

/**
 * Signs out the user by clearing the session cookie.
 */
export async function signOutAction(): Promise<ActionResult<{ success: boolean }>> {
  await SessionService.clearSessionCookie();
  return {
    success: true,
    data: { success: true },
  };
}

/**
 * Gets the current authenticated user safely.
 */
export async function getCurrentUserAction(): Promise<ActionResult<SessionUser | null>> {
  const user = await SessionService.getCurrentUser();
  return {
    success: true,
    data: user,
  };
}

/**
 * Development-mode administrative login helper to establish session for Tasnim admin.
 */
export async function devLoginAction(email: string = "mitulkabirbadhon7@gmail.com"): Promise<ActionResult<{ user: SessionUser }>> {
  const normalizedEmail = email.toLowerCase().trim();
  const isAdminEmail = FIXED_ADMIN_EMAILS.includes(normalizedEmail);

  let dbUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!dbUser && isAdminEmail) {
    dbUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedEmail.startsWith("mitul") ? "Mitul Kabir Badhon" : "Tasnim",
        role: "ADMIN",
        cocoaPoints: 1000,
        authProvider: "credentials",
      },
    });
  } else if (!dbUser) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "User account not found." },
    };
  }

  if (isAdminEmail && dbUser.role !== "ADMIN") {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { role: "ADMIN" },
    });
  }

  await SessionService.setSessionCookie(`dev-session:${dbUser.email}`);

  return {
    success: true,
    data: {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as SessionUser["role"],
        cocoaPoints: dbUser.cocoaPoints,
      },
    },
  };
}
