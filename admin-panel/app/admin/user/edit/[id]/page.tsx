"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const EditUserPage = () => {
  const router = useRouter();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "" // Optional password reset
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${baseUrl}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Find the specific user from the list (or create a GET /users/:id route)
        const userToEdit = res.data.find((u: any) => u._id === id);
        
        if (userToEdit) {
          setFormData({
            name: userToEdit.name || "",
            email: userToEdit.email || "",
            role: userToEdit.role || "user",
            password: ""
          });
        }
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load user data." });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, baseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      
      // Filter out empty password so we don't accidentally overwrite it with blank
      const dataToSend = { ...formData };
      if (!dataToSend.password) delete dataToSend.password;

      await axios.put(`${baseUrl}/user/${id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage({ type: "success", text: "User updated successfully!" });
      setTimeout(() => router.push("/admin/user"), 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.container}>Loading user details...</div>;

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
          <div style={{ 
            ...styles.alert, 
            backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2",
            color: message.type === "success" ? "#166534" : "#991b1b" 
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.section}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.section}>
            <label style={styles.label}>System Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={styles.select}
            >
              <option value="user">Standard User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <hr style={styles.hr} />

          <div style={styles.section}>
            <label style={styles.label}>Reset Password (Optional)</label>
            <input
              type="password"
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={styles.input}
            />
            <p style={styles.helpText}>Only enter a value if you want to force a password change.</p>
          </div>

          <div style={styles.actions}>
            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? "Saving Changes..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "40px 20px", maxWidth: "700px", margin: "0 auto", fontFamily: "Inter, sans-serif" },
  breadcrumb: { marginBottom: "20px" },
  backLink: { color: "#6b7280", textDecoration: "none", fontSize: "14px" },
  card: { backgroundColor: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  title: { fontSize: "24px", fontWeight: "800", color: "#111827", margin: 0 },
  idBadge: { fontSize: "11px", backgroundColor: "#f3f4f6", padding: "4px 8px", borderRadius: "4px", color: "#6b7280", fontFamily: "monospace" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  section: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#374151" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px", outline: "none" },
  select: { padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", fontSize: "15px" },
  hr: { border: "0", borderTop: "1px solid #f3f4f6", margin: "10px 0" },
  helpText: { fontSize: "12px", color: "#9ca3af" },
  actions: { marginTop: "10px" },
  saveBtn: { width: "100%", padding: "14px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  alert: { padding: "12px", borderRadius: "8px", marginBottom: "20px", textAlign: "center", fontSize: "14px" }
};

export default EditUserPage;