"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredSession } from "@/lib/api";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(Boolean(getStoredSession()?.accessToken));
    setReady(true);
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

  return children;
}
