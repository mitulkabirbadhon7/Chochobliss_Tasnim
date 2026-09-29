import { SessionService, type SessionUser } from "./session";

export class AdminGuard {
  /**
   * Verifies that the current request is from an authenticated user with the ADMIN role.
   * Throws an error or returns the verified admin user.
   */
  static async verifyAdmin(): Promise<SessionUser> {
    const user = await SessionService.getCurrentUser();

    if (!user) {
      throw new Error("UNAUTHENTICATED: Authentication required.");
    }

    if (user.role !== "ADMIN") {
      throw new Error("FORBIDDEN: Administrative privileges required.");
    }

    return user;
  }

  /**
   * Safe check returning boolean without throwing.
   */
  static async isAdmin(): Promise<boolean> {
    const user = await SessionService.getCurrentUser();
    return user?.role === "ADMIN";
  }
}
