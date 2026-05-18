"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import type { GithubStats, PublicProfile } from "@/lib/profile";
import { SKILL_DOMAIN_LABELS } from "@/lib/profile";
import { ParticleCanvas } from "./ParticleCanvas";
import { PortfolioSection } from "./PortfolioSection";

type PortfolioViewProps = {
  profile: PublicProfile;
  editable?: boolean;
};

export function PortfolioView({ profile, editable }: PortfolioViewProps) {
  const [github, setGithub] = useState<GithubStats | null>(null);
  const featured = (profile.projects ?? []).filter((p) => p.featured !== false);
  const projects = profile.projects ?? [];
  const skillCount = Object.values(profile.skills ?? {}).flat().length;

  useEffect(() => {
    if (!profile.githubUsername) return;

    fetch(`${API_BASE_URL}/profile/github/${encodeURIComponent(profile.githubUsername)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setGithub(data as GithubStats | null))
      .catch(() => setGithub(null));
  }, [profile.githubUsername]);

  const displayName = profile.fullName || "Your Name";
  const role = profile.role || "Full Stack Developer & AI Systems Builder";
  const tagline =
    profile.tagline ||
    "Building intelligent, scalable web applications with modern software engineering.";

  return (
    <main className="portfolio-page">
      <section id="hero" className="portfolio-hero">
        <ParticleCanvas />
        <div className="portfolio-blob portfolio-blob-a" aria-hidden="true" />
        <div className="portfolio-blob portfolio-blob-b" aria-hidden="true" />

        <header className="portfolio-header">
          <Link href="/" className="brand-mark">
            <span className="brand-icon">II</span>
            <span>Investment Intelligence</span>
          </Link>
          <nav className="portfolio-nav" aria-label="Portfolio sections">
            <a href="#about">About</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#experience">Journey</a>
            <a href="#github">GitHub</a>
            <a href="#contact">Contact</a>
            {editable && (
              <Link href="/onboarding" className="portfolio-nav-cta">
                Edit profile
              </Link>
            )}
            <Link href="/app" className="portfolio-nav-cta">
              Open app
            </Link>
          </nav>
        </header>

        <div className="portfolio-hero-inner">
          <p className="hero-kicker">Engineer portfolio</p>
          <h1>{displayName}</h1>
          <p className="portfolio-role">{role}</p>
          <p className="portfolio-tagline">{tagline}</p>

          <div className="portfolio-hero-stats">
            {profile.yearsLearning != null && (
              <div className="portfolio-stat">
                <strong>{profile.yearsLearning}+</strong>
                <span>Years building</span>
              </div>
            )}
            <div className="portfolio-stat">
              <strong>{projects.length}</strong>
              <span>Projects</span>
            </div>
            <div className="portfolio-stat">
              <strong>{skillCount}</strong>
              <span>Skills listed</span>
            </div>
            {github && (
              <div className="portfolio-stat">
                <strong>{github.user.public_repos}</strong>
                <span>GitHub repos</span>
              </div>
            )}
          </div>

          <div className="hero-actions">
            <a href="#projects" className="glass-button">
              View Projects
            </a>
            {profile.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                className="glass-button glass-button-secondary"
                target="_blank"
                rel="noreferrer"
              >
                Resume
              </a>
            ) : (
              <a href="#contact" className="glass-button glass-button-secondary">
                Resume
              </a>
            )}
            <a href="#contact" className="glass-button glass-button-secondary">
              Contact
            </a>
          </div>
        </div>
      </section>

      <PortfolioSection
        id="about"
        kicker="About"
        title="Technical focus, not generic passion statements."
        description="What you build, how you think, and what you're shipping right now."
      >
        <div className="portfolio-about-grid">
          <div className="portfolio-about-main">
            <p className="portfolio-body">
              {profile.bio ||
                "Full-stack engineer focused on AI/ML systems, scalable backend architecture, recommendation engines, authentication systems, and production-grade system design."}
            </p>
            {profile.currentlyBuilding && (
              <div className="portfolio-building-card">
                <span className="portfolio-building-label">Currently building</span>
                <p>{profile.currentlyBuilding}</p>
              </div>
            )}
          </div>
          <aside className="portfolio-facts">
            {profile.technologies && profile.technologies.length > 0 && (
              <div className="portfolio-fact-card">
                <span>Core stack</span>
                <div className="portfolio-tag-row">
                  {profile.technologies.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.contactEmail && (
              <div className="portfolio-fact-card">
                <span>Contact</span>
                <a href={`mailto:${profile.contactEmail}`} className="portfolio-fact-link">
                  {profile.contactEmail}
                </a>
              </div>
            )}
          </aside>
        </div>
      </PortfolioSection>

      <PortfolioSection
        id="skills"
        kicker="Skills"
        title="Organized by engineering domain."
        description="Grouped the way hiring managers and tech leads evaluate candidates."
        dark
      >
        <div className="skills-domain-grid">
          {Object.entries(SKILL_DOMAIN_LABELS).map(([key, label]) => {
            const items = profile.skills?.[key as keyof typeof profile.skills] ?? [];
            if (items.length === 0) return null;
            return (
              <article key={key} className="skills-domain-card">
                <h3>{label}</h3>
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </PortfolioSection>

      <PortfolioSection
        id="projects"
        kicker="Featured work"
        title="Products with architecture, not homework titles."
        description="Each project includes the problem, system design, and engineering proof."
      >
        <div className="project-showcase-grid">
          {(featured.length > 0 ? featured : projects).map((project, index) => (
            <article key={project.id} className="project-showcase-card">
              <span className="project-index">0{index + 1}</span>
              <div className="project-showcase-head">
                <h3>{project.name}</h3>
                <div className="project-links">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target={project.liveUrl.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                    >
                      Live demo
                    </a>
                  )}
                </div>
              </div>
              <div className="project-detail-blocks">
                <div className="project-detail-block">
                  <h4>Problem</h4>
                  <p>{project.problem}</p>
                </div>
                <div className="project-detail-block">
                  <h4>Architecture</h4>
                  <p>{project.architecture}</p>
                </div>
              </div>
              <div className="project-columns">
                <div>
                  <h4>Key features</h4>
                  <ul>
                    {project.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Engineering highlights</h4>
                  <ul>
                    {project.engineeringHighlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="project-tech-row">
                {project.techStack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
              <Link
                href={`/portfolio/projects/${project.slug}?profile=${profile.slug}`}
                className="project-case-link"
              >
                Read full case study →
              </Link>
            </article>
          ))}
        </div>
      </PortfolioSection>

      <PortfolioSection
        id="experience"
        kicker="Experience & journey"
        title="Proof of capability over certificates."
        description="Hackathons, open source, freelance, research, and self-built products."
        dark
      >
        <div className="experience-timeline">
          {(profile.experience ?? []).length === 0 ? (
            <p className="portfolio-muted">
              Add hackathons, open-source, freelance, and self-built products in your profile assessment.
            </p>
          ) : (
            (profile.experience ?? []).map((item) => (
              <article key={item.id} className="experience-card">
                <span className="experience-type">{item.type}</span>
                <h3>{item.title}</h3>
                <p className="experience-org">
                  {item.organization} · {item.period}
                </p>
                <p className="experience-desc">{item.description}</p>
              </article>
            ))
          )}
        </div>
      </PortfolioSection>

      <PortfolioSection
        id="github"
        kicker="GitHub activity"
        title="Live engineering signal."
        description="Public repositories and contribution patterns validate your profile."
      >
        {profile.githubUsername ? (
          <div className="github-panel">
            {github ? (
              <div className="github-layout">
                <div className="github-user github-user-card">
                  <img src={github.user.avatar_url} alt="" width={72} height={72} />
                  <div>
                    <h3>@{github.user.login}</h3>
                    <p>{github.user.bio || "Open-source builder"}</p>
                    <p className="github-stats-line">
                      {github.user.public_repos} public repos · {github.user.followers} followers
                    </p>
                    <a href={github.user.html_url} target="_blank" rel="noreferrer" className="github-profile-link">
                      View GitHub profile →
                    </a>
                  </div>
                </div>
                <div className="github-repos">
                  {github.repos.map((repo) => (
                    <a
                      key={repo.name}
                      href={repo.url}
                      className="github-repo-card"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <h4>{repo.name}</h4>
                      <p>{repo.description || "No description"}</p>
                      <span>
                        {repo.language || "—"} · ★ {repo.stars}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <p className="portfolio-muted">Loading GitHub activity for @{profile.githubUsername}…</p>
            )}
          </div>
        ) : (
          <p className="portfolio-muted">Add your GitHub username in profile assessment.</p>
        )}
      </PortfolioSection>

      <section id="contact" className="section-band closing-band">
        <div className="section-inner closing-inner portfolio-contact">
          <div>
            <p className="section-kicker">Hire / collaborate</p>
            <h2>Let&apos;s build intelligent systems together.</h2>
            <p className="portfolio-contact-sub">
              Available for full-stack, AI systems, and product engineering roles.
            </p>
            <div className="contact-links">
              {profile.contactEmail && (
                <a href={`mailto:${profile.contactEmail}`}>{profile.contactEmail}</a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              )}
              {profile.twitter && (
                <a href={profile.twitter} target="_blank" rel="noreferrer">
                  X / Twitter
                </a>
              )}
              {profile.calendly && (
                <a href={profile.calendly} target="_blank" rel="noreferrer">
                  Schedule a call
                </a>
              )}
              {profile.discord && <span className="contact-discord">Discord: {profile.discord}</span>}
            </div>
          </div>
          <a
            href={profile.contactEmail ? `mailto:${profile.contactEmail}` : "#contact"}
            className="glass-button"
          >
            Start a conversation
          </a>
        </div>
      </section>
    </main>
  );
}
