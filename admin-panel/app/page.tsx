import Link from "next/link";
import styles from "./landing.module.css";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Page | OfferGrid",
};

export default function LandingPage() {
  return (
    <div className={styles.root}>
      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.svg" alt="OfferGrid Logo" className={styles.navLogo} width={100} height={42} />
        </Link>
        
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#how" className={styles.navLink}>How it works</a>
        </div>
        
        <div className={styles.navActions}>
          <Link href="/login" className={styles.btnGhost}>Log in</Link>
          <Link href="/register" className={styles.btnPrimary}>Get started free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.blob} style={{ top: "10%", left: "60%", background: "rgba(37,99,235,0.18)", width: 520, height: 520 }} aria-hidden="true" />
        <div className={styles.blob} style={{ top: "50%", left: "10%", background: "rgba(99,102,241,0.12)", width: 380, height: 380 }} aria-hidden="true" />

        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <span className={styles.heroTag}>✦ Free to start · No credit card</span>
            <h1 className={styles.heroH1}>
              Your job hunt,<br />
              <em className={styles.heroItalic}>finally organised.</em>
            </h1>
            <p className={styles.heroSub}>
              Track every application, follow-up, and offer in one place.
              Stop losing opportunities in your inbox.
            </p>
            <div className={styles.heroCtaRow}>
              <Link href="/register" className={styles.btnPrimary} style={{ fontSize: 16, padding: "14px 32px" }}>
                Start tracking free →
              </Link>
              <Link href="/login" className={styles.heroSecondary}>
                Already have an account
              </Link>
            </div>
            <p className={styles.heroMeta}>Trusted by job seekers worldwide</p>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.mockWindow}>
              <div className={styles.mockBar}>
                <span className={styles.mockDot} style={{ background: "#ef4444" }} />
                <span className={styles.mockDot} style={{ background: "#f59e0b" }} />
                <span className={styles.mockDot} style={{ background: "#22c55e" }} />
                <span className={styles.mockTitle}>OfferFlow — Dashboard</span>
              </div>
              <div className={styles.mockBody}>
                <div className={styles.mockStats}>
                  {[
                    { label: "Total", value: "24", color: "#2563eb" },
                    { label: "Interviews", value: "6", color: "#f59e0b" },
                    { label: "Offers", value: "2", color: "#10b981" },
                    { label: "Rejected", value: "5", color: "#ef4444" },
                  ].map((s) => (
                    <div key={s.label} className={styles.mockStat} style={{ borderLeft: `3px solid ${s.color}` }}>
                      <span className={styles.mockStatVal}>{s.value}</span>
                      <span className={styles.mockStatLbl}>{s.label}</span>
                    </div>
                  ))}
                </div>
                {[
                  { company: "Stripe", role: "Frontend Engineer", status: "Interviewing", color: "#f59e0b" },
                  { company: "Vercel", role: "DX Engineer", status: "Applied", color: "#2563eb" },
                  { company: "Linear", role: "Product Designer", status: "Offered", color: "#10b981" },
                  { company: "Figma", role: "Software Engineer", status: "Applied", color: "#2563eb" },
                ].map((row) => (
                  <div key={row.company} className={styles.mockRow}>
                    <div className={styles.mockRowLeft}>
                      <div className={styles.mockAvatar}>{row.company[0]}</div>
                      <div>
                        <div className={styles.mockRowCompany}>{row.company}</div>
                        <div className={styles.mockRowRole}>{row.role}</div>
                      </div>
                    </div>
                    <span className={styles.mockBadge} style={{ background: row.color + "22", color: row.color }}>
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
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerInner}>
          {Array(8).fill("Track Applications · Stay Organised · Never Miss a Follow-up · Land Your Dream Job · ").map((t, i) => (
            <span key={i} className={styles.tickerItem}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className={styles.section}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionEyebrow}>Everything you need</p>
          <h2 className={styles.sectionH2}>Built for the modern job search</h2>
          <div className={styles.featuresGrid}>
            {[
              { icon: "◈", title: "Centralised tracking", desc: "Every application in one place — company, role, status, salary, and notes.", color: "#2563eb" },
              { icon: "◎", title: "Smart status pipeline", desc: "Define your own funnel stages with custom colours. See exactly where you stand.", color: "#8b5cf6" },
              { icon: "◉", title: "Follow-up reminders", desc: "Set follow-up dates and never let a hot application go cold.", color: "#10b981" },
              { icon: "◐", title: "Application timeline", desc: "A full history of every status change so you can learn what works.", color: "#f59e0b" },
              { icon: "◑", title: "Contact management", desc: "Store recruiter names, emails, and phones alongside each application.", color: "#ef4444" },
              { icon: "◒", title: "Private by default", desc: "Your data is yours. Each user sees only their own applications.", color: "#06b6d4" },
            ].map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon} style={{ background: f.color + "18", color: f.color }}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className={styles.section} style={{ background: "#0a0d14" }}>
        <div className={styles.sectionInner}>
          <p className={styles.sectionEyebrow}>Simple by design</p>
          <h2 className={styles.sectionH2}>Up and running in 60 seconds</h2>
          <div className={styles.stepsRow}>
            {[
              { n: "01", title: "Create your account", desc: "Sign up for free — no credit card, no friction." },
              { n: "02", title: "Add your first application", desc: "Paste in the job details, pick a status, and you're done." },
              { n: "03", title: "Track and follow up", desc: "Update statuses as you progress. Set follow-up dates. Land the job." },
            ].map((step) => (
              <div key={step.n} className={styles.step}>
                <span className={styles.stepNum}>{step.n}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaBanner}>
        <div className={styles.sectionInner}>
          <h2 className={styles.ctaH2}>Ready to take control of your job search?</h2>
          <p className={styles.ctaSub}>Join thousands of job seekers who track smarter.</p>
          <Link href="/register" className={styles.btnPrimary} style={{ fontSize: 16, padding: "16px 40px" }}>
            Create your free account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span className={styles.footerLogo}>OfferFlow</span>
        <p className={styles.footerText}>© {new Date().getFullYear()} OfferFlow. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <Link href="/login" className={styles.footerLink}>Log in</Link>
          <Link href="/register" className={styles.footerLink}>Sign up</Link>
        </div>
      </footer>
    </div>
  );
}