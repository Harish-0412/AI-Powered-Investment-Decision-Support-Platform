"use client";

import Link from "next/link";
import { useState } from "react";
import { apiRequest, storeSession, type AuthSession } from "@/lib/api";
import { resolvePostAuthPath } from "@/lib/auth-redirect";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const session = await apiRequest<AuthSession>(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(mode === "register" ? { email, password, name } : { email, password })
      });

      storeSession(session);
      const path = mode === "register" ? "/onboarding" : await resolvePostAuthPath();
      window.location.href = path;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <Link href="/" className="auth-brand">Investment Intelligence</Link>
      <form onSubmit={submit} className="auth-panel">
        <p>Secure access</p>
        <h1>{mode === "login" ? "Welcome back." : "Create your workspace."}</h1>
        {mode === "register" && (
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
          </label>
        )}
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="At least 8 characters" required />
        </label>
        {message && <span className="form-error">{message}</span>}
        <button disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
        <button
          type="button"
          className="text-switch"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}
