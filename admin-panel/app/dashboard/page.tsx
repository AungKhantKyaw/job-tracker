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
import styles from "./dashboard.module.css";
import { apiFetch } from "@/lib/api";

interface Status { _id: string; label: string; color: string; }
interface Job { _id: string; role: string; company: string; location?: string; appliedDate?: string; createdAt?: string; status?: Status | string; }

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
        const res = await apiFetch('/api/jobs?page=1&limit=10');
        if (!res.ok) return;
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : (data.jobs ?? []));

      const profileRes = await apiFetch('/api/user/profile');
      const profile = await profileRes.json();
      console.log('User role:', profile.role);

      } catch(err: any) {
        toast.error(err.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const stats = useMemo(() => ({
    total: jobs.length,
    applied: jobs.filter((j) => getStatusLabel(j.status) === "Applied").length,
    interviewing: jobs.filter((j) => getStatusLabel(j.status) === "Interviewing").length,
    offered: jobs.filter((j) => getStatusLabel(j.status) === "Offered").length,
    rejected: jobs.filter((j) => getStatusLabel(j.status) === "Rejected").length,
  }), [jobs]);

  const chartData = useMemo(() => {
    const last7 = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        date: d.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: d.toISOString().split("T")[0],
        count: 0,
      };
    }).reverse();

    jobs.forEach((job) => {
      try {
        const date = new Date(job.createdAt || job.appliedDate || "").toISOString().split("T")[0];
        const match = last7.find((d) => d.fullDate === date);
        if (match) match.count += 1;
      } catch {}
    });
    return last7;
  }, [jobs]);

  const successRate = stats.total > 0 ? Math.round(((stats.interviewing + stats.offered) / stats.total) * 100) : 0;
  const recentJobs = jobs.slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.greeting}>
            {greeting()}, <span className={styles.greetingName}>{userName}</span> 👋
          </h1>
          <p className={styles.greetingSub}>
            {stats.total === 0 ? "Start tracking your first job." : `You have ${stats.total} application${stats.total !== 1 ? "s" : ""} tracked.`}
          </p>
        </div>
        <Link href="/dashboard/jobs/add" className={styles.addBtn}>
          + Add Application
        </Link>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {[
          { label: "Total", value: stats.total, color: "#2563eb", bg: "#eff6ff", sub: "applications", delay: "0.05s" },
          { label: "Applied", value: stats.applied, color: "#8b5cf6", bg: "#f5f3ff", sub: "waiting", delay: "0.1s" },
          { label: "Interviewing", value: stats.interviewing, color: "#f59e0b", bg: "#fffbeb", sub: "in progress", delay: "0.15s" },
          { label: "Offered", value: stats.offered, color: "#10b981", bg: "#ecfdf5", sub: "🎉 congrats", delay: "0.2s" },
          { label: "Success Rate", value: `${successRate}%`, color: "#0ea5e9", bg: "#f0f9ff", sub: "interview rate", delay: "0.25s" },
        ].map((s) => (
          <div key={s.label} className={styles.statCard} style={{ animationDelay: s.delay }}>
            <div className={styles.statIconBg} style={{ backgroundColor: s.bg }}>
              <span className={styles.statValue} style={{ color: s.color }}>
                {loading ? "—" : s.value}
              </span>
            </div>
            <div style={{ overflow: "hidden" }}>
              <p className={styles.statLabel}>{s.label}</p>
              <p className={styles.statSub}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.twoColGrid}>
        {/* Activity Chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Activity</h2>
            <span className={styles.cardSub}>Last 7 days</span>
          </div>
          {loading ? (
            <div className={styles.loadingBox}>Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={28}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.count > 0 ? "#2563eb" : "#e2e8f0"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pipeline breakdown */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Pipeline</h2>
            <Link href="/dashboard/jobs" className={styles.viewAll}>View all →</Link>
          </div>
          {loading ? (
            <div className={styles.loadingBox}>Loading…</div>
          ) : stats.total === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📋</span>
              <p className={styles.emptyText}>No applications yet</p>
              <Link href="/dashboard/jobs/add" className={styles.emptyLink}>Add your first one →</Link>
            </div>
          ) : (
            <div className={styles.pipeline}>
              {[
                { label: "Applied", value: stats.applied, color: "#8b5cf6" },
                { label: "Interviewing", value: stats.interviewing, color: "#f59e0b" },
                { label: "Offered", value: stats.offered, color: "#10b981" },
                { label: "Rejected", value: stats.rejected, color: "#ef4444" },
              ].map((s) => (
                <div key={s.label} className={styles.pipelineRow}>
                  <div className={styles.pipelineLeft}>
                    <span className={styles.pipelineDot} style={{ backgroundColor: s.color }} />
                    <span className={styles.pipelineLabel}>{s.label}</span>
                  </div>
                  <div className={styles.pipelineBarWrap}>
                    <div
                      className={styles.pipelineBar}
                      style={{
                        width: stats.total > 0 ? `${(s.value / stats.total) * 100}%` : "0%",
                        backgroundColor: s.color + "30",
                        borderRight: s.value > 0 ? `3px solid ${s.color}` : "none",
                      }}
                    />
                  </div>
                  <span className={styles.pipelineCount}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Recent Applications</h2>
          <Link href="/dashboard/jobs" className={styles.viewAll}>View all →</Link>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>Loading…</div>
        ) : recentJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🚀</span>
            <p className={styles.emptyText}>No applications yet — let's change that!</p>
            <Link href="/dashboard/jobs/add" className={styles.emptyLink}>Add your first application →</Link>
          </div>
        ) : (
          <div className={styles.jobTable}>
            <div className={styles.jobTableHead}>
              <span style={{ flex: 2 }}>Company / Role</span>
              <span style={{ flex: 1 }} className={styles.hideMobile}>Status</span>
              <span style={{ flex: 1 }}>Applied</span>
              <span style={{ width: 60 }}></span>
            </div>
            {recentJobs.map((job) => (
              <div key={job._id} className={styles.jobRow}>
                <div style={{ flex: 2 }}>
                  <p className={styles.jobCompany}>{job.company}</p>
                  <p className={styles.jobRole}>{job.role}</p>
                </div>
                <div style={{ flex: 1 }} className={styles.hideMobile}>
                  <span
                    className={styles.badge}
                    style={{
                      backgroundColor: getStatusColor(job.status) + "18",
                      color: getStatusColor(job.status),
                    }}
                  >
                    {getStatusLabel(job.status)}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <span className={styles.dateText}>
                    {job.appliedDate ? new Date(job.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </span>
                </div>
                <div style={{ width: 60, textAlign: "right" }}>
                  <Link href={`/dashboard/jobs/edit/${job._id}`} className={styles.editLink}>Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}