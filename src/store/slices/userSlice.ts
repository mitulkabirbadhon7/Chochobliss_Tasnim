import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SessionUser } from "@/lib/auth/session";

/**
 * CLIENT-SIDE USER STATE
 *
 * CRITICAL SECURITY ARCHITECTURE RULE:
 * This Redux state is exclusively for client UI rendering (displaying avatar,
 * name, and loyalty points in the navbar).
 *
 * IT MUST NEVER BE TRUSTED FOR SECURITY DECISIONS.
 * Server Actions and API routes must ALWAYS authenticate via the HttpOnly
 * session cookie and verify authorization using AdminGuard on the server.
 */

export interface UserState {
  user: SessionUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
}

const initialState: UserState = {
  user: null,
  status: "idle",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SessionUser | null>) => {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
    },

    clearUser: (state) => {
      state.user = null;
      state.status = "unauthenticated";
    },

    updateCocoaPoints: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.cocoaPoints = action.payload;
      }
    },

    setUserStatus: (
      state,
      action: PayloadAction<UserState["status"]>
    ) => {
      state.status = action.payload;
    },
  },
});

export const { setUser, clearUser, updateCocoaPoints, setUserStatus } = userSlice.actions;

// Selectors
export const selectCurrentUser = (state: { user: UserState }) => state.user.user;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.status === "authenticated";
export const selectUserStatus = (state: { user: UserState }) => state.user.status;
export const selectUserPoints = (state: { user: UserState }) => state.user.user?.cocoaPoints ?? 0;
export const selectIsAdmin = (state: { user: UserState }) => state.user.user?.role === "ADMIN";

export default userSlice.reducer;
