import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={styles.root}>
      {/* Keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hero-tag   { animation: fadeUp 0.6s ease both; animation-delay: 0.1s; }
        .hero-h1    { animation: fadeUp 0.6s ease both; animation-delay: 0.25s; }
        .hero-sub   { animation: fadeUp 0.6s ease both; animation-delay: 0.4s; }
        .hero-cta   { animation: fadeUp 0.6s ease both; animation-delay: 0.55s; }
        .hero-img   { animation: fadeIn 0.9s ease both; animation-delay: 0.5s; }

        .btn-primary:hover { background: #1d4ed8 !important; transform: translateY(-1px); }
        .btn-ghost:hover   { background: rgba(255,255,255,0.06) !important; }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15) !important; }
        .nav-link:hover    { color: #fff !important; }
        .ticker-inner      { animation: ticker 28s linear infinite; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={styles.nav}>
        {/* Replaced span with a link and image for the logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo.svg" 
            alt="OfferGrid Logo" 
            style={styles.navLogo} 
          />
        </Link>
        
        <div style={styles.navLinks}>
          <a href="#features" className="nav-link" style={styles.navLink}>Features</a>
          <a href="#how" className="nav-link" style={styles.navLink}>How it works</a>
        </div>
        
        <div style={styles.navActions}>
          <Link href="/login" className="btn-ghost" style={styles.btnGhost}>Log in</Link>
          <Link href="/register" className="btn-primary" style={styles.btnPrimary}>Get started free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={styles.hero}>
        {/* Background grid */}
        <div style={styles.heroBg} aria-hidden="true" />
        {/* Glow blobs */}
        <div style={{ ...styles.blob, top: "10%", left: "60%", background: "rgba(37,99,235,0.18)", width: 520, height: 520 }} aria-hidden="true" />
        <div style={{ ...styles.blob, top: "50%", left: "10%", background: "rgba(99,102,241,0.12)", width: 380, height: 380 }} aria-hidden="true" />

        <div style={styles.heroInner}>
          <div style={styles.heroLeft}>
            <span className="hero-tag" style={styles.heroTag}>✦ Free to start · No credit card</span>

            <h1 className="hero-h1" style={styles.heroH1}>
              Your job hunt,<br />
              <em style={styles.heroItalic}>finally organised.</em>
            </h1>

            <p className="hero-sub" style={styles.heroSub}>
              Track every application, follow-up, and offer in one place.
              Stop losing opportunities in your inbox.
            </p>

            <div className="hero-cta" style={styles.heroCtaRow}>
              <Link href="/register" className="btn-primary" style={{ ...styles.btnPrimary, fontSize: 16, padding: "14px 32px" }}>
                Start tracking free →
              </Link>
              <Link href="/login" style={styles.heroSecondary}>
                Already have an account
              </Link>
            </div>

            <p style={styles.heroMeta}>Trusted by job seekers worldwide</p>
          </div>

          {/* Dashboard preview */}
          <div className="hero-img" style={styles.heroRight}>
            <div style={styles.mockWindow}>
              <div style={styles.mockBar}>
                <span style={{ ...styles.mockDot, background: "#ef4444" }} />
                <span style={{ ...styles.mockDot, background: "#f59e0b" }} />
                <span style={{ ...styles.mockDot, background: "#22c55e" }} />
                <span style={styles.mockTitle}>OfferFlow — Dashboard</span>
              </div>
              <div style={styles.mockBody}>
                {/* Stat row */}
                <div style={styles.mockStats}>
                  {[
                    { label: "Total", value: "24", color: "#2563eb" },
                    { label: "Interviews", value: "6", color: "#f59e0b" },
                    { label: "Offers", value: "2", color: "#10b981" },
                    { label: "Rejected", value: "5", color: "#ef4444" },
                  ].map((s) => (
                    <div key={s.label} style={{ ...styles.mockStat, borderLeft: `3px solid ${s.color}` }}>
                      <span style={styles.mockStatVal}>{s.value}</span>
                      <span style={styles.mockStatLbl}>{s.label}</span>
                    </div>
                  ))}
                </div>
                {/* Fake rows */}
                {[
                  { company: "Stripe", role: "Frontend Engineer", status: "Interviewing", color: "#f59e0b" },
                  { company: "Vercel", role: "DX Engineer", status: "Applied", color: "#2563eb" },
                  { company: "Linear", role: "Product Designer", status: "Offered", color: "#10b981" },
                  { company: "Figma", role: "Software Engineer", status: "Applied", color: "#2563eb" },
                ].map((row) => (
                  <div key={row.company} style={styles.mockRow}>
                    <div style={styles.mockRowLeft}>
                      <div style={styles.mockAvatar}>{row.company[0]}</div>
                      <div>
                        <div style={styles.mockRowCompany}>{row.company}</div>
                        <div style={styles.mockRowRole}>{row.role}</div>
                      </div>
                    </div>
                    <span style={{ ...styles.mockBadge, background: row.color + "22", color: row.color }}>
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div style={styles.ticker} aria-hidden="true">
        <div className="ticker-inner" style={styles.tickerInner}>
          {Array(8).fill("Track Applications · Stay Organised · Never Miss a Follow-up · Land Your Dream Job · ").map((t, i) => (
            <span key={i} style={styles.tickerItem}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionEyebrow}>Everything you need</p>
          <h2 style={styles.sectionH2}>Built for the modern job search</h2>

          <div style={styles.featuresGrid}>
            {[
              {
                icon: "◈",
                title: "Centralised tracking",
                desc: "Every application in one place — company, role, status, salary, and notes.",
                color: "#2563eb",
              },
              {
                icon: "◎",
                title: "Smart status pipeline",
                desc: "Define your own funnel stages with custom colours. See exactly where you stand.",
                color: "#8b5cf6",
              },
              {
                icon: "◉",
                title: "Follow-up reminders",
                desc: "Set follow-up dates and never let a hot application go cold.",
                color: "#10b981",
              },
              {
                icon: "◐",
                title: "Application timeline",
                desc: "A full history of every status change so you can learn what works.",
                color: "#f59e0b",
              },
              {
                icon: "◑",
                title: "Contact management",
                desc: "Store recruiter names, emails, and phones alongside each application.",
                color: "#ef4444",
              },
              {
                icon: "◒",
                title: "Private by default",
                desc: "Your data is yours. Each user sees only their own applications.",
                color: "#06b6d4",
              },
            ].map((f) => (
              <div key={f.title} className="feature-card" style={styles.featureCard}>
                <div style={{ ...styles.featureIcon, background: f.color + "18", color: f.color }}>
                  {f.icon}
                </div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ ...styles.section, background: "#0a0d14" }}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionEyebrow}>Simple by design</p>
          <h2 style={styles.sectionH2}>Up and running in 60 seconds</h2>

          <div style={styles.stepsRow}>
            {[
              { n: "01", title: "Create your account", desc: "Sign up for free — no credit card, no friction." },
              { n: "02", title: "Add your first application", desc: "Paste in the job details, pick a status, and you're done." },
              { n: "03", title: "Track and follow up", desc: "Update statuses as you progress. Set follow-up dates. Land the job." },
            ].map((step, i) => (
              <div key={step.n} style={styles.step}>
                <span style={styles.stepNum}>{step.n}</span>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
                {i < 2 && <div style={styles.stepArrow} aria-hidden="true">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={styles.ctaBanner}>
        <div style={styles.ctaBannerInner}>
          <h2 style={styles.ctaH2}>Ready to take control of your job search?</h2>
          <p style={styles.ctaSub}>Join thousands of job seekers who track smarter.</p>
          <Link href="/register" className="btn-primary" style={{ ...styles.btnPrimary, fontSize: 16, padding: "16px 40px" }}>
            Create your free account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <span style={styles.footerLogo}>OfferFlow</span>
        <p style={styles.footerText}>© {new Date().getFullYear()} OfferFlow. All rights reserved.</p>
        <div style={styles.footerLinks}>
          <Link href="/login" style={styles.footerLink}>Log in</Link>
          <Link href="/register" style={styles.footerLink}>Sign up</Link>
        </div>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  root: {
    backgroundColor: "#080b12",
    color: "#e2e8f0",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    overflowX: "hidden",
  },

  // ── Nav
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: '1rem 2rem', position: "sticky", top: 0, zIndex: 100,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "rgba(8,11,18,0.85)", backdropFilter: "blur(12px)",
  },
  navLogo: {
    height: '68px',
    width: 'auto',
    cursor: 'pointer',
  },
  navLinks: { display: "flex", gap: 32 },
  navLink: { fontSize: 14, color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" },
  navActions: { display: "flex", gap: 12, alignItems: "center" },
  btnGhost: {
    padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
    fontSize: 14, fontWeight: 500, color: "#cbd5e1", textDecoration: "none",
    transition: "background 0.2s",
  },
  btnPrimary: {
    padding: "9px 20px", borderRadius: 8, backgroundColor: "#2563eb",
    fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none",
    border: "none", cursor: "pointer", transition: "background 0.2s, transform 0.15s",
    display: "inline-block",
  },

  // ── Hero
  hero: {
    position: "relative", overflow: "hidden",
    padding: "100px 48px 80px", minHeight: "92vh",
    display: "flex", alignItems: "center",
  },
  heroBg: {
    position: "absolute", inset: 0,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
    backgroundSize: "60px 60px", pointerEvents: "none",
  },
  blob: {
    position: "absolute", borderRadius: "50%",
    filter: "blur(90px)", pointerEvents: "none", transform: "translate(-50%,-50%)",
  },
  heroInner: {
    position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto",
    width: "100%", display: "flex", alignItems: "center", gap: 64,
  },
  heroLeft: { flex: "0 0 48%" },
  heroTag: {
    display: "inline-block", fontSize: 12, fontWeight: 600,
    color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em",
    backgroundColor: "rgba(37,99,235,0.12)", padding: "6px 14px",
    borderRadius: 20, marginBottom: 28, border: "1px solid rgba(37,99,235,0.25)",
  },
  heroH1: {
    fontFamily: '"Inter", sans-serif', fontSize: "clamp(44px, 5vw, 68px)",
    fontWeight: 400, lineHeight: 1.1, color: "#f8fafc",
    margin: "0 0 24px", letterSpacing: "-1px",
  },
  heroItalic: { fontStyle: "italic", color: "#60a5fa" },
  heroSub: {
    fontSize: 18, lineHeight: 1.7, color: "#94a3b8",
    margin: "0 0 36px", maxWidth: 440,
  },
  heroCtaRow: { display: "flex", alignItems: "center", gap: 24, marginBottom: 24 },
  heroSecondary: {
    fontSize: 14, color: "#64748b", textDecoration: "underline",
    textUnderlineOffset: 3,
  },
  heroMeta: { fontSize: 12, color: "#475569", margin: 0 },

  // ── Mock window
  heroRight: { flex: 1 },
  mockWindow: {
    backgroundColor: "#111827", borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  mockBar: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "#0f172a",
  },
  mockDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  mockTitle: { fontSize: 11, color: "#475569", marginLeft: 8 },
  mockBody: { padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  mockStats: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 4 },
  mockStat: {
    backgroundColor: "#1e293b", borderRadius: 8, padding: "10px 12px",
    display: "flex", flexDirection: "column", gap: 2,
  },
  mockStatVal: { fontSize: 20, fontWeight: 700, color: "#f1f5f9" },
  mockStatLbl: { fontSize: 10, color: "#64748b", textTransform: "uppercase" },
  mockRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#1e293b", borderRadius: 8, padding: "10px 12px",
  },
  mockRowLeft: { display: "flex", alignItems: "center", gap: 10 },
  mockAvatar: {
    width: 30, height: 30, borderRadius: 6, backgroundColor: "#334155",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, color: "#94a3b8", flexShrink: 0,
  },
  mockRowCompany: { fontSize: 13, fontWeight: 600, color: "#e2e8f0" },
  mockRowRole: { fontSize: 11, color: "#64748b" },
  mockBadge: { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 },

  // ── Ticker
  ticker: {
    overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    padding: "14px 0", backgroundColor: "#0d1117",
  },
  tickerInner: { display: "flex", whiteSpace: "nowrap" },
  tickerItem: { fontSize: 12, color: "#334155", fontWeight: 500, letterSpacing: "0.05em", paddingRight: 0 },

  // ── Sections
  section: { padding: "100px 48px", backgroundColor: "#080b12" },
  sectionInner: { maxWidth: 1100, margin: "0 auto" },
  sectionEyebrow: {
    fontSize: 12, fontWeight: 600, color: "#2563eb",
    textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
  },
  sectionH2: {
    fontFamily: '"Inter", sans-serif', fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: 400, color: "#f8fafc", margin: "0 0 56px", letterSpacing: "-0.5px",
  },

  // ── Features grid
  featuresGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
  },
  featureCard: {
    backgroundColor: "#0f1623", borderRadius: 14, padding: 28,
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "transform 0.2s, border-color 0.2s",
  },
  featureIcon: {
    fontSize: 22, width: 44, height: 44, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  featureTitle: { fontSize: 16, fontWeight: 600, color: "#f1f5f9", margin: "0 0 8px" },
  featureDesc: { fontSize: 14, lineHeight: 1.65, color: "#64748b", margin: 0 },

  // ── Steps
  stepsRow: {
    display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 40,
    position: "relative",
  },
  step: { position: "relative" },
  stepNum: {
    display: "block", fontFamily: '"Inter", sans-serif',
    fontSize: 56, color: "rgba(37,99,235,0.2)", lineHeight: 1, marginBottom: 16,
  },
  stepTitle: { fontSize: 18, fontWeight: 600, color: "#f1f5f9", margin: "0 0 10px" },
  stepDesc: { fontSize: 14, lineHeight: 1.7, color: "#64748b", margin: 0 },
  stepArrow: {
    position: "absolute", right: -28, top: 16,
    fontSize: 24, color: "rgba(37,99,235,0.3)",
  },

  // ── CTA Banner
  ctaBanner: {
    padding: "100px 48px",
    background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.2) 0%, transparent 70%), #080b12",
    textAlign: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  ctaBannerInner: { maxWidth: 640, margin: "0 auto" },
  ctaH2: {
    fontFamily: '"Inter", sans-serif', fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 400, color: "#f8fafc", margin: "0 0 16px", letterSpacing: "-0.5px",
  },
  ctaSub: { fontSize: 16, color: "#64748b", margin: "0 0 36px" },

  // ── Footer
  footer: {
    padding: "28px 48px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#080b12",
  },
  footerLogo: {
    fontFamily: '"Inter", sans-serif', fontSize: 18, color: "#475569",
  },
  footerText: { fontSize: 12, color: "#334155", margin: 0 },
  footerLinks: { display: "flex", gap: 20 },
  footerLink: { fontSize: 13, color: "#475569", textDecoration: "none" },
};