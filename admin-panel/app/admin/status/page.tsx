"use client";

import { useEffect, useState } from "react";

interface StatusItem {
  _id: string;
  label: string;
  color: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const StatusPage = () => {
  const [statusData, setStatusData] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add form
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#3182ce");

  // Edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("#3182ce");

  const authFetch = (url: string, options: RequestInit = {}) =>
    fetch(url, { ...options, credentials: "include" });

  const fetchStatus = async () => {
    try {
      const res = await authFetch(`${BASE_URL}/status`);

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load statuses.");

      setStatusData(await res.json());
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load statuses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await authFetch(`${BASE_URL}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel, color: newColor }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error adding status.");

      setNewLabel("");
      setNewColor("#3182ce");
      fetchStatus();
    } catch (err: any) {
      setError(err.message || "Error adding status.");
    }
  };

  const handleUpdate = async (id: string) => {
    setError("");
    try {
      const res = await authFetch(`${BASE_URL}/status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: editLabel, color: editColor }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error updating status.");

      setEditingId(null);
      fetchStatus();
    } catch (err: any) {
      setError(err.message || "Error updating status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure? This will fail if jobs are currently using this status.",
      )
    )
      return;
    setError("");
    try {
      const res = await authFetch(`${BASE_URL}/status/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error deleting status.");

      setStatusData((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      setError(err.message || "Error deleting status.");
    }
  };

  const startEdit = (item: StatusItem) => {
    setEditingId(item._id);
    setEditLabel(item.label);
    setEditColor(item.color || "#888888");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Manage Status</h2>
        <p style={styles.subtitle}>
          Define funnel stages and their visual colors.
        </p>

        {error && <div style={styles.errorBanner}>✕ {error}</div>}

        {/* Add Form */}
        <form onSubmit={handleAdd} style={styles.form}>
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            style={styles.colorPicker}
            title="Choose status color"
          />
          <input
            type="text"
            placeholder="e.g. Technical Interview"
            value={newLabel}
            onChange={(e) => {
              setNewLabel(e.target.value);
              setError("");
            }}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.addButton}>
            Add
          </button>
        </form>

        {loading ? (
          <div style={styles.loader}>Loading…</div>
        ) : statusData.length === 0 ? (
          <p style={styles.empty}>No statuses yet. Add one above.</p>
        ) : (
          <div style={styles.list}>
            {statusData.map((item) => (
              <div key={item._id} style={styles.listItem}>
                {editingId === item._id ? (
                  <div style={styles.editRow}>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      style={styles.colorPickerSmall}
                    />
                    <input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      style={styles.inputSmall}
                    />
                    <div style={styles.buttonGroup}>
                      <button
                        onClick={() => handleUpdate(item._id)}
                        style={styles.saveButton}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={styles.cancelButton}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={styles.labelContainer}>
                      <span
                        style={{
                          ...styles.colorDot,
                          backgroundColor: item.color,
                        }}
                      />
                      <span style={styles.labelText}>{item.label}</span>
                    </div>
                    <div style={styles.buttonGroup}>
                      <button
                        onClick={() => startEdit(item)}
                        style={styles.editButton}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "40px 20px",
    minHeight: "100vh",
    fontFamily: '"Inter", sans-serif',
  },
  card: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  title: {
    margin: "0 0 8px 0",
    color: "#1a202c",
    fontSize: "24px",
    fontWeight: "700",
  },
  subtitle: { margin: "0 0 24px 0", color: "#718096", fontSize: "14px" },
  errorBanner: {
    backgroundColor: "#fff5f5",
    color: "#c53030",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
    border: "1px solid #feb2b2",
    fontSize: "14px",
    fontWeight: "500",
  },
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
    alignItems: "center",
  },
  colorPicker: {
    padding: "0",
    width: "45px",
    height: "45px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    background: "none",
  },
  colorPickerSmall: {
    padding: "0",
    width: "30px",
    height: "30px",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    cursor: "pointer",
    background: "none",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
  },
  inputSmall: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #3182ce",
    fontSize: "14px",
    flex: 1,
  },
  addButton: {
    padding: "12px 20px",
    backgroundColor: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  empty: {
    textAlign: "center",
    color: "#a0aec0",
    fontSize: "14px",
    padding: "20px 0",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #edf2f7",
    backgroundColor: "#f8fafc",
  },
  labelContainer: { display: "flex", alignItems: "center", gap: "12px" },
  colorDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  labelText: { fontWeight: "500", color: "#2d3748" },
  buttonGroup: { display: "flex", gap: "8px" },
  editRow: { display: "flex", flex: 1, gap: "10px", alignItems: "center" },
  editButton: {
    padding: "5px 10px",
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "5px 10px",
    backgroundColor: "#fff",
    border: "1px solid #feb2b2",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#c53030",
  },
  saveButton: {
    padding: "5px 10px",
    backgroundColor: "#38a169",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "5px 10px",
    backgroundColor: "#718096",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  },
  loader: { textAlign: "center", color: "#a0aec0", padding: "20px" },
};

export default StatusPage;
