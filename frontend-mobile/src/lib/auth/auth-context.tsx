/**
 * Auth session context
 *
 * Holds the signed-in member and their tokens for the life of the app
 * session, mirroring the web `AuthProvider`. Tokens are kept in memory only:
 * persisting them across launches needs secure storage and is not implemented
 * yet, so a relaunch signs the member out.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { AuthenticatedUser, LoginResponse } from "@/lib/api/auth";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
};

type AuthContextValue = {
  session: AuthSession | null;
  isSignedIn: boolean;
  signIn: (response: LoginResponse) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Provides the session to the app shell. Mount once, in the root layout. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isSignedIn: session !== null,
      signIn: ({ accessToken, refreshToken, user }) =>
        setSession({ accessToken, refreshToken, user }),
      signOut: () => setSession(null),
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Reads the current session. Throws when used outside `AuthProvider`. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
