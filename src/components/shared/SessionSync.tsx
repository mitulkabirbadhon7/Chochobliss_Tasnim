"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/userSlice";
import type { SessionUser } from "@/lib/auth/session";

interface SessionSyncProps {
  initialUser: SessionUser | null;
}

/**
 * Synchronizes server-verified session state into client Redux store on load.
 * Note: Purely for UI rendering (avatar, user name, loyalty points in header).
 * Server-side authorization remains strictly enforced on all mutations and protected routes.
 */
export function SessionSync({ initialUser }: SessionSyncProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setUser(initialUser));
  }, [dispatch, initialUser]);

  return null;
}
