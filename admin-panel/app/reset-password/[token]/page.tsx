"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

interface Props {
  params: Promise<{ token: string }>;
}

export default function ResetPasswordPage({ params: paramsPromise }: Props) {
  const toast = useToast();
  const params = use(paramsPromise);
  const { token } = params;
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed.");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const strength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"][
    strength
  ];
  const strengthColor = [
    "",
    "#ef4444",
    "#f59e0b",
    "#eab308",
    "#22c55e",
    "#16a34a",
  ][strength];

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
        .eye-btn:hover { color: #94a3b8 !important; }
      `}</style>

      <div style={styles.bg} aria-hidden="true" />
      <div style={styles.blob} aria-hidden="true" />

      <Link href="/" style={styles.logo}>
        OfferGrid
      </Link>

      <div className="card" style={styles.card}>
        {success ? (
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 style={styles.title}>Password reset!</h1>
            <p style={styles.sub}>
              Your password has been updated successfully. Redirecting you to
              login…
            </p>
            <Link href="/login" style={styles.btn}>
              Go to login →
            </Link>
          </div>
        ) : (
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
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h1 style={styles.title}>Set new password</h1>
              <p style={styles.sub}>
                Choose a strong password for your account.
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
              {/* New password */}
              <div style={styles.field}>
                <label htmlFor="password" style={styles.label}>
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Min. 8 characters"
                    required
                    autoComplete="new-password"
                    className="input-field"
                    style={{ ...styles.input, paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="eye-btn"
                    style={styles.eyeBtn}
                    aria-label={showPassword ? "Hide" : "Show"}
                  >
                    {showPassword ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Strength meter */}
                {password && (
                  <div style={styles.strengthWrap}>
                    <div style={styles.strengthBars}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div
                          key={n}
                          style={{
                            ...styles.strengthBar,
                            backgroundColor:
                              n <= strength
                                ? strengthColor
                                : "rgba(255,255,255,0.08)",
                          }}
                        />
                      ))}
                    </div>
                    <span
                      style={{ ...styles.strengthLabel, color: strengthColor }}
                    >
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div style={styles.field}>
                <label htmlFor="confirm" style={styles.label}>
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setError("");
                  }}
                  placeholder="Repeat new password"
                  required
                  autoComplete="new-password"
                  className="input-field"
                  style={styles.input}
                />
                {confirm && password !== confirm && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#f87171",
                      margin: "4px 0 0",
                    }}
                  >
                    Passwords don't match
                  </p>
                )}
                {confirm && password === confirm && password.length >= 8 && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#4ade80",
                      margin: "4px 0 0",
                    }}
                  >
                    ✓ Passwords match
                  </p>
                )}
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
                    Resetting…
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 20 }}>
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
    bottom: "15%",
    left: "10%",
    width: 380,
    height: 380,
    borderRadius: "50%",
    background: "rgba(37,99,235,0.1)",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  logo: {
    position: "absolute",
    top: 24,
    left: 32,
    fontFamily: '"Inter", sans-serif',
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
    fontFamily: '"Inter", sans-serif',
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
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    padding: 4,
    transition: "color 0.2s",
  },
  strengthWrap: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 },
  strengthBars: { display: "flex", gap: 3, flex: 1 },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    transition: "background-color 0.3s",
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: 600,
    minWidth: 60,
    textAlign: "right",
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
  btn: {
    display: "inline-block",
    marginTop: 20,
    padding: "11px 24px",
    backgroundColor: "#2563eb",
    color: "#fff",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
  },
};
