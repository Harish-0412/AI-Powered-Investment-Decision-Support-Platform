import Link from "next/link";

export default function PortfolioIndexPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#101412]">
      <section className="section-band section-light" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <div className="section-inner" style={{ textAlign: "center" }}>
          <p className="section-kicker">Developer portfolio</p>
          <h2>Sign up to publish your engineering portfolio.</h2>
          <p style={{ marginTop: 16, color: "#52625a" }}>
            After registration, complete the step-by-step onboarding to build a recruiter-ready profile
            with projects, skills, GitHub activity, and contact links.
          </p>
          <div className="hero-actions" style={{ justifyContent: "center", marginTop: 28 }}>
            <Link href="/auth" className="glass-button" style={{ color: "#101412", borderColor: "#10141233" }}>
              Get started
            </Link>
            <Link href="/" className="glass-button glass-button-secondary" style={{ color: "#101412" }}>
              Product home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
