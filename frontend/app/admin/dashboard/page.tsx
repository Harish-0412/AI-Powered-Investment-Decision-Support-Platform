"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

type User = {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string;
  riskLevel: string;
  createdAt: string;
  _count: { portfolios: number };
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showHash, setShowHash] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("admin-token") : null;

  const fetchUsers = async () => {
    if (!token) { window.location.href = "/admin"; return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { window.location.href = "/admin"; return; }
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      setError("Failed to delete user");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("admin-token");
    window.location.href = "/admin";
  };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-brand-icon">II</span>
          <div>
            <span className="admin-header-title">Admin Dashboard</span>
            <span className="admin-header-sub">Investment Intelligence</span>
          </div>
        </div>
        <div className="admin-header-right">
          <span className="admin-user-count">{users.length} total users</span>
          <button className="admin-logout-btn" onClick={logout}>Sign out</button>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats row */}
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Users</span>
            <strong className="admin-stat-val">{users.length}</strong>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Portfolios</span>
            <strong className="admin-stat-val">{users.reduce((s, u) => s + u._count.portfolios, 0)}</strong>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Low Risk</span>
            <strong className="admin-stat-val">{users.filter(u => u.riskLevel === "LOW").length}</strong>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Medium Risk</span>
            <strong className="admin-stat-val">{users.filter(u => u.riskLevel === "MEDIUM").length}</strong>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">High Risk</span>
            <strong className="admin-stat-val">{users.filter(u => u.riskLevel === "HIGH").length}</strong>
          </div>
        </div>

        {/* Search */}
        <div className="admin-toolbar">
          <input
            className="admin-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="admin-refresh-btn" onClick={fetchUsers}>↻ Refresh</button>
        </div>

        {error && <p className="admin-error">{error}</p>}

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <span>Loading users…</span>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Password Hash</th>
                  <th>Risk Level</th>
                  <th>Portfolios</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="admin-empty">No users found.</td></tr>
                )}
                {filtered.map((user, i) => (
                  <tr key={user.id} className={deletingId === user.id ? "admin-row-deleting" : ""}>
                    <td className="admin-idx">{i + 1}</td>
                    <td>
                      <div className="admin-name-cell">
                        <div className="admin-avatar">{(user.name ?? user.email)[0].toUpperCase()}</div>
                        <span>{user.name ?? <em className="admin-no-name">No name</em>}</span>
                      </div>
                    </td>
                    <td className="admin-email">{user.email}</td>
                    <td className="admin-hash-cell">
                      <div className="admin-hash-row">
                        <code className="admin-hash">
                          {showHash[user.id] ? user.passwordHash : `${user.passwordHash.slice(0, 20)}…`}
                        </code>
                        <button
                          className="admin-toggle-hash"
                          onClick={() => setShowHash(p => ({ ...p, [user.id]: !p[user.id] }))}
                        >
                          {showHash[user.id] ? "Hide" : "Show"}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-risk-badge risk-${user.riskLevel.toLowerCase()}`}>
                        {user.riskLevel}
                      </span>
                    </td>
                    <td className="admin-center">{user._count.portfolios}</td>
                    <td className="admin-date">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                    <td>
                      {confirmId === user.id ? (
                        <div className="admin-confirm-row">
                          <span className="admin-confirm-text">Sure?</span>
                          <button
                            className="admin-confirm-yes"
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingId === user.id}
                          >
                            {deletingId === user.id ? "…" : "Yes"}
                          </button>
                          <button className="admin-confirm-no" onClick={() => setConfirmId(null)}>No</button>
                        </div>
                      ) : (
                        <button className="admin-delete-btn" onClick={() => setConfirmId(user.id)}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
