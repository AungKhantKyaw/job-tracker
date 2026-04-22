"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import styles from "./profile.module.css";

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
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile Settings</h1>
        <p className={styles.subtitle}>Manage account and CV data</p>
      </div>

      <div className={styles.profileLayout}>
        {/* Avatar card */}
        <div className={styles.avatarCard}>
          <div className={styles.avatar}>{initials}</div>
          <p className={styles.avatarName}>{formData.name || "—"}</p>
          <p className={styles.avatarEmail}>{formData.email || "—"}</p>
          <div className={styles.roleBadge}>User</div>
        </div>

        {/* Form card */}
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Account Information</p>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Full Name</label>
                  <input name="name" type="text" value={formData.name} onChange={handleChange} required className={styles.inputField} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email Address</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required className={styles.inputField} />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionLabel}>CV Content</p>
              <div className={styles.formGridFull}>
                <div className={styles.field}>
                  <label className={styles.label}>Professional Summary</label>
                  <textarea 
                    name="professionalSummary" 
                    value={formData.professionalSummary} 
                    onChange={handleChange} 
                    className={styles.inputField} 
                    style={{ minHeight: "120px" }}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Technical Skills</label>
                  <input 
                    name="skills" 
                    type="text" 
                    value={formData.skills} 
                    onChange={handleChange} 
                    className={styles.inputField} 
                    placeholder="React, Node.js..." 
                  />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionLabel}>Security</p>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>New Password</label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange} className={styles.inputField} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Confirm Password</label>
                  <input name="confirm" type="password" value={formData.confirm} onChange={handleChange} className={styles.inputField} />
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                type="submit" 
                disabled={saving} 
                className={styles.saveBtn}
                style={{ opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Saving…" : "Save All Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.dangerCard}>
        <div>
          <p className={styles.dangerTitle}>Delete Account</p>
          <p className={styles.dangerDesc}>Permanently delete your account. This cannot be undone.</p>
        </div>
        <button className={styles.dangerBtn} onClick={() => toast.info("Contact support to delete account.")}>
          Delete Account
        </button>
      </div>
    </div>
  );
}