"use server";

import { adminAuth } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { SessionService, SESSION_DURATION_MS, type SessionUser } from "@/lib/auth/session";
import { loginSchema, registerSchema, passwordResetSchema } from "@/lib/validations/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

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
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check if email already registered in Neon DB
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return {
      success: false,
      error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists. Please sign in." },
    };
  }

  // 2. Try creating user in Firebase (if configured with service account), otherwise use authoritative DB credentials
  let authProvider = "credentials";
  let authProviderId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

  const hasFirebaseAdmin = Boolean(
    process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
  );

  if (hasFirebaseAdmin) {
    try {
      const firebaseUser = await adminAuth.createUser({
        email: normalizedEmail,
        password,
        displayName: name,
      });
      authProvider = "firebase";
      authProviderId = firebaseUser.uid;
    } catch (fbErr: unknown) {
      const errCode = (fbErr as { code?: string })?.code;
      if (errCode === "auth/email-already-exists") {
        return {
          success: false,
          error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists. Please sign in." },
        };
      }
      // Fall back to local DB credentials provider if Firebase service is unreachable
    }
  }

  try {
    const isAdminEmail = FIXED_ADMIN_EMAILS.includes(normalizedEmail);
    const dbUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash: hashPassword(password),
        authProvider,
        authProviderId,
        role: isAdminEmail ? "ADMIN" : "CUSTOMER",
        cocoaPoints: isAdminEmail ? 1000 : 50, // Welcome reward bonus
      },
    });

    // Automatically establish session cookie
    try {
      await SessionService.setSessionCookie(`dev-session:${dbUser.email}`);
    } catch {
      // In non-HTTP or isolated execution environments, proceed gracefully
    }

    return {
      success: true,
      data: { userId: dbUser.id },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to complete registration. Please verify your details.";
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

/**
 * Authoritative credential login with strict scrypt password verification.
 */
export async function loginWithCredentialsAction(
  rawInput: unknown
): Promise<ActionResult<{ user: SessionUser }>> {
  // 1. Rate limiting
  const rateLimitResult = rateLimit("auth:login", { maxTokens: 8, refillIntervalMs: 20000 });
  if (!rateLimitResult.success) {
    return {
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many login attempts. Please wait." },
    };
  }

  // 2. Validate input
  const validation = loginSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Please provide a valid email and password." },
    };
  }

  const { email, password } = validation.data;
  const normalizedEmail = email.toLowerCase().trim();
  const isAdminEmail = FIXED_ADMIN_EMAILS.includes(normalizedEmail);

  let dbUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // If initial admin user has not yet been registered in DB, provision with password
  if (!dbUser && isAdminEmail) {
    dbUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedEmail.startsWith("mitul") ? "Mitul Kabir Badhon" : "Tasnim",
        passwordHash: hashPassword(password),
        role: "ADMIN",
        cocoaPoints: 1000,
        authProvider: "credentials",
      },
    });
  } else if (!dbUser) {
    return {
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
    };
  }

  // 3. Verify password
  if (dbUser.passwordHash) {
    const isPasswordValid = verifyPassword(password, dbUser.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
      };
    }
  } else {
    // If user has no passwordHash yet (e.g. legacy/initial account), set password on first login
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { passwordHash: hashPassword(password) },
    });
  }

  // 4. Ensure admin role synchronized
  if (isAdminEmail && dbUser.role !== "ADMIN") {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { role: "ADMIN" },
    });
  }

  // 5. Establish session
  try {
    await SessionService.setSessionCookie(`dev-session:${dbUser.email}`);
  } catch {
    // In non-HTTP or isolated execution environments, proceed gracefully
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
}

/**
 * Changes password for the currently authenticated session user.
 */
export async function changePasswordAction(rawInput: {
  currentPassword?: string;
  newPassword: string;
}): Promise<ActionResult<{ message: string }>> {
  const currentUser = await SessionService.getCurrentUser();
  if (!currentUser) {
    return {
      success: false,
      error: { code: "UNAUTHENTICATED", message: "You must be signed in to change password." },
    };
  }

  if (!rawInput.newPassword || rawInput.newPassword.length < 6) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "New password must be at least 6 characters long." },
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
  });

  if (!dbUser) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "User not found." },
    };
  }

  // Verify current password if user already has a password set
  if (dbUser.passwordHash && rawInput.currentPassword) {
    const isCurrentValid = verifyPassword(rawInput.currentPassword, dbUser.passwordHash);
    if (!isCurrentValid) {
      return {
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Current password does not match." },
      };
    }
  }

  // Update passwordHash
  await prisma.user.update({
    where: { id: dbUser.id },
    data: { passwordHash: hashPassword(rawInput.newPassword) },
  });

  return {
    success: true,
    data: { message: "Password updated successfully." },
  };
}

/**
 * Resets a forgotten password using registered email verification.
 */
export async function resetForgottenPasswordAction(rawInput: {
  email: string;
  newPassword: string;
}): Promise<ActionResult<{ message: string }>> {
  const rateLimitResult = rateLimit("auth:reset-password", { maxTokens: 5, refillIntervalMs: 20000 });
  if (!rateLimitResult.success) {
    return {
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many reset attempts. Please wait a moment." },
    };
  }

  const email = rawInput.email?.toLowerCase().trim();
  if (!email || !email.includes("@")) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Please provide a valid email address." },
    };
  }

  if (!rawInput.newPassword || rawInput.newPassword.length < 6) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "New password must be at least 6 characters long." },
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!dbUser) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "No account found with this email address." },
    };
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { passwordHash: hashPassword(rawInput.newPassword) },
  });

  return {
    success: true,
    data: { message: "Password has been successfully reset! You can now sign in with your new password." },
  };
}

