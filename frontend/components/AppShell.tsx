"use client";

import Link from "next/link";
import { clearSession, getStoredSession } from "@/lib/api";

const navLinks = [
  { label: "Dashboard", href: "/app" },
  { label: "My Portfolio", href: "/portfolio/me" },
  { label: "Stocks", href: "/stocks" },
  { label: "Portfolios", href: "/portfolios" },
  { label: "Analytics", href: "/analytics" },
  { label: "Mutual Funds", href: "/mutual-funds" },
];

export function AppShell({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const session = getStoredSession();

  const logout = () => {
    clearSession();
    window.location.href = "/";
  };

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <Link href="/" className="app-logo">
          <span>II</span>
          Investment Intelligence
        </Link>
        <nav className="app-nav" aria-label="Application navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
        <div className="app-user">
          <p>{session?.user?.email || "Not signed in"}</p>
          {session ? <button onClick={logout}>Sign out</button> : <Link href="/auth">Sign in</Link>}
        </div>
      </aside>
      <section className="app-main">
        <header className="app-page-header">
          <p>Connected workspace</p>
          <h1>{title}</h1>
          <span>{subtitle}</span>
        </header>
        {children}
      </section>
    </main>
  );
}
