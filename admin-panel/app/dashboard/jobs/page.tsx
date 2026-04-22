"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

interface Status {
  _id: string;
  label: string;
  color: string;
}

interface Job {
  _id: string;
  company: string;
  role: string;
  location?: string;
  appliedDate?: string;
  status?: Status | string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const getStatusLabel = (status: Job["status"]) => {
  if (!status) return "No Status";
  if (typeof status === "object") return status.label;
  return status;
};

const getStatusColor = (status: Job["status"]) => {
  if (status && typeof status === "object" && status.color) return status.color;
  return "#94a3b8";
};

export default function UserJobsPage() {
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const limit = 20;

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statusRes, jobRes] = await Promise.all([
        fetch(`${BASE_URL}/status`, { credentials: "include" }),
        fetch(`${BASE_URL}/job?page=${page}&limit=${limit}`, {
          credentials: "include",
        }),
      ]);

      const statusData = await statusRes.json();
      const jobData = await jobRes.json();

      setStatuses(statusData);
      setJobs(jobData.jobs ?? []);
      setTotalPages(jobData.totalPages ?? 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    let result = jobs;
    if (statusFilter !== "All") {
      result = result.filter((j) => getStatusLabel(j.status) === statusFilter);
    }
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter(
        (j) =>
          j.company.toLowerCase().includes(t) ||
          j.role.toLowerCase().includes(t),
      );
    }
    setFilteredJobs(result);
  }, [jobs, statusFilter, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${BASE_URL}/job/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed.");
      setJobs((prev) => prev.filter((j) => j._id !== id));
      toast.success("Application deleted.");
    } catch {
      toast.error("Failed to delete application.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        .job-row:hover { background: #f8fafc !important; }
        .filter-input:focus { border-color: #2563eb !important; outline: none; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Applications</h1>
          <p style={styles.subtitle}>
            {loading
              ? "Loading…"
              : `${jobs.length} application${jobs.length !== 1 ? "s" : ""} tracked`}
          </p>
        </div>
        <Link href="/dashboard/jobs/add" style={styles.addBtn}>
          + Add Application
        </Link>
      </div>

      {/* Filters */}
      <div style={styles.filterRow}>
        <input
          type="text"
          placeholder="Search company or role…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
          style={styles.searchInput}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="All">All Statuses</option>
          {statuses.map((s) => (
            <option key={s._id} value={s.label}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Table */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.centerMsg}>Loading applications…</div>
        ) : filteredJobs.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 36 }}>📋</span>
            <p
              style={{ color: "#64748b", margin: "8px 0 4px", fontWeight: 500 }}
            >
              No applications found
            </p>
            <Link href="/dashboard/jobs/add" style={styles.emptyLink}>
              Add your first one →
            </Link>
          </div>
        ) : (
          <>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Applied</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="job-row" style={styles.tr}>
                    <td style={styles.td}>
                      <p style={styles.company}>{job.company}</p>
                      <p style={styles.location}>{job.location || "Remote"}</p>
                    </td>
                    <td style={styles.td}>{job.role}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: getStatusColor(job.status) + "18",
                          color: getStatusColor(job.status),
                        }}
                      >
                        {getStatusLabel(job.status)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {job.appliedDate
                        ? new Date(job.appliedDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <Link
                          href={`/dashboard/jobs/edit/${job._id}`}
                          style={styles.editBtn}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(job._id)}
                          disabled={deletingId === job._id}
                          style={{
                            ...styles.deleteBtn,
                            opacity: deletingId === job._id ? 0.5 : 1,
                          }}
                        >
                          {deletingId === job._id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
                >
                  ← Prev
                </button>
                <span style={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    ...styles.pageBtn,
                    opacity: page === totalPages ? 0.4 : 1,
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    maxWidth: 1100,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
  },
  title: {
    fontFamily: '"Inter", sans-serif',
    fontSize: 26,
    fontWeight: 400,
    color: "#0f172a",
    margin: "0 0 4px",
    letterSpacing: "-0.4px",
  },
  subtitle: { fontSize: 14, color: "#64748b", margin: 0 },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "#fff",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
    flexShrink: 0,
  },
  filterRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  searchInput: {
    flex: 1,
    minWidth: 220,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    backgroundColor: "#fff",
    transition: "border-color 0.2s",
  },
  filterSelect: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    backgroundColor: "#fff",
    cursor: "pointer",
    minWidth: 150,
  },
  errorBox: {
    padding: 14,
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    borderRadius: 8,
    border: "1px solid #fecaca",
    fontSize: 14,
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    overflow: "hidden",
  },
  centerMsg: {
    padding: 60,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 14,
  },
  emptyState: {
    padding: "48px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  emptyLink: {
    fontSize: 13,
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 500,
    marginTop: 4,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  th: {
    padding: "13px 16px",
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "left",
  },
  tr: { borderBottom: "1px solid #f8fafc", transition: "background 0.15s" },
  td: { padding: "14px 16px", fontSize: 14, color: "#374151" },
  company: { fontWeight: 600, color: "#0f172a", margin: 0 },
  location: { fontSize: 12, color: "#94a3b8", margin: "2px 0 0" },
  badge: { fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 6 },
  actions: { display: "flex", gap: 12, alignItems: "center" },
  editBtn: {
    fontSize: 13,
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 600,
  },
  deleteBtn: {
    fontSize: 13,
    color: "#ef4444",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    padding: 0,
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: "16px",
    borderTop: "1px solid #f1f5f9",
  },
  pageBtn: {
    padding: "7px 14px",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },
  pageInfo: { fontSize: 13, color: "#64748b" },
};
