"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Job, Status } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const getStatusLabel = (status: Job["status"]) => {
  if (!status) return "No Status";
  if (typeof status === "object") return status.label;
  return status;
};

const getStatusColor = (status: Job["status"]) => {
  if (status && typeof status === "object" && status.color) return status.color;
  return "#6b7280";
};

const AdminDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/job?page=1&limit=200`, {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }

        const data = await res.json();
        setJobs(Array.isArray(data) ? data : (data.jobs ?? []));
      } catch {
        console.error("Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return {
          date: d.toLocaleDateString("en-US", { weekday: "short" }),
          fullDate: d.toISOString().split("T")[0],
          count: 0,
        };
      })
      .reverse();

    jobs.forEach((job) => {
      const jobDate = new Date(job.createdAt || job.appliedDate || "")
        .toISOString()
        .split("T")[0];
      const dayMatch = last7Days.find((d) => d.fullDate === jobDate);
      if (dayMatch) dayMatch.count += 1;
    });

    return last7Days;
  }, [jobs]);

  const stats = useMemo(
    () => ({
      total: jobs.length,
      interviewing: jobs.filter(
        (j) => getStatusLabel(j.status) === "Interviewing",
      ).length,
      offers: jobs.filter((j) => getStatusLabel(j.status) === "Offered").length,
      rejected: jobs.filter((j) => getStatusLabel(j.status) === "Rejected")
        .length,
    }),
    [jobs],
  );

  if (loading)
    return (
      <div style={styles.page}>
        <p style={{ textAlign: "center", color: "#6b7280" }}>
          Loading dashboard…
        </p>
      </div>
    );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.title}>Admin Overview</h2>
            <p style={styles.subtitle}>Track your application momentum.</p>
          </div>
          <Link href="/admin/job/add" style={styles.addButton}>
            + Add Application
          </Link>
        </header>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total</span>
            <span style={styles.statValue}>{stats.total}</span>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #f59e0b" }}>
            <span style={styles.statLabel}>Interviews</span>
            <span style={styles.statValue}>{stats.interviewing}</span>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #10b981" }}>
            <span style={styles.statLabel}>Offers</span>
            <span style={styles.statValue}>{stats.offers}</span>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #ef4444" }}>
            <span style={styles.statLabel}>Rejected</span>
            <span style={styles.statValue}>{stats.rejected}</span>
          </div>
        </div>

        {/* Chart */}
        <div
          style={{ ...styles.section, marginBottom: "30px", height: "350px" }}
        >
          <h3 style={{ ...styles.sectionTitle, marginBottom: "20px" }}>
            Application Activity (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count > 0 ? "#2563eb" : "#e5e7eb"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Applications */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Recent Applications</h3>
            <Link href="/admin/job" style={styles.viewAll}>
              View All
            </Link>
          </div>
          <div style={styles.list}>
            {jobs.length === 0 ? (
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                No applications yet.
              </p>
            ) : (
              jobs.slice(0, 4).map((job) => (
                <div key={job._id} style={styles.jobItem}>
                  <div style={styles.jobInfo}>
                    <h4 style={styles.jobTitle}>{job.role}</h4>
                    <p style={styles.jobMeta}>{job.company}</p>
                  </div>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: getStatusColor(job.status) + "20",
                      color: getStatusColor(job.status),
                    }}
                  >
                    {getStatusLabel(job.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    padding: "40px 20px",
    fontFamily: '"Inter", sans-serif',
  },
  container: { maxWidth: "1000px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  title: { fontSize: "28px", fontWeight: "800", color: "#111827", margin: 0 },
  subtitle: { color: "#6b7280" },
  addButton: {
    padding: "12px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "600",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  statValue: { fontSize: "28px", fontWeight: "800", color: "#111827" },
  section: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#111827" },
  viewAll: {
    fontSize: "14px",
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
  },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  jobItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #f3f4f6",
  },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: "15px", fontWeight: "600", margin: 0 },
  jobMeta: { fontSize: "13px", color: "#6b7280", margin: 0 },
  badge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
  },
};

export default AdminDashboard;
