"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirm: string;
  professionalSummary: string;
  skills: string; 
}

export default function UserProfilePage() {
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirm: "",
    professionalSummary: "",
    skills: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem("user") || "{}");
      setFormData((prev) => ({
        ...prev,
        name: u.name || "",
        email: u.email || "",
      }));
    } catch {}

    const fetchProfileData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/profile/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const profile = await res.json();
          setFormData(prev => ({
            ...prev,
            professionalSummary: profile.professionalSummary || "",
            skills: profile.skills ? profile.skills.join(", ") : "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning("Name is required.");
      return;
    }
    if (formData.password && formData.password.length < 8) {
      toast.warning("Password must be at least 8 characters.");
      return;
    }
    if (formData.password && formData.password !== formData.confirm) {
      toast.warning("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const userBody: any = { name: formData.name.trim(), email: formData.email };
      if (formData.password) userBody.password = formData.password;

      const userRes = await fetch(`${BASE_URL}/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userBody),
      });

      if (!userRes.ok) throw new Error("Failed to update account details.");

      const profileBody = {
        professionalSummary: formData.professionalSummary,
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s !== ""),
      };

      const profileRes = await fetch(`${BASE_URL}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileBody),
      });

      if (!profileRes.ok) throw new Error("Account updated, but failed to save CV data.");

      const current = JSON.parse(sessionStorage.getItem("user") || "{}");
      sessionStorage.setItem("user", JSON.stringify({ ...current, name: formData.name.trim(), email: formData.email }));

      setFormData((prev) => ({ ...prev, password: "", confirm: "" }));
      toast.success("Profile updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const initials = formData.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div style={styles.page}>
      <style>{`
        .input-field:focus { border-color: #2563eb !important; outline: none; }
        .save-btn:hover:not(:disabled) { background: #1d4ed8 !important; }
        .danger-btn:hover { background: #fef2f2 !important; }

        /* Responsive Layout Grid */
        .profile-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        /* Form internal grid (2 cols to 1 col) */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .profile-layout { grid-template-columns: 240px 1fr; }
          .form-grid { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 640px) {
          .form-card { padding: 20px !important; }
          .danger-card { flex-direction: column; align-items: flex-start !important; }
          .danger-btn { width: 100%; }
        }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>Profile Settings</h1>
        <p style={styles.subtitle}>Manage account and CV data</p>
      </div>

      <div className="profile-layout">
        {/* Avatar card */}
        <div style={styles.avatarCard}>
          <div style={styles.avatar}>{initials}</div>
          <p style={styles.avatarName}>{formData.name || "—"}</p>
          <p style={styles.avatarEmail}>{formData.email || "—"}</p>
          <div style={styles.roleBadge}>User</div>
        </div>

        {/* Form card */}
        <div className="form-card" style={styles.formCard}>
          <form onSubmit={handleSubmit}>
            
            <div style={styles.section}>
              <p style={styles.sectionLabel}>Account Information</p>
              <div className="form-grid">
                <div style={styles.field}>
                  <label style={styles.label}>Full Name</label>
                  <input name="name" type="text" value={formData.name} onChange={handleChange} required className="input-field" style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Email Address</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required className="input-field" style={styles.input} />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <p style={styles.sectionLabel}>CV Content</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={styles.field}>
                  <label style={styles.label}>Professional Summary</label>
                  <textarea name="professionalSummary" value={formData.professionalSummary} onChange={handleChange} className="input-field" style={{ ...styles.input, minHeight: "120px", resize: "vertical" }} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Technical Skills</label>
                  <input name="skills" type="text" value={formData.skills} onChange={handleChange} className="input-field" style={styles.input} placeholder="React, Node.js..." />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <p style={styles.sectionLabel}>Security</p>
              <div className="form-grid">
                <div style={styles.field}>
                  <label style={styles.label}>New Password</label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange} className="input-field" style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Confirm Password</label>
                  <input name="confirm" type="password" value={formData.confirm} onChange={handleChange} className="input-field" style={styles.input} />
                </div>
              </div>
            </div>

            <div style={styles.actions}>
              <button type="submit" disabled={saving} className="save-btn" style={{ ...styles.saveBtn, width: "100%", maxWidth: "200px" }}>
                {saving ? "Saving…" : "Save All Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="danger-card" style={styles.dangerCard}>
        <div>
          <p style={styles.dangerTitle}>Delete Account</p>
          <p style={styles.dangerDesc}>Permanently delete your account. This cannot be undone.</p>
        </div>
        <button className="danger-btn" style={styles.dangerBtn} onClick={() => toast.info("Contact support to delete account.")}>
          Delete Account
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 },
  header: { marginBottom: 4 },
  title: { fontSize: 26, fontWeight: 400, color: "#0f172a", margin: "0 0 4px" },
  subtitle: { fontSize: 14, color: "#64748b", margin: 0 },
  avatarCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: "24px",
    border: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  avatar: { width: 72, height: 72, borderRadius: 16, backgroundColor: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, marginBottom: 12 },
  avatarName: { fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 },
  avatarEmail: { fontSize: 12, color: "#94a3b8", margin: 0, wordBreak: "break-all" },
  roleBadge: { marginTop: 8, padding: "3px 10px", borderRadius: 20, backgroundColor: "#f0f9ff", color: "#0369a1", fontSize: 11, fontWeight: 600 },
  formCard: { backgroundColor: "#fff", borderRadius: 14, padding: "32px", border: "1px solid #f1f5f9" },
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px", paddingBottom: 8, borderBottom: "1px solid #f1f5f9" },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "#64748b" },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, width: "100%", boxSizing: "border-box" },
  actions: { display: "flex", justifyContent: "flex-end", marginTop: 10 },
  saveBtn: { padding: "12px 24px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  dangerCard: { backgroundColor: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #fee2e2", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 },
  dangerTitle: { fontSize: 14, fontWeight: 600, color: "#dc2626", margin: "0 0 4px" },
  dangerDesc: { fontSize: 13, color: "#64748b", margin: 0 },
  dangerBtn: { padding: "10px 20px", borderRadius: 8, border: "1px solid #fecaca", backgroundColor: "#fff", color: "#dc2626", fontSize: 13, fontWeight: 600 },
};