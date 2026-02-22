"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import type { UserFormData } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const EditUserPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "user",
    isVerified: false,
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {        
        const res = await fetch(`${BASE_URL}/user/${id}`, {
          credentials: "include",
        });

        // if (res.status === 401) {
        //   router.push("/admin/login");
        //   return;
        // }

        if (res.status === 403) {
          setMessage({ type: "error", text: "You don't have permission to edit users." });
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load user.");
        }

        setFormData({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "user",
          isVerified: data.isVerified || false,
          password: "",
        });
      } catch (err: any) {
        setMessage({ type: "error", text: err.message || "Failed to load user data." });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setFormData((prev) => ({ ...prev, [target.name]: value }));
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {      
      const body: Partial<FormData> = { ...formData };
      if (!body.password) delete body.password;

      const res = await fetch(`${BASE_URL}/user/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      //if (res.status === 401) { router.push("/admin/login"); return; }

      if (!res.ok) {
        throw new Error(data.message || "Update failed.");
      }

      setMessage({ type: "success", text: "User updated successfully!" });
      setTimeout(() => router.push("/admin/user"), 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.container}>Loading user details…</div>;

  return (
    <div style={styles.container}>
      <div style={styles.breadcrumb}>
        <Link href="/admin/user" style={styles.backLink}>← Back to User List</Link>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Edit User</h2>
          <span style={styles.idBadge}>ID: {id}</span>
        </div>

        {message.text && (
          <div
            style={{
              ...styles.alert,
              backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2",
              color: message.type === "success" ? "#166534" : "#991b1b",
              borderColor: message.type === "success" ? "#bbf7d0" : "#fecaca",
            }}
          >
            {message.type === "success" ? "✓" : "✕"} {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.section}>
            <label htmlFor="name" style={styles.label}>Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.section}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.section}>
            <label htmlFor="role" style={styles.label}>System Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="user">Standard User</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <hr style={styles.hr} />

          <div style={styles.section}>
            <label htmlFor="password" style={styles.label}>
              Reset Password <span style={styles.optional}>(optional)</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              style={styles.input}
            />
            <p style={styles.helpText}>Only enter a value if you want to force a password change.</p>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Verification Status</label>
            <div style={styles.checkboxRow}>
              <input
                type="checkbox"
                id="isVerified"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <label htmlFor="isVerified" style={styles.checkboxLabel}>
                {formData.isVerified ? "Account Verified" : "Unverified — (user cannot log in)"}
              </label>
            </div>
          </div>

          <div style={styles.actions}>
            <Link href="/admin/user" style={styles.cancelBtn}>Cancel</Link>
            <button type="submit" disabled={saving} style={{
              ...styles.saveBtn,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}>
              {saving ? "Saving…" : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "40px 20px",
    maxWidth: "700px",
    margin: "0 auto",
    fontFamily: "Inter, sans-serif",
  },
  breadcrumb: { marginBottom: "20px" },
  backLink: { color: "#6b7280", textDecoration: "none", fontSize: "14px" },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: { fontSize: "24px", fontWeight: "800", color: "#111827", margin: 0 },
  idBadge: {
    fontSize: "11px",
    backgroundColor: "#f3f4f6",
    padding: "4px 8px",
    borderRadius: "4px",
    color: "#6b7280",
    fontFamily: "monospace",
  },
  alert: {
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid",
    fontWeight: "500",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  section: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#374151" },
  optional: { fontWeight: "400", color: "#9ca3af" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    fontSize: "15px",
    width: "100%",
    boxSizing: "border-box",
  },
  hr: { border: "0", borderTop: "1px solid #f3f4f6", margin: "4px 0" },
  helpText: { fontSize: "12px", color: "#9ca3af", margin: 0 },
  checkboxRow: { display: "flex", alignItems: "center", gap: "10px" },
  checkbox: { width: "18px", height: "18px", cursor: "pointer", accentColor: "#2563eb" },
  checkboxLabel: { fontSize: "14px", cursor: "pointer", color: "#374151" },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
  },
  cancelBtn: {
    flex: 1,
    padding: "13px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "15px",
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
  },
  saveBtn: {
    flex: 2,
    padding: "13px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
  },
};

export default EditUserPage;