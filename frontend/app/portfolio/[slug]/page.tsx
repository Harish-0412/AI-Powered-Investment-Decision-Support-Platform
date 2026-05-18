"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL, getStoredSession } from "@/lib/api";
import type { PublicProfile } from "@/lib/profile";
import { PortfolioView } from "@/components/portfolio/PortfolioView";

export default function PublicPortfolioPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState("");
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/profile/public/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Profile not found");
        return res.json() as Promise<PublicProfile>;
      })
      .then((data) => {
        setProfile(data);
        const session = getStoredSession();
        if (session?.user) {
          fetch(`${API_BASE_URL}/profile/me`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
            credentials: "include",
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((mine: PublicProfile | null) => setEditable(mine?.slug === slug))
            .catch(() => setEditable(false));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [slug]);

  if (error) {
    return (
      <main className="portfolio-page portfolio-error">
        <p>{error}</p>
        <a href="/portfolio">View demo portfolio</a>
      </main>
    );
  }

  if (!profile) {
    return <main className="portfolio-page portfolio-loading">Loading portfolio…</main>;
  }

  return <PortfolioView profile={profile} editable={editable} />;
}
