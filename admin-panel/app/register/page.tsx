"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const toast = useToast();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!EMAIL_RE.test(formData.email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (formData.password !== formData.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");

      const loginRes = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        router.push("/login?registered=true");
        return;
      }

      sessionStorage.setItem(
        "user",
        JSON.stringify({
          name: loginData.user.name,
          email: loginData.user.email,
          role: loginData.user.role,
        }),
      );

      router.push("/admin/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .register-card { animation: fadeUp 0.5s ease both; }
        .input-field:focus { border-color: #2563eb !important; outline: none; }
        .submit-btn:hover:not(:disabled) { background: #1d4ed8 !important; transform: translateY(-1px); }
      `}</style>

      {/* Background */}
      <div style={styles.bg} aria-hidden="true" />
      <div style={styles.blobBlue} aria-hidden="true" />
      <div style={styles.blobPurple} aria-hidden="true" />

      {/* Nav */}
      <nav style={styles.nav}>
        <Link href="/" style={styles.navLogo}>
          OfferFlow
        </Link>
        <span style={styles.navHint}>
          Already have an account?{" "}
          <Link href="/login" style={styles.navLink}>
            Log in
          </Link>
        </span>
      </nav>

      {/* Card */}
      <div style={styles.center}>
        <div className="register-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <h1 style={styles.title}>Create your account</h1>
            <p style={styles.subtitle}>Free forever · No credit card needed</p>
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

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            <div style={styles.field}>
              <label htmlFor="name" style={styles.label}>
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jane Smith"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className="input-field"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="input-field"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="input-field"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="confirm" style={styles.label}>
                Confirm Password
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                placeholder="Repeat your password"
                value={formData.confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="input-field"
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
              style={{
                ...styles.submitBtn,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <>
                  <span style={styles.spinner} aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                "Create account →"
              )}
            </button>
          </form>

          <p style={styles.terms}>
            By signing up you agree to our{" "}
            <span style={styles.termsLink}>Terms of Service</span> and{" "}
            <span style={styles.termsLink}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#080b12",
    fontFamily: '"DM Sans", system-ui, sans-serif',
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
  blobBlue: {
    position: "fixed",
    top: "5%",
    right: "10%",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "rgba(37,99,235,0.12)",
    filter: "blur(90px)",
    pointerEvents: "none",
  },
  blobPurple: {
    position: "fixed",
    bottom: "10%",
    left: "5%",
    width: 380,
    height: 380,
    borderRadius: "50%",
    background: "rgba(99,102,241,0.1)",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  nav: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 48px",
  },
  navLogo: {
    fontFamily: '"Inter", sans-serif',
    fontSize: 20,
    color: "#f1f5f9",
    textDecoration: "none",
  },
  navHint: { fontSize: 14, color: "#64748b" },
  navLink: { color: "#60a5fa", textDecoration: "none", fontWeight: 500 },
  center: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px 60px",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#0f1623",
    borderRadius: 20,
    padding: "40px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },
  cardHeader: { textAlign: "center", marginBottom: 28 },
  title: {
    fontFamily: '"Inter", sans-serif',
    fontSize: 28,
    fontWeight: 400,
    color: "#f8fafc",
    margin: "0 0 8px",
    letterSpacing: "-0.5px",
  },
  subtitle: { fontSize: 13, color: "#475569", margin: 0 },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    color: "#f87171",
    padding: "11px 14px",
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 20,
    border: "1px solid rgba(239,68,68,0.2)",
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
    marginTop: 6,
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
    transition: "background 0.2s, transform 0.15s",
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
  terms: { fontSize: 11, color: "#334155", textAlign: "center", marginTop: 20 },
  termsLink: {
    color: "#475569",
    textDecoration: "underline",
    cursor: "pointer",
  },
};
