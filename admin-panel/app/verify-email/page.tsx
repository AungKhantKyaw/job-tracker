"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

type State = "loading" | "success" | "error" | "invalid";

export default function VerifyEmailPage() {
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setState("invalid");
      setMessage("No verification token found. Check your email link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/auth/verify-email?token=${token}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Verification failed.");
        setState("success");
        setMessage(data.message);
      } catch (err: any) {
        setState("error");
        setMessage(err.message || "Something went wrong.");
      }
    };

    verify();
  }, []);

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .card { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div style={styles.bg} aria-hidden="true" />

      <Link href="/" style={styles.logo}>
        JobTracker
      </Link>

      <div className="card" style={styles.card}>
        {state === "loading" && (
          <>
            <div style={styles.spinner} aria-label="Verifying…" />
            <h1 style={styles.title}>Verifying your email…</h1>
            <p style={styles.sub}>This will just take a moment.</p>
          </>
        )}

        {state === "success" && (
          <>
            <div style={styles.iconWrap}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={styles.title}>Email verified!</h1>
            <p style={styles.sub}>{message}</p>
            <Link href="/login" style={styles.btn}>
              Sign in to your account →
            </Link>
          </>
        )}

        {(state === "error" || state === "invalid") && (
          <>
            <div style={{ ...styles.iconWrap, backgroundColor: "#fef2f2" }}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 style={styles.title}>Verification failed</h1>
            <p style={styles.sub}>{message}</p>
            <p style={styles.hint}>
              The link may have expired. Request a new one below.
            </p>
            <ResendForm />
          </>
        )}
      </div>
    </div>
  );
}

// Inline resend form shown on error
function ResendForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002"}/api/auth/send-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent)
    return (
      <p style={{ color: "#16a34a", fontSize: 14, marginTop: 16 }}>
        ✓ Check your inbox for a new link.
      </p>
    );

  return (
    <form
      onSubmit={handleResend}
      style={{ marginTop: 20, display: "flex", gap: 8 }}
    >
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          flex: 1,
          padding: "9px 12px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          fontSize: 14,
        }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "9px 16px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "…" : "Resend"}
      </button>
    </form>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#080b12",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    padding: 20,
    position: "relative",
  },
  bg: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  logo: {
    position: "absolute",
    top: 24,
    left: 32,
    fontFamily: '"Instrument Serif", serif',
    fontSize: 20,
    color: "#f1f5f9",
    textDecoration: "none",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0f1623",
    borderRadius: 20,
    padding: "44px 40px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
    textAlign: "center",
  },
  spinner: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "3px solid rgba(255,255,255,0.08)",
    borderTopColor: "#2563eb",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 20px",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    backgroundColor: "#f0fdf4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  title: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 26,
    fontWeight: 400,
    color: "#f8fafc",
    margin: "0 0 10px",
    letterSpacing: "-0.5px",
  },
  sub: { fontSize: 14, color: "#64748b", margin: "0 0 24px", lineHeight: 1.6 },
  hint: { fontSize: 13, color: "#475569", margin: "-12px 0 0" },
  btn: {
    display: "inline-block",
    padding: "11px 24px",
    backgroundColor: "#2563eb",
    color: "#fff",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
  },
};
