"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { UserFormData } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const AddUserPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "user",
    isVerified: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to create user.");

      router.push("/admin/user");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.breadcrumb}>
        <Link href="/admin/user" style={styles.backLink}>
          ← Back to Users
        </Link>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>Create New User</h2>
        <p style={styles.subtitle}>Add a new member to the system</p>

        {error && <div style={styles.error}>✕ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="name" style={styles.label}>
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Initial Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="role" style={styles.label}>
              Account Role
            </label>
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
            <p style={styles.helpText}>
              Admins can manage jobs and other users.
            </p>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => router.back()}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "40px 20px", maxWidth: "600px", margin: "0 auto" },
  breadcrumb: { marginBottom: "20px" },
  backLink: { color: "#6b7280", textDecoration: "none", fontSize: "14px" },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 8px 0",
  },
  subtitle: { fontSize: "14px", color: "#6b7280", marginBottom: "30px" },
  error: {
    padding: "12px 16px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #fecaca",
    fontWeight: "500",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#374151" },
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
    fontSize: "15px",
    backgroundColor: "#fff",
    width: "100%",
    boxSizing: "border-box",
  },
  helpText: { fontSize: "12px", color: "#9ca3af", marginTop: "4px" },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
  },
  cancelBtn: {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  submitBtn: {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
  },
};

export default AddUserPage;
