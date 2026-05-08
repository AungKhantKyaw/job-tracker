"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./forgot.module.css";
import Image from "next/image";
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
      const res = await fetch(`/api/auth/forgot-password`, {
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
    <div className={styles.wrapper}>
      <div className={styles.gridBg} />
      <div className={styles.blob} />

      <Link href="/" className={styles.back}>
        ← Back
      </Link>

      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Image src="/logo.svg" alt="OfferGrid" width={120} height={40} />
        </div>

        {!submitted ? (
          <>
            <div className={styles.header}>
              <h1>Forgot password?</h1>
              <p>Enter your email and we’ll send you a reset link</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
              </div>

              <button className={styles.button} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className={styles.footer}>
              <Link href="/login">← Back to login</Link>
            </div>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.icon}>📩</div>

            <h1>Check your inbox</h1>
            <p>
              If <strong>{email}</strong> is registered, you’ll receive a reset link shortly.
            </p>

            <p className={styles.hint}>
              Didn’t get it? Check spam or{" "}
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className={styles.linkBtn}
              >
                try again
              </button>
              .
            </p>

            <Link href="/login" className={styles.footerLink}>
              ← Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}