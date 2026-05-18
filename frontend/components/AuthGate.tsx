"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearSession, getStoredSession, storeSession, API_BASE_URL, type AuthSession } from "@/lib/api";

const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const exp = getTokenExpiry(token);
  return exp !== null && Date.now() >= exp;
};

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      const session = getStoredSession();

      if (!session?.accessToken) {
        setSignedIn(false);
        setReady(true);
        return;
      }

      // Token still valid
      if (!isTokenExpired(session.accessToken)) {
        setSignedIn(true);
        setReady(true);
        return;
      }

      // Token expired — attempt silent refresh via httpOnly cookie
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = (await res.json()) as AuthSession;
          storeSession(data);
          setSignedIn(true);
        } else {
          clearSession();
          setSignedIn(false);
        }
      } catch {
        clearSession();
        setSignedIn(false);
      }

      setReady(true);
    };

    init();
  }, []);

  if (!ready) {
    return <div className="app-loading">Loading workspace...</div>;
  }

  if (!signedIn) {
    return (
      <main className="auth-required">
        <div>
          <p>Authentication required</p>
          <h1>Sign in to use your investment workspace.</h1>
          <Link href="/auth">Go to sign in</Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
