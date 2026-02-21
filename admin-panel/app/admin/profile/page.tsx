"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

  useEffect(() => {
    // Get current user info from localStorage (stored during login)
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setFormData({
      name: savedUser.name || "",
      email: savedUser.email || "",
      password: "",
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${baseUrl}/user/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local storage so the Navbar/UI reflects the new name
      localStorage.setItem("user", JSON.stringify(res.data));
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>My Profile</h2>
        <p style={styles.subtitle}>Update your personal information</p>

        {message.text && (
          <div
            style={{
              ...styles.alert,
              backgroundColor:
                message.type === "success" ? "#dcfce7" : "#fee2e2",
              color: message.type === "success" ? "#166534" : "#991b1b",
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "60px 20px",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    minHeight: "90vh",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "500px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#111827",
  },
  subtitle: { fontSize: "14px", color: "#6b7280", marginBottom: "30px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#374151" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
  },
  button: {
    padding: "14px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  alert: {
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
  },
};

export default ProfilePage;
