"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const ROLE_REDIRECTS = {
  admin:  "/admin/dashboard",
  user:   "/dashboard",
};

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password: string) => password.length >= 8;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [cooldown, setCooldown] = useState(false);

  const router = useRouter();

  const startCooldown = () => {
    setCooldown(true);
    setTimeout(() => setCooldown(false), 15000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (cooldown) {
      setError("Too many attempts. Please wait before trying again.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Invalid email or password.");

      // Save display data to sessionStorage
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        }),
      );

      // ✅ Redirect to where they came from, or role-based default
      const from = new URLSearchParams(window.location.search).get("from");
      const fallback = ROLE_REDIRECTS[data.user.role] || "/admin/dashboard";
      router.push(from || fallback);
    } catch (err: any) {
      const newFailCount = failCount + 1;
      setFailCount(newFailCount);
      if (newFailCount >= 3) startCooldown();
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || cooldown;

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .input-field:focus { border-color: #6366f1 !important; outline: none; }
        .eye-btn:hover { color: #94a3b8 !important; }
      `}</style>

      <div style={styles.bgGrid} aria-hidden="true" />
      <div style={styles.blobBlue} aria-hidden="true" />

      {/* Back to landing */}
      <Link href="/" style={styles.backLink}>
        ← Back to home
      </Link>

      <div style={styles.loginCard}>
        <div style={styles.headerArea}>
          <div style={styles.iconWrapper} aria-hidden="true">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to your JobTracker account</p>
        </div>

        {error && (
          <div role="alert" style={styles.errorBox}>
            <svg
              width="15"
              height="15"
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

        <form onSubmit={handleLogin} style={styles.form} noValidate>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              autoComplete="email"
              className="input-field"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <div style={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                autoComplete="current-password"
                className="input-field"
                style={{ ...styles.input, paddingRight: "48px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="eye-btn"
                style={styles.eyeButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            style={{
              ...styles.button,
              ...(isDisabled ? styles.buttonDisabled : {}),
            }}
          >
            {isLoading ? (
              <>
                <span style={styles.spinner} aria-hidden="true" />
                Signing in…
              </>
            ) : cooldown ? (
              "Too many attempts — wait 15s"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={styles.footerLink}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#080b12",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    overflow: "hidden",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  blobBlue: {
    position: "absolute",
    top: "20%",
    right: "15%",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "rgba(99,102,241,0.12)",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  backLink: {
    position: "absolute",
    top: 24,
    left: 32,
    fontSize: 13,
    color: "#475569",
    textDecoration: "none",
    zIndex: 10,
    transition: "color 0.2s",
  },
  loginCard: {
    position: "relative",
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#0f1623",
    padding: "44px 40px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
    animation: "fadeIn 0.4s ease both",
  },
  headerArea: { textAlign: "center", marginBottom: "32px" },
  iconWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "54px",
    height: "54px",
    backgroundColor: "rgba(99,102,241,0.15)",
    borderRadius: "14px",
    color: "#818cf8",
    marginBottom: "16px",
  },
  title: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: "26px",
    fontWeight: 400,
    color: "#f1f5f9",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
  },
  subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(239,68,68,0.1)",
    color: "#f87171",
    padding: "11px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "20px",
    border: "1px solid rgba(239,68,68,0.2)",
  },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.03em",
  },
  passwordWrapper: { position: "relative" },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "15px",
    backgroundColor: "#080b12",
    color: "#f1f5f9",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  eyeButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    padding: "4px",
    transition: "color 0.2s",
  },
  button: {
    marginTop: "6px",
    padding: "13px",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background-color 0.2s, opacity 0.2s",
  },
  buttonDisabled: { opacity: 0.55, cursor: "not-allowed" },
  spinner: {
    display: "inline-block",
    width: "15px",
    height: "15px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footer: { marginTop: "28px", textAlign: "center" },
  footerText: { fontSize: "13px", color: "#475569", margin: 0 },
  footerLink: { color: "#818cf8", textDecoration: "none", fontWeight: 500 },
};
