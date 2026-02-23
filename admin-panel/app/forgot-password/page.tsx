"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .card { animation: fadeUp 0.4s ease both; }
        .input-field:focus { border-color: #2563eb !important; outline: none; }
        .submit-btn:hover:not(:disabled) { background: #1d4ed8 !important; }
      `}</style>

      <div style={styles.bg} aria-hidden="true" />
      <div style={styles.blob} aria-hidden="true" />

      <Link href="/" style={styles.logo}>
        OfferFlow
      </Link>

      <div className="card" style={styles.card}>
        {submitted ? (
          // ── Success state
          <div style={{ textAlign: "center" }}>
            <div style={styles.successIcon}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h1 style={styles.title}>Check your inbox</h1>
            <p style={styles.sub}>
              If <strong style={{ color: "#e2e8f0" }}>{email}</strong> is
              registered, you'll receive a password reset link shortly.
            </p>
            <p style={styles.hint}>
              Didn't get it? Check your spam folder, or{" "}
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                style={styles.inlineBtn}
              >
                try again
              </button>
              .
            </p>
            <Link href="/login" style={styles.backLink}>
              ← Back to login
            </Link>
          </div>
        ) : (
          // ── Form state
          <>
            <div style={styles.header}>
              <div style={styles.iconWrap}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
              </div>
              <h1 style={styles.title}>Forgot password?</h1>
              <p style={styles.sub}>
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form} noValidate>
              <div style={styles.field}>
                <label htmlFor="email" style={styles.label}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="jane@example.com"
                  required
                  autoComplete="email"
                  className="input-field"
                  style={styles.input}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner} />
                    Sending link…
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 24 }}>
              <Link href="/login" style={styles.footerLink}>
                ← Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
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
    overflow: "hidden",
  },
  bg: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  blob: {
    position: "fixed",
    top: "10%",
    right: "10%",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "rgba(99,102,241,0.1)",
    filter: "blur(80px)",
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
    padding: "40px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },
  header: { textAlign: "center", marginBottom: 28 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(99,102,241,0.15)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 26,
    fontWeight: 400,
    color: "#f8fafc",
    margin: "0 0 8px",
    letterSpacing: "-0.5px",
  },
  sub: { fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    color: "#f87171",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 20,
    border: "1px solid rgba(239,68,68,0.2)",
    fontWeight: 500,
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.03em",
  },
  input: {
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 15,
    backgroundColor: "#080b12",
    color: "#f1f5f9",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  submitBtn: {
    padding: "13px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "background 0.2s",
  },
  spinner: {
    display: "inline-block",
    width: 15,
    height: 15,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footerLink: { fontSize: 13, color: "#475569", textDecoration: "none" },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    backgroundColor: "#f0fdf4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  hint: {
    fontSize: 13,
    color: "#475569",
    margin: "12px 0 20px",
    lineHeight: 1.6,
  },
  inlineBtn: {
    background: "none",
    border: "none",
    color: "#60a5fa",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    padding: 0,
    textDecoration: "underline",
  },
  backLink: {
    display: "inline-block",
    fontSize: 13,
    color: "#475569",
    textDecoration: "none",
    marginTop: 4,
  },
};
