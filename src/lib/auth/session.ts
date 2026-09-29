import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/admin";
import type { Role, User } from "@/types";

export const SESSION_COOKIE_NAME = "__session";
export const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  cocoaPoints: number;
}

export class SessionService {
  /**
   * Retrieves the current authenticated user from the verified session cookie.
   */
  static async getCurrentUser(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    try {
      // Verify session cookie via Firebase Admin
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      const email = decodedClaims.email;

      if (!email) {
        return null;
      }

      // Query database for authoritative role and profile data
      const dbUser = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          cocoaPoints: true,
        },
      });

      if (!dbUser) {
        return null;
      }

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as Role,
        cocoaPoints: dbUser.cocoaPoints,
      };
    } catch {
      // Invalid or expired session cookie
      return null;
    }
  }

  /**
   * Sets the secure session cookie on the response.
   */
  static async setSessionCookie(sessionCookie: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_DURATION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  /**
   * Clears the session cookie.
   */
  static async clearSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}
