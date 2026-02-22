"use client";

import { useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export default function UserProfilePage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem("user") || "{}");
      setFormData((prev) => ({
        ...prev,
        name: u.name || "",
        email: u.email || "",
      }));
    } catch {}
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (formData.password && formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (formData.password && formData.password !== formData.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const body: Partial<FormData> = {
        name: formData.name.trim(),
        email: formData.email,
      };
      if (formData.password) body.password = formData.password;

      const res = await fetch(`${BASE_URL}/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile.");

      // Update sessionStorage so the sidebar name reflects changes
      const current = JSON.parse(sessionStorage.getItem("user") || "{}");
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          ...current,
          name: formData.name.trim(),
          email: formData.email,
        }),
      );

      setFormData((prev) => ({ ...prev, password: "", confirm: "" }));
      setSuccess("Profile updated successfully.");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    formData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div style={styles.page}>
      <style>{`
        .input-field:focus { border-color: #2563eb !important; outline: none; }
        .save-btn:hover:not(:disabled) { background: #1d4ed8 !important; }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>Profile Settings</h1>
        <p style={styles.subtitle}>Manage your account details and password</p>
      </div>

      <div style={styles.layout}>
        {/* Avatar card */}
        <div style={styles.avatarCard}>
          <div style={styles.avatar}>{initials}</div>
          <p style={styles.avatarName}>{formData.name || "—"}</p>
          <p style={styles.avatarEmail}>{formData.email || "—"}</p>
          <div style={styles.roleBadge}>User</div>
        </div>

        {/* Form card */}
        <div style={styles.formCard}>
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
          {success && (
            <div style={styles.successBox}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ flexShrink: 0 }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Account info */}
            <div style={styles.section}>
              <p style={styles.sectionLabel}>Account Information</p>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    style={styles.input}
                    placeholder="Jane Smith"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    style={styles.input}
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div style={styles.section}>
              <p style={styles.sectionLabel}>Change Password</p>
              <p style={styles.sectionHint}>
                Leave blank to keep your current password
              </p>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>New Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className="input-field"
                    style={styles.input}
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    name="confirm"
                    type="password"
                    value={formData.confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className="input-field"
                    style={styles.input}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>

            <div style={styles.actions}>
              <button
                type="submit"
                disabled={saving}
                className="save-btn"
                style={{
                  ...styles.saveBtn,
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Danger zone */}
      <div style={styles.dangerCard}>
        <div>
          <p style={styles.dangerTitle}>Delete Account</p>
          <p style={styles.dangerDesc}>
            Permanently delete your account and all your job application data.
            This cannot be undone.
          </p>
        </div>
        <button
          style={styles.dangerBtn}
          onClick={() =>
            alert("Please contact support to delete your account.")
          }
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    maxWidth: 900,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  header: { marginBottom: 4 },
  title: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 26,
    fontWeight: 400,
    color: "#0f172a",
    margin: "0 0 4px",
    letterSpacing: "-0.4px",
  },
  subtitle: { fontSize: 14, color: "#64748b", margin: 0 },

  layout: {
    display: "grid",
    gridTemplateColumns: "200px 1fr",
    gap: 20,
    alignItems: "start",
  },

  // Avatar card
  avatarCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: "28px 20px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    textAlign: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
  },
  avatarName: { fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 },
  avatarEmail: {
    fontSize: 12,
    color: "#94a3b8",
    margin: 0,
    wordBreak: "break-all",
  },
  roleBadge: {
    marginTop: 4,
    padding: "3px 10px",
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
    color: "#0369a1",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  // Form card
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: "28px 32px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 20,
    border: "1px solid #fecaca",
    fontWeight: 500,
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 20,
    border: "1px solid #bbf7d0",
    fontWeight: 500,
  },

  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 12px",
    paddingBottom: 8,
    borderBottom: "1px solid #f1f5f9",
  },
  sectionHint: { fontSize: 12, color: "#94a3b8", margin: "-6px 0 14px" },

  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "#64748b" },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    backgroundColor: "#fff",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },

  actions: { display: "flex", justifyContent: "flex-end" },
  saveBtn: {
    padding: "10px 24px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    transition: "background 0.2s",
  },

  // Danger zone
  dangerCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: "20px 28px",
    border: "1px solid #fee2e2",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#dc2626",
    margin: "0 0 4px",
  },
  dangerDesc: { fontSize: 13, color: "#64748b", margin: 0 },
  dangerBtn: {
    padding: "9px 18px",
    borderRadius: 8,
    border: "1px solid #fecaca",
    backgroundColor: "#fff",
    color: "#dc2626",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
  },
};
