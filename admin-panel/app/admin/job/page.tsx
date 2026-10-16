"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Status, Job } from "@/types";
import { apiFetch } from "@/lib/api";


const JobPage = () => {
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
  const limit = 30;

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statusRes, jobRes] = await Promise.all([
        fetch('/api/status'),
        fetch(`/api/jobs?page=1&limit=${limit}`),
      ]);

      if (statusRes.status === 401 || jobRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      const statusData = await statusRes.json();
      const jobData = await jobRes.json();

      setStatuses(statusData);
      setJobs(jobData.jobs ?? []);
      setTotalPages(jobData.totalPages ?? 1);
    } catch {
      setError("Failed to fetch data. Check if backend is running.");
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
      result = result.filter((job) => {
        const label =
          typeof job.status === "object" ? job.status?.label : job.status;
        return label === statusFilter;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.company.toLowerCase().includes(term) ||
          job.role.toLowerCase().includes(term),
      );
    }

    setFilteredJobs(result);
  }, [searchTerm, statusFilter, jobs]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed.");

      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch {
      alert("Error deleting job.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusStyle = (status: Job["status"]) => {
    if (status && typeof status === "object" && status.color) {
      return { bg: status.color + "20", text: status.color };
    }
    return { bg: "#f3f4f6", text: "#374151" };
  };

  const getStatusLabel = (status: Job["status"]) => {
    if (!status) return "No Status";
    if (typeof status === "object") return status.label;
    return status;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Job Applications</h2>
        <Link href="/admin/job/add" style={styles.addButton}>
          + Add New
        </Link>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
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

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Applied</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={styles.tdCenter}>
                  Loading…
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.tdCenter}>
                  No applications found.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job._id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.companyName}>{job.company}</div>
                    <div style={styles.location}>
                      {job.location || "Remote"}
                    </div>
                  </td>
                  <td style={styles.td}>{job.role}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusStyle(job.status).bg,
                        color: getStatusStyle(job.status).text,
                        border: `1px solid ${getStatusStyle(job.status).text}40`,
                      }}
                    >
                      {getStatusLabel(job.status)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
                      <Link
                        href={`/admin/job/edit/${job._id}`}
                        style={styles.editBtnLink}
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
                        {deletingId === job._id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={page === 1 ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={
              page === totalPages ? styles.pageBtnDisabled : styles.pageBtn
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "40px 20px",
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: '"Inter", sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: { fontSize: "26px", fontWeight: "800", color: "#111827" },
  addButton: {
    padding: "12px 24px",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
  },
  filterBar: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  searchWrapper: { flex: 1, minWidth: "250px" },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  filterSelect: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "15px",
    backgroundColor: "white",
    cursor: "pointer",
    minWidth: "160px",
  },
  tableWrapper: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    overflow: "hidden",
    border: "1px solid #f3f4f6",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeaderRow: { backgroundColor: "#f9fafb" },
  th: {
    padding: "16px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "16px", fontSize: "15px" },
  tdCenter: { padding: "60px", textAlign: "center", color: "#9ca3af" },
  companyName: { fontWeight: "600", color: "#111827" },
  location: { fontSize: "12px", color: "#9ca3af", marginTop: "2px" },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
  },
  actionGroup: { display: "flex", gap: "12px", alignItems: "center" },
  editBtnLink: {
    textDecoration: "none",
    color: "#2563eb",
    fontWeight: "600",
    fontSize: "14px",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#f87171",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    padding: 0,
  },
  error: {
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    gap: "15px",
    borderTop: "1px solid #f3f4f6",
  },
  pageInfo: { fontSize: "14px", color: "#4b5563" },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    cursor: "pointer",
    fontWeight: "500",
  },
  pageBtnDisabled: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    color: "#9ca3af",
    cursor: "not-allowed",
  },
};

export default JobPage;
