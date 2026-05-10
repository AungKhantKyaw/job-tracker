"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import styles from "./jobs.module.css";
import { apiFetch } from "@/lib/api";

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
        fetch('/api/status'),
        fetch('/api/jobs?page=1&limit=10'),
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
            <option key={s._id} value={s.label}>
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
        ) : filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <span style={{ fontSize: 36 }}>📋</span>
            <p style={{ color: "#64748b", margin: "8px 0 4px", fontWeight: 500 }}>
              No applications found
            </p>
            <Link href="/dashboard/jobs/add" className={styles.emptyLink}>
              Add your first one →
            </Link>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr className={styles.thead}>
                  <th className={styles.th}>Company</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Applied</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job._id} className={styles.tr}>
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
                      {job.appliedDate
                        ? new Date(job.appliedDate).toLocaleDateString()
                        : "—"}
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