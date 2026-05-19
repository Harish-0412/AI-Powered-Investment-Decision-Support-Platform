"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("admin-token", data.token);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-brand">
          <span className="admin-brand-icon">II</span>
          <span>Investment Intelligence</span>
        </div>
        <div className="admin-login-badge">ADMIN PORTAL</div>
        <h1 className="admin-login-title">Admin Sign In</h1>
        <p className="admin-login-sub">Restricted access — authorised personnel only.</p>
        <form onSubmit={submit} className="admin-login-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@investiq.com"
              required
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>
          {error && <span className="admin-error">{error}</span>}
          <button type="submit" disabled={loading} className="admin-login-btn">
            {loading ? "Signing in…" : "Sign in as Admin"}
          </button>
        </form>
      </div>
    </main>
  );
}
