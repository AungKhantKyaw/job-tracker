"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import styles from "./jobs.module.css";
import { apiFetch } from "@/lib/api";
import { formatDateOnly } from "@/lib/date";

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
  followupDate?: string;
  status?: Status | string;
}


const getStatusLabel = (status: Job["status"]) => {
  if (!status) return "No Status";
  if (typeof status === "object") return status.label;
  return status;
};

const getStatusColor = (status: Job["status"]) => {
  if (status && typeof status === "object" && status.color) return status.color;
  return "#94a3b8";
};

const isOverdue = (followupDate?: string) => {
  if (!followupDate) return false;
  const followupStr = String(followupDate).split("T")[0];
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return followupStr < todayStr;
};

export default function UserJobsPage() {
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const requestId = useRef(0);
  const limit = 20;

  const hasFilters = debouncedSearch !== "" || statusFilter !== "All";

  const fetchData = async () => {
    const myRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "All") params.set("status", statusFilter);

      const [statusRes, jobRes] = await Promise.all([
        fetch("/api/status"),
        fetch(`/api/jobs?${params.toString()}`),
      ]);

      const statusData = await statusRes.json();
      const jobData = await jobRes.json();

      // Ignore stale responses (e.g. the user kept typing)
      if (myRequest !== requestId.current) return;

      setStatuses(statusData);
      setJobs(jobData.jobs ?? []);
      setTotalPages(Math.max(1, jobData.totalPages ?? 1));
    } catch (err: any) {
      if (myRequest === requestId.current) {
        toast.error(err.message || "Failed to fetch jobs.");
      }
    } finally {
      if (myRequest === requestId.current) setLoading(false);
    }
  };

  // Wait until the user pauses typing before searching
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // A new search or status filter always starts from page 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("All");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/jobs/${id}`, {
        method: "DELETE",
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
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Applications</h1>
          <p className={styles.subtitle}>
            {loading
              ? "Loading…"
              : `${jobs.length} application${jobs.length !== 1 ? "s" : ""} tracked`}
          </p>
        </div>
        <Link href="/dashboard/jobs/add" className={styles.addBtn}>
          + Add Application
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <input
          type="text"
          placeholder="Search company or role…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="All">All Statuses</option>
          {statuses.map((s) => (
            <option key={s._id} value={s._id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.centerMsg}>Loading applications…</div>
        ) : jobs.length === 0 ? (
          <div className={styles.emptyState}>
            <span style={{ fontSize: 36 }}>📋</span>
            <p style={{ color: "#64748b", margin: "8px 0 4px", fontWeight: 500 }}>
              {hasFilters
                ? "No applications match your search"
                : "No applications found"}
            </p>
            {hasFilters ? (
              <button onClick={clearFilters} className={styles.emptyLink}>
                Clear filters
              </button>
            ) : (
              <Link href="/dashboard/jobs/add" className={styles.emptyLink}>
                Add your first one →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.thead}>
                    <th className={styles.th}>Company</th>
                    <th className={styles.th}>Role</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Applied</th>
                    <th className={styles.th}>Follow-up</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job._id}
                      className={`${styles.tr} ${isOverdue(job.followupDate) ? styles.trOverdue : ""}`}
                    >
                      <td className={styles.td}>
                        <p className={styles.company}>{job.company}</p>
                        <p className={styles.location}>{job.location || "Remote"}</p>
                      </td>
                      <td className={styles.td}>{job.role}</td>
                      <td className={styles.td}>
                        <span
                          className={styles.badge}
                          style={{
                            backgroundColor: getStatusColor(job.status) + "18",
                            color: getStatusColor(job.status),
                          }}
                        >
                          {getStatusLabel(job.status)}
                        </span>
                      </td>
                      <td className={styles.td}>
                        {formatDateOnly(job.appliedDate) || "—"}
                      </td>
                      <td className={styles.td}>
                        {job.followupDate ? (
                          <span className={isOverdue(job.followupDate) ? styles.overdueDate : ""}>
                            {formatDateOnly(job.followupDate)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          <Link
                            href={`/dashboard/jobs/edit/${job._id}`}
                            className={styles.editBtn}
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(job._id)}
                            disabled={deletingId === job._id}
                            className={styles.deleteBtn}
                            style={{
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
            </div>
            <div className={styles.scrollHint}>Swipe to see more →</div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className={styles.pageBtn}
                >
                  ← Prev
                </button>
                <span className={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className={styles.pageBtn}
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