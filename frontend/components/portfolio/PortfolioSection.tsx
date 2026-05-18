import type { ReactNode } from "react";

type PortfolioSectionProps = {
  id: string;
  kicker: string;
  title: string;
  description?: string;
  dark?: boolean;
  children: ReactNode;
};

export function PortfolioSection({
  id,
  kicker,
  title,
  description,
  dark,
  children,
}: PortfolioSectionProps) {
  return (
    <section
      id={id}
      className={`section-band ${dark ? "section-ink" : "section-light"} portfolio-section-block`}
    >
      <div className="section-inner portfolio-section">
        <header className="portfolio-section-header">
          <p className="section-kicker">{kicker}</p>
          <h2>{title}</h2>
          {description && <p className="portfolio-section-desc">{description}</p>}
        </header>
        <div className="portfolio-section-body">{children}</div>
      </div>
    </section>
  );
}
