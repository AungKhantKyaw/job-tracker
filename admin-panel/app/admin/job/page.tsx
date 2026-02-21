"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

const Job = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 30;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const statusRes = await axios.get(`${baseUrl}/status`, { headers });
      setStatuses(statusRes.data);

      const jobRes = await axios.get(
        `${baseUrl}/job?page=${page}&limit=${limit}`,
        { headers },
      );

      setJobs(jobRes.data.jobs || []);
      setTotalPages(jobRes.data.totalPages || 1);
    } catch (err) {
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
        const currentLabel = job.status?.label || job.status;
        return currentLabel === statusFilter;
      });
    }

    if (searchTerm) {
      result = result.filter(
        (job) =>
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.role.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredJobs(result);
  }, [searchTerm, statusFilter, jobs]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this application?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${baseUrl}/job/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      alert("Error deleting job.");
    }
  };

  const getStatusStyle = (statusObj) => {
    if (statusObj && typeof statusObj === "object" && statusObj.color) {
      return {
        bg: statusObj.color + "20",
        text: statusObj.color,
      };
    }
    return { bg: "#f3f4f6", text: "#374151" };
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
                <td colSpan="5" style={styles.tdCenter}>
                  Loading...
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan="5" style={styles.tdCenter}>
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
                      {/* This is the fix: 
                          If it's an object, show the label. 
                          If it's still a string (old data), show the string.
                      */}
                      {job.status?.label ||
                        (typeof job.status === "string"
                          ? job.status
                          : "No Status")}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(job.appliedDate).toLocaleDateString()}
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
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION CONTROLS */}
        <div style={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={page === 1 ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
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

const styles = {
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

  // Filter Styles
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

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    gap: "15px",
    borderTop: "1px solid #f3f4f6",
  },
  pageInfo: {
    fontSize: "14px",
    color: "#4b5563",
  },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "white",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  pageBtnDisabled: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    color: "#9ca3af",
    cursor: "not-allowed",
  },
  editBtnLink: {
    textDecoration: "none",
    color: "#2563eb",
    fontWeight: "600",
    fontSize: "14px",
    marginRight: "10px",
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
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#f87171",
    cursor: "pointer",
    fontWeight: "600",
  },
  error: {
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "10px",
    marginBottom: "20px",
  },
};

export default Job;
