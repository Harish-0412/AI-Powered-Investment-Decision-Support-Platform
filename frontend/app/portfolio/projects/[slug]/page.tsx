"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import type { PortfolioProject, PublicProfile } from "@/lib/profile";

function CaseStudyContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectSlug = String(params.slug ?? "");
  const profileSlug = searchParams.get("profile") ?? "";
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (!profileSlug) return;

    fetch(`${API_BASE_URL}/profile/public/${encodeURIComponent(profileSlug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((profile: PublicProfile | null) => {
        if (!profile) return;
        setProfileName(profile.fullName ?? profile.slug);
        const match = (profile.projects ?? []).find((p) => p.slug === projectSlug);
        setProject(match ?? null);
      })
      .catch(() => setProject(null));
  }, [profileSlug, projectSlug]);

  if (!project) {
    return (
      <main className="case-study-page">
        <p>Case study not found. Open from a portfolio project card.</p>
        <Link href={profileSlug ? `/portfolio/${profileSlug}` : "/portfolio"}>← Back</Link>
      </main>
    );
  }

  return (
    <main className="case-study-page">
      <Link href={profileSlug ? `/portfolio/${profileSlug}#projects` : "/portfolio"} className="case-back">
        ← Back to {profileName || "portfolio"}
      </Link>
      <p className="section-kicker">Case study</p>
      <h1>{project.name}</h1>

      <section>
        <h2>Problem</h2>
        <p>{project.problem}</p>
      </section>

      <section>
        <h2>Why existing solutions fall short</h2>
        <p>
          Generic tools fragment market data, portfolio tracking, and analytics. This project unifies them
          with production-grade auth, caching, and real-time enrichment.
        </p>
      </section>

      <section>
        <h2>Architecture</h2>
        <p>{project.architecture}</p>
      </section>

      <section>
        <h2>Database & backend workflow</h2>
        <p>
          PostgreSQL stores users, portfolios, holdings, and transactions. Prisma enforces relations;
          buy/sell operations run in atomic transactions updating weighted average cost basis.
        </p>
      </section>

      <section>
        <h2>AI / data pipeline</h2>
        <p>
          Yahoo Finance powers quotes; Alpha Vantage adds fundamentals with Redis caching. Analytics layer
          computes volatility and Sharpe-style metrics on enriched holdings.
        </p>
      </section>

      <section>
        <h2>Challenges & optimizations</h2>
        <ul>
          {project.engineeringHighlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Future scaling</h2>
        <p>
          WebSocket price streams, broker integrations, ML-based allocation suggestions, and federated
          learning for privacy-preserving recommendations.
        </p>
      </section>

      <div className="project-tech-row">
        {project.techStack.map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
      </div>
    </main>
  );
}

export default function ProjectCaseStudyPage() {
  return (
    <Suspense fallback={<main className="case-study-page">Loading case study…</main>}>
      <CaseStudyContent />
    </Suspense>
  );
}
