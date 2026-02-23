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

import { useToast } from "@/components/ToastProvider";

interface Status {
  _id: string;
  label: string;
  color: string;
}

interface Job {
  _id: string;
  role: string;
  company: string;
  location?: string;
  appliedDate?: string;
  createdAt?: string;
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

export default function UserDashboard() {
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem("user") || "{}");
      setUserName(u.name?.split(" ")[0] || "there");
    } catch {}

    const fetchJobs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/job?page=1&limit=200`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : (data.jobs ?? []));
      } catch(err: any) {
        toast.error(err.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const stats = useMemo(
    () => ({
      total: jobs.length,
      applied: jobs.filter((j) => getStatusLabel(j.status) === "Applied")
        .length,
      interviewing: jobs.filter(
        (j) => getStatusLabel(j.status) === "Interviewing",
      ).length,
      offered: jobs.filter((j) => getStatusLabel(j.status) === "Offered")
        .length,
      rejected: jobs.filter((j) => getStatusLabel(j.status) === "Rejected")
        .length,
    }),
    [jobs],
  );

  const chartData = useMemo(() => {
    const last7 = [...Array(7)]
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
      try {
        const date = new Date(job.createdAt || job.appliedDate || "")
          .toISOString()
          .split("T")[0];
        const match = last7.find((d) => d.fullDate === date);
        if (match) match.count += 1;
      } catch {}
    });

    return last7;
  }, [jobs]);

  // Success rate
  const successRate =
    stats.total > 0
      ? Math.round(((stats.interviewing + stats.offered) / stats.total) * 100)
      : 0;

  const recentJobs = jobs.slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .stat-card { animation: fadeUp 0.4s ease both; }
        .stat-card:nth-child(1) { animation-delay: 0.05s; }
        .stat-card:nth-child(2) { animation-delay: 0.1s; }
        .stat-card:nth-child(3) { animation-delay: 0.15s; }
        .stat-card:nth-child(4) { animation-delay: 0.2s; }
        .stat-card:nth-child(5) { animation-delay: 0.25s; }
        .job-row:hover { background: #f8fafc !important; }
      `}</style>

      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.greeting}>
            {greeting()}, <span style={styles.greetingName}>{userName}</span> 👋
          </h1>
          <p style={styles.greetingSub}>
            {stats.total === 0
              ? "Start tracking your first job application."
              : `You have ${stats.total} application${stats.total !== 1 ? "s" : ""} tracked.`}
          </p>
        </div>
        <Link
          href="/dashboard/jobs/add"
          style={styles.addBtn}
          className="add-btn"
        >
          + Add Application
        </Link>
      </div>

      {/* Stat cards */}
      <div style={styles.statsGrid}>
        {[
          {
            label: "Total",
            value: stats.total,
            color: "#2563eb",
            bg: "#eff6ff",
            sub: "applications",
          },
          {
            label: "Applied",
            value: stats.applied,
            color: "#8b5cf6",
            bg: "#f5f3ff",
            sub: "waiting",
          },
          {
            label: "Interviewing",
            value: stats.interviewing,
            color: "#f59e0b",
            bg: "#fffbeb",
            sub: "in progress",
          },
          {
            label: "Offered",
            value: stats.offered,
            color: "#10b981",
            bg: "#ecfdf5",
            sub: "🎉 congrats",
          },
          {
            label: "Success Rate",
            value: `${successRate}%`,
            color: "#0ea5e9",
            bg: "#f0f9ff",
            sub: "interview rate",
          },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={styles.statCard}>
            <div style={{ ...styles.statIconBg, backgroundColor: s.bg }}>
              <span style={{ ...styles.statValue, color: s.color }}>
                {loading ? "—" : s.value}
              </span>
            </div>
            <div>
              <p style={styles.statLabel}>{s.label}</p>
              <p style={styles.statSub}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent side by side */}
      <div style={styles.twoCol}>
        {/* Chart */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Activity</h2>
            <span style={styles.cardSub}>Last 7 days</span>
          </div>
          {loading ? (
            <div style={styles.loadingBox}>Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={28}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.count > 0 ? "#2563eb" : "#e2e8f0"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pipeline breakdown */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Pipeline</h2>
            <Link href="/dashboard/jobs" style={styles.viewAll}>
              View all →
            </Link>
          </div>
          {loading ? (
            <div style={styles.loadingBox}>Loading…</div>
          ) : stats.total === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📋</span>
              <p style={styles.emptyText}>No applications yet</p>
              <Link href="/dashboard/jobs/add" style={styles.emptyLink}>
                Add your first one →
              </Link>
            </div>
          ) : (
            <div style={styles.pipeline}>
              {[
                { label: "Applied", value: stats.applied, color: "#8b5cf6" },
                {
                  label: "Interviewing",
                  value: stats.interviewing,
                  color: "#f59e0b",
                },
                { label: "Offered", value: stats.offered, color: "#10b981" },
                { label: "Rejected", value: stats.rejected, color: "#ef4444" },
              ].map((s) => (
                <div key={s.label} style={styles.pipelineRow}>
                  <div style={styles.pipelineLeft}>
                    <span
                      style={{
                        ...styles.pipelineDot,
                        backgroundColor: s.color,
                      }}
                    />
                    <span style={styles.pipelineLabel}>{s.label}</span>
                  </div>
                  <div style={styles.pipelineBarWrap}>
                    <div
                      style={{
                        ...styles.pipelineBar,
                        width:
                          stats.total > 0
                            ? `${(s.value / stats.total) * 100}%`
                            : "0%",
                        backgroundColor: s.color + "30",
                        borderRight:
                          s.value > 0 ? `3px solid ${s.color}` : "none",
                      }}
                    />
                  </div>
                  <span style={styles.pipelineCount}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent applications */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Recent Applications</h2>
          <Link href="/dashboard/jobs" style={styles.viewAll}>
            View all →
          </Link>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Loading…</div>
        ) : recentJobs.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🚀</span>
            <p style={styles.emptyText}>
              No applications yet — let's change that!
            </p>
            <Link href="/dashboard/jobs/add" style={styles.emptyLink}>
              Add your first application →
            </Link>
          </div>
        ) : (
          <div style={styles.jobTable}>
            <div style={styles.jobTableHead}>
              <span style={{ flex: 2 }}>Company / Role</span>
              <span style={{ flex: 1 }}>Status</span>
              <span style={{ flex: 1 }}>Applied</span>
              <span style={{ width: 60 }}></span>
            </div>
            {recentJobs.map((job) => (
              <div key={job._id} className="job-row" style={styles.jobRow}>
                <div style={{ flex: 2 }}>
                  <p style={styles.jobCompany}>{job.company}</p>
                  <p style={styles.jobRole}>{job.role}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: getStatusColor(job.status) + "18",
                      color: getStatusColor(job.status),
                    }}
                  >
                    {getStatusLabel(job.status)}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={styles.dateText}>
                    {job.appliedDate
                      ? new Date(job.appliedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                <div style={{ width: 60, textAlign: "right" }}>
                  <Link
                    href={`/dashboard/jobs/edit/${job._id}`}
                    style={styles.editLink}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    maxWidth: 1100,
    margin: "0 auto",
  },

  // Header
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
  },
  greeting: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 28,
    fontWeight: 400,
    color: "#0f172a",
    margin: "0 0 4px",
    letterSpacing: "-0.5px",
  },
  greetingName: { color: "#2563eb" },
  greetingSub: { fontSize: 14, color: "#64748b", margin: 0 },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#2563eb",
    color: "#fff",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
    transition: "background 0.2s, transform 0.15s",
    flexShrink: 0,
  },

  // Stats
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 14,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: "16px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  statIconBg: { borderRadius: 10, padding: "10px 14px", flexShrink: 0 },
  statValue: { fontSize: 22, fontWeight: 700, display: "block" },
  statLabel: { fontSize: 12, fontWeight: 600, color: "#374151", margin: 0 },
  statSub: { fontSize: 11, color: "#94a3b8", margin: "2px 0 0" },

  // Two col
  twoCol: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: "22px 24px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 },
  cardSub: { fontSize: 12, color: "#94a3b8" },
  viewAll: {
    fontSize: 12,
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 500,
  },
  loadingBox: {
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: 14,
  },

  // Pipeline
  pipeline: { display: "flex", flexDirection: "column", gap: 14 },
  pipelineRow: { display: "flex", alignItems: "center", gap: 12 },
  pipelineLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: 110,
    flexShrink: 0,
  },
  pipelineDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  pipelineLabel: { fontSize: 13, color: "#475569", fontWeight: 500 },
  pipelineBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  pipelineBar: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.5s ease",
  },
  pipelineCount: {
    width: 24,
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    textAlign: "right",
  },

  // Empty
  emptyState: {
    textAlign: "center",
    padding: "32px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: { fontSize: 32 },
  emptyText: { fontSize: 14, color: "#64748b", margin: 0 },
  emptyLink: {
    fontSize: 13,
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 500,
  },

  // Job table
  jobTable: { display: "flex", flexDirection: "column" },
  jobTableHead: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 12px 10px",
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #f1f5f9",
  },
  jobRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px",
    borderRadius: 8,
    transition: "background 0.15s",
  },
  jobCompany: { fontSize: 14, fontWeight: 600, color: "#0f172a", margin: 0 },
  jobRole: { fontSize: 12, color: "#94a3b8", margin: "2px 0 0" },
  badge: { fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6 },
  dateText: { fontSize: 13, color: "#64748b" },
  editLink: {
    fontSize: 12,
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 500,
  },
};
