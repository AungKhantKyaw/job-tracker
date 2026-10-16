"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { User, Pagination } from "@/types";
import { apiFetch } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const UserListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async (pageNum: number) => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(`/api/admin/users?page=${pageNum}&limit=20`);

      if (response.status === 401) {       
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users.");
      }

      setUsers(data.users ?? []);
      setPagination(data.pagination ?? null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone."))
      return;

    setDeletingId(id);
    try {
      const response = await apiFetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed.");
      }

      // Remove from local state immediately
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      alert(err.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>User Management</h2>
          <p style={styles.subtitle}>
            {pagination ? `${pagination.total} total users` : "Manage system access and roles"}
          </p>
        </div>
        <Link href="/admin/user/add" style={styles.addBtn}>
          + New User
        </Link>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.loadingBox}>Loading users…</div>
      ) : users.length === 0 ? (
        <div style={styles.emptyBox}>No users found.</div>
      ) : (
        <>
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userName}>{user.name || "N/A"}</div>
                    </td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor:
                            user.role === "admin"
                              ? "#dbeafe"
                              : user.role === "editor"
                              ? "#fef9c3"
                              : "#f3f4f6",
                          color:
                            user.role === "admin"
                              ? "#1e40af"
                              : user.role === "editor"
                              ? "#92400e"
                              : "#374151",
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <Link
                          href={`/admin/user/edit/${user._id}`}
                          style={styles.editBtn}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={deletingId === user._id}
                          style={{
                            ...styles.deleteBtn,
                            opacity: deletingId === user._id ? 0.5 : 1,
                          }}
                        >
                          {deletingId === user._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
              >
                ← Prev
              </button>
              <span style={styles.pageInfo}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                style={{
                  ...styles.pageBtn,
                  opacity: page === pagination.pages ? 0.4 : 1,
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: "40px",
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: '"Inter", sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: { fontSize: "26px", fontWeight: "700", color: "#111827", margin: 0 },
  subtitle: { color: "#6b7280", marginTop: "4px", fontSize: "14px" },
  addBtn: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
  },
  loadingBox: {
    textAlign: "center",
    padding: "60px",
    color: "#6b7280",
    fontSize: "15px",
  },
  emptyBox: {
    textAlign: "center",
    padding: "60px",
    color: "#9ca3af",
    fontSize: "15px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px dashed #e5e7eb",
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  theadRow: { backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
  th: {
    padding: "16px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "16px", fontSize: "14px", color: "#111827" },
  userName: { fontWeight: "600" },
  badge: {
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  actionGroup: { display: "flex", gap: "15px", alignItems: "center" },
  editBtn: { color: "#2563eb", textDecoration: "none", fontWeight: "600", fontSize: "14px" },
  deleteBtn: {
    color: "#ef4444",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontWeight: "600",
    padding: 0,
    fontSize: "14px",
  },
  errorBox: {
    padding: "15px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    marginTop: "24px",
  },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    color: "#374151",
  },
  pageInfo: { fontSize: "14px", color: "#6b7280" },
};

export default UserListPage;