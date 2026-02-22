"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 8;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [cooldown, setCooldown] = useState(false);

  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

  const startCooldown = () => {
    setCooldown(true);
    setTimeout(() => setCooldown(false), 15000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
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
      const response = await fetch(`${baseUrl}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },       
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      sessionStorage.setItem("user", JSON.stringify({
        name: data.user.name,
        role: data.user.role,
        email: data.user.email,
      }));
            
      const redirectPath = '/admin/dashboard';
     
      router.push(redirectPath);
    } catch (err) {
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
      {/* Subtle background grid */}
      <div style={styles.bgGrid} aria-hidden="true" />

      <div style={styles.loginCard}>
        <div style={styles.headerArea}>
          <div style={styles.iconWrapper} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={styles.title}>Admin Login</h1>
          <p style={styles.subtitle}>Enter your credentials to continue</p>
        </div>

        {error && (
          <div role="alert" style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form} noValidate>
          {/* Email */}
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              required
              autoComplete="email"
              style={styles.input}
            />
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
                autoComplete="current-password"
                style={{ ...styles.input, paddingRight: "48px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            style={{ ...styles.button, ...(isDisabled ? styles.buttonDisabled : {}) }}
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

        <p style={styles.footerText}>🔒 Secure Admin Access Only</p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  pageWrapper: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#0f1117",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    overflow: "hidden",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  loginCard: {
    position: "relative",
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#181c27",
    padding: "44px 40px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
    animation: "fadeIn 0.4s ease both",
  },
  headerArea: {
    textAlign: "center",
    marginBottom: "32px",
  },
  iconWrapper: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    backgroundColor: "rgba(99,102,241,0.15)",
    borderRadius: "14px",
    color: "#818cf8",
    marginBottom: "16px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#f1f5f9",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(239,68,68,0.1)",
    color: "#f87171",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "13.5px",
    marginBottom: "20px",
    border: "1px solid rgba(239,68,68,0.2)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: "0.02em",
  },
  passwordWrapper: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#0f1117",
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
  },
  button: {
    marginTop: "6px",
    padding: "13px",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background-color 0.2s, opacity 0.2s",
  },
  buttonDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  spinner: {
    display: "inline-block",
    width: "15px",
    height: "15px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footerText: {
    textAlign: "center",
    marginTop: "28px",
    fontSize: "12px",
    color: "#334155",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
};

export default Login;