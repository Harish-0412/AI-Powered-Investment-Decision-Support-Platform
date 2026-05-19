"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PublicProfile } from "@/lib/profile";
import { SECTOR_LABELS } from "@/lib/profile";
import { apiRequest } from "@/lib/api";
import { Clock, ExternalLink } from "lucide-react";
import { ParticleCanvas } from "./ParticleCanvas";
import { PortfolioSection } from "./PortfolioSection";

type NewsArticle = {
  source: { name: string };
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
};

type PortfolioViewProps = {
  profile: PublicProfile;
  editable?: boolean;
};

export function PortfolioView({ profile, editable }: PortfolioViewProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const investments = profile.pastInvestments ?? [];
  const sectorCount = Object.values(profile.sectors ?? {}).flat().length;

  useEffect(() => {
    apiRequest<NewsArticle[]>("/news/top")
      .then(setNews)
      .catch(console.error);
  }, []);

  const displayName = profile.fullName || "Your Name";
  const goal = profile.investmentGoal || "Strategic Investor";
  const philosophy =
    profile.investmentPhilosophy ||
    "Focusing on long-term wealth creation through data-driven market insights.";

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
            <a href="#focus">Focus</a>
            <a href="#investments">Investments</a>
            <a href="#journey">Journey</a>
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
          <p className="hero-kicker">Investor Profile</p>
          <h1>{displayName}</h1>
          <p className="portfolio-role">{goal}</p>
          <p className="portfolio-tagline">{philosophy}</p>

          <div className="portfolio-hero-stats">
            {profile.investmentExperienceYears != null && (
              <div className="portfolio-stat">
                <strong>{profile.investmentExperienceYears}+</strong>
                <span>Years investing</span>
              </div>
            )}
            <div className="portfolio-stat">
              <strong>{investments.length}</strong>
              <span>Major holdings</span>
            </div>
            <div className="portfolio-stat">
              <strong>{sectorCount}</strong>
              <span>Sectors tracked</span>
            </div>
          </div>

          <div className="hero-actions">
            <a href="#investments" className="glass-button">
              View Investments
            </a>
            <a href="#contact" className="glass-button glass-button-secondary">
              Contact
            </a>
          </div>
        </div>
      </section>

      <PortfolioSection
        id="about"
        kicker="About"
        title="Investment focus and application interest."
        description="How I use Investment Intelligence to drive my market decisions."
      >
        <div className="portfolio-about-grid">
          <div className="portfolio-about-main">
            <p className="portfolio-body">
              {profile.appUsageInterest ||
                "I use data-driven insights to manage my portfolio risk and identify emerging opportunities in the market."}
            </p>
            {profile.currentFocus && (
              <div className="portfolio-building-card">
                <span className="portfolio-building-label">Current focus</span>
                <p>{profile.currentFocus}</p>
              </div>
            )}
          </div>
          <aside className="portfolio-facts">
            {profile.stocksWatching && profile.stocksWatching.length > 0 && (
              <div className="portfolio-fact-card">
                <span>Watchlist</span>
                <div className="portfolio-tag-row">
                  {profile.stocksWatching.map((stock) => (
                    <span key={stock}>{stock}</span>
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
        id="focus"
        kicker="Market Focus"
        title="Diversified across sectors."
        description="Organized by asset classes and industry domains."
        dark
      >
        <div className="skills-domain-grid">
          {Object.entries(SECTOR_LABELS).map(([key, label]) => {
            const items = profile.sectors?.[key as keyof typeof profile.sectors] ?? [];
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
        id="investments"
        kicker="Past Performance"
        title="Previous investments and key takeaways."
        description="A track record of strategic asset allocation and market participation."
      >
        <div className="project-showcase-grid">
          {investments.map((investment, index) => (
            <article key={investment.id} className="project-showcase-card">
              <span className="project-index">0{index + 1}</span>
              <div className="project-showcase-head">
                <h3>{investment.name}</h3>
                <span className="experience-type" style={{ position: "static", marginBottom: 0 }}>
                  {investment.assetClass}
                </span>
              </div>
              <div className="project-detail-blocks">
                <div className="project-detail-block">
                  <h4>Entry Price</h4>
                  <p>{investment.entryPrice}</p>
                </div>
                {investment.exitPrice && (
                  <div className="project-detail-block">
                    <h4>Exit Price</h4>
                    <p>{investment.exitPrice}</p>
                  </div>
                )}
                <div className="project-detail-block">
                  <h4>Duration</h4>
                  <p>{investment.duration}</p>
                </div>
              </div>
              <div className="project-detail-block" style={{ marginTop: 16 }}>
                <h4>Key Takeaway</h4>
                <p>{investment.keyTakeaway}</p>
              </div>
            </article>
          ))}
        </div>
      </PortfolioSection>

      <PortfolioSection
        id="journey"
        kicker="Investment Journey"
        title="Experience and methodologies."
        description="SIPs, Lumpsum investments, and active market strategies."
        dark
      >
        <div className="experience-timeline">
          {(profile.investmentMethods ?? []).length === 0 ? (
            <p className="portfolio-muted">
              Add your investment methods and history in your profile assessment.
            </p>
          ) : (
            (profile.investmentMethods ?? []).map((item) => (
              <article key={item.id} className="experience-card">
                <span className="experience-type">{item.type.toUpperCase()}</span>
                <h3>{item.title}</h3>
                <p className="experience-org">
                  {item.platform} · {item.period}
                </p>
                <p className="experience-desc">{item.description}</p>
              </article>
            ))
          )}
        </div>
      </PortfolioSection>

      <PortfolioSection
        id="news"
        kicker="Market Intelligence"
        title="Live financial news and highlights."
        description="Detailed news coverage of global markets and investments."
      >
        <div className="project-showcase-grid">
          {news.slice(0, 4).map((article, index) => (
            <article key={index} className="project-showcase-card !p-0 overflow-hidden flex flex-col group">
              {article.urlToImage && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={article.urlToImage} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#52625a] mb-2">
                  <span>{article.source.name}</span>
                  <span className="h-1 w-1 rounded-full bg-[#8a9a92]" />
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#101412] leading-snug mb-3 group-hover:text-[#4aa87a] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-[#52625a] line-clamp-3 mb-4 flex-1">
                  {article.description}
                </p>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center text-xs font-bold text-[#4aa87a] gap-1"
                >
                  Read detailed highlights <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </PortfolioSection>

      <section id="contact" className="section-band closing-band">
        <div className="section-inner closing-inner portfolio-contact">
          <div>
            <p className="section-kicker">Collaborate</p>
            <h2>Let&apos;s discuss market trends together.</h2>
            <p className="portfolio-contact-sub">
              Open to sharing insights and discussing investment strategies.
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
