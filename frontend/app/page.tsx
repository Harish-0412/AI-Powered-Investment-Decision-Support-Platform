const navItems = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "App", href: "/app" },
  { label: "Stocks", href: "/stocks" },
  { label: "Portfolios", href: "/portfolios" },
  { label: "Analytics", href: "/analytics" },
];

const features = [
  {
    eyebrow: "Live Markets",
    title: "Real-time stock intelligence",
    description:
      "Track current prices, daily movement, and historical performance with cached Yahoo Finance data for fast portfolio decisions.",
  },
  {
    eyebrow: "Portfolio OS",
    title: "Holdings that update with the market",
    description:
      "See current value, total cost, profit and loss, and percentage gains calculated automatically from your active positions.",
  },
  {
    eyebrow: "Trade Ledger",
    title: "Atomic transaction handling",
    description:
      "Record buys and sells while holdings are updated in one database transaction, including weighted average buy prices.",
  },
  {
    eyebrow: "Alpha Vantage",
    title: "Fundamentals, earnings, news, indicators",
    description:
      "Layer company overview, earnings, sentiment, and technical indicators on top of price data with aggressive Redis caching.",
  },
];

const workflow = [
  "Create a secure portfolio for each strategy or investment goal.",
  "Add transactions as trades happen, with holdings updated automatically.",
  "Review live enriched portfolio value and profit/loss in one place.",
  "Use fundamentals, sentiment, and historical data to validate decisions.",
];

const dataPillars = [
  "5 minute quote cache",
  "1 hour history cache",
  "24 hour fundamentals cache",
  "Rate-limit aware Alpha Vantage calls",
  "Authenticated API access",
  "Redis-backed performance",
];

function GlassButton({
  children,
  href,
  variant = "primary",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <a
      href={href}
      className={`glass-button ${variant === "secondary" ? "glass-button-secondary" : ""}`}
    >
      {children}
    </a>
  );
}

function MenuVertical() {
  return (
    <nav className="vertical-menu" aria-label="Primary navigation">
      {navItems.map((item) => (
        <a key={item.href} href={item.href} className="vertical-menu-link">
          <span className="vertical-menu-arrow" aria-hidden="true">
            -&gt;
          </span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#101412]">
      <section id="home" className="hero-shell">
        <div className="hero-background" aria-hidden="true" />
        <header className="site-header">
          <a href="#home" className="brand-mark" aria-label="Investment Intelligence home">
            <span className="brand-icon" aria-hidden="true">
              II
            </span>
            <span>Investment Intelligence</span>
          </a>
          <GlassButton href="/auth">Launch App</GlassButton>
        </header>

        <div className="hero-content">
          <div className="hero-copy">
            <p className="hero-kicker">AI-ready portfolio intelligence</p>
            <h1>Take charge of your portfolio now.</h1>
            <p className="hero-description">
              Build portfolios, record trades, monitor real-time profit and loss, and enrich market
              research with fundamentals, earnings, news sentiment, and technical indicators.
            </p>
            <div className="hero-actions">
              <GlassButton href="/auth">Get Started</GlassButton>
              <GlassButton href="/app" variant="secondary">
                Open Dashboard
              </GlassButton>
            </div>
          </div>
          <MenuVertical />
        </div>
      </section>

      <section id="features" className="section-band section-light">
        <div className="section-inner">
          <div className="section-heading">
            <p className="section-kicker">Features and use</p>
            <h2>One workspace for market data, portfolios, and disciplined trade tracking.</h2>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <p>{feature.eyebrow}</p>
                <h3>{feature.title}</h3>
                <span>{feature.description}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="section-band section-ink">
        <div className="section-inner workflow-layout">
          <div>
            <p className="section-kicker">How investors use it</p>
            <h2>From trade entry to live portfolio conviction.</h2>
          </div>
          <ol className="workflow-list">
            {workflow.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="data" className="section-band section-light">
        <div className="section-inner data-layout">
          <div className="section-heading">
            <p className="section-kicker">Data integration</p>
            <h2>Built to respect API limits while keeping the interface fast.</h2>
            <p>
              The backend combines Yahoo Finance price feeds with Alpha Vantage enrichment, then
              stores high-value responses in Redis so repeated views stay responsive.
            </p>
          </div>
          <div className="data-pills">
            {dataPillars.map((pillar) => (
              <span key={pillar}>{pillar}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section-band closing-band">
        <div className="section-inner closing-inner">
          <div>
            <p className="section-kicker">Ready for the next layer</p>
            <h2>Connect the dashboard to these APIs and give investors a clean command center.</h2>
          </div>
          <GlassButton href="mailto:hello@investment-intelligence.app">Start a Conversation</GlassButton>
        </div>
      </section>
    </main>
  );
}
