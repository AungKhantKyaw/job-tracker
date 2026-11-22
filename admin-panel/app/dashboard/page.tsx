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
  PieChart,
  Pie,
} from "recharts";

import { useToast } from "@/components/ToastProvider";
import styles from "./dashboard.module.css";
import { apiFetch } from "@/lib/api";
import { errorMessage } from '@/lib/errors';
import { formatDateOnly, lastMonths, monthKey } from "@/lib/date";
import type { StatusDistributionItem, MonthlyTrendPoint } from "@/types";

interface Status { _id: string; label: string; color: string; }
interface Job { _id: string; role: string; company: string; location?: string; appliedDate?: string; createdAt?: string; status?: Status | string; }

// Custom tooltip for the donut chart — shows the label and count.
const DonutTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: StatusDistributionItem }[] }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div style={{ padding: "8px 10px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#0f172b" }}>
      <span style={{ color: item.color, fontWeight: 600 }}>●</span> {item.label}: <strong>{item.count}</strong>
    </div>
  );
};

// Custom tooltip for the monthly trend chart — shows the month and count.
const MonthlyTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: MonthlyTrendPoint }[] }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div style={{ padding: "8px 10px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, color: "#0f172b" }}>
      {item.month}: <strong>{item.count}</strong> application{item.count !== 1 ? "s" : ""}
    </div>
  );
};

export default function UserDashboard() {
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [statuses, setStatuses] = useState<Status[]>([]);

  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem("user") || "{}");
      setUserName(u.name?.split(" ")[0] || "there");
    } catch {}

    const fetchJobs = async () => {
      try {
        const [jobRes, statusRes] = await Promise.all([
          apiFetch('/api/jobs?page=1&limit=1000'),
          apiFetch('/api/status'),
        ]);

        if (jobRes.status === 401 || statusRes.status === 401) {
          window.location.href = "/login?session=expired";
          return;
        }

        if (jobRes.ok) {
          const data = await jobRes.json();
          setJobs(Array.isArray(data) ? data : (data.jobs ?? []));
        }

        if (statusRes.ok) {
          setStatuses(await statusRes.json());
        }

        const profileRes = await apiFetch('/api/user/profile');
        const profile = await profileRes.json();
        console.log('User role:', profile.role);

      } catch (err: unknown) {
        toast.error(errorMessage(err) || "unknown" || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Build a lookup: status ObjectId -> { label, color } for the whole page.
  const statusById = useMemo(
    () => new Map(statuses.map((s) => [s._id, s])),
    [statuses],
  );

  const statusLabel = (status: Job["status"]) => {
    if (!status) return "No Status";
    if (typeof status === "object") return status.label;
    return status;
  };

  const statusColor = (status: Job["status"]) => {
    if (!status) return "#94a3b8";
    if (typeof status === "object") return status.color || "#94a3b8";
    const found = statusById.get(status);
    return found?.color ?? "#94a3b8";
  };

  const stats = useMemo(() => {
    const byLabel = new Map<string, number>();
    jobs.forEach((j) => {
      const label = statusLabel(j.status);
      byLabel.set(label, (byLabel.get(label) ?? 0) + 1);
    });
    return {
      total: jobs.length,
      applied: byLabel.get("Applied") ?? 0,
      interviewing:
        (byLabel.get("Phone Screen") ?? 0) +
        (byLabel.get("First Interview") ?? 0) +
        (byLabel.get("Second Interview") ?? 0),
      offered: byLabel.get("Offered") ?? 0,
      rejected: byLabel.get("Rejected") ?? 0,
    };
  }, [jobs]);

  // Status distribution donut data — only statuses that actually appear.
  const statusDistribution = useMemo<StatusDistributionItem[]>(() => {
    const byLabel = new Map<string, { count: number; color: string }>();
    jobs.forEach((job) => {
      if (typeof job.status === "object") {
        const label = job.status.label || "No Status";
        const color = job.status.color ?? "#94a3b8";
        const cur = byLabel.get(label);
        if (cur) cur.count += 1;
        else byLabel.set(label, { count: 1, color });
      } else if (job.status) {
        const found = statusById.get(job.status) ?? statuses.find((s) => s.label === job.status);
        if (found) {
          const cur = byLabel.get(found.label);
          if (cur) cur.count += 1;
          else byLabel.set(found.label, { count: 1, color: found.color });
        } else {
          const cur = byLabel.get(job.status);
          if (cur) cur.count += 1;
          else byLabel.set(job.status, { count: 1, color: "#94a3b8" });
        }
      } else {
        const cur = byLabel.get("No Status");
        if (cur) cur.count += 1;
        else byLabel.set("No Status", { count: 1, color: "#94a3b8" });
      }
    });
    return Array.from(byLabel.entries()).map(([label, { count, color }]) => ({
      label,
      color,
      count,
    }));
  }, [jobs, statuses, statusById]);

  // Monthly trend — jobs grouped by appliedDate/createdAt month over last 6 months.
  const monthlyTrend = useMemo<MonthlyTrendPoint[]>(() => {
    const months = lastMonths(6);
    const counts = new Map(months.map((m) => [m.monthKey, 0]));
    jobs.forEach((job) => {
      try {
        const date = job.createdAt || job.appliedDate || "";
        const k = monthKey(date);
        if (k && counts.has(k)) counts.set(k, counts.get(k)! + 1);
      } catch {}
    });
    return months.map((m) => ({
      month: m.month,
      monthKey: m.monthKey,
      count: counts.get(m.monthKey) ?? 0,
    }));
  }, [jobs]);

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
        <div className={styles.headerLeft}>
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
          { label: "Interviewing Total", value: stats.interviewing, color: "#f59e0b", bg: "#fffbeb", sub: "overall", delay: "0.15s" },
          { label: "Offered", value: stats.offered, color: "#10b981", bg: "#ecfdf5", sub: "🎉 congrats", delay: "0.24s" },
          { label: "Success Rate", value: `${successRate}%`, color: "#0ea5e9", bg: "#f0f9ff", sub: "interview rate", delay: "0.27s" },
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
                { label: "Interviewing Total", value: stats.interviewing, color: "#f59e0b" },
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

      {/* Status distribution + Monthly trend row */}
      <div className={styles.twoColGrid}>
        {/* Status distribution donut */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Status Distribution</h2>
            <span className={styles.cardSub}>
              {stats.total === 0 ? "No statuses yet" : `${statusDistribution.length} status${statusDistribution.length !== 1 ? "es" : ""}`} used
            </span>
          </div>
          {loading || stats.total === 0 ? (
            <div className={styles.loadingBox}>
              {stats.total === 0
                ? "No applications yet — add your first one to see your status mix."
                : "Loading…"}
            </div>
          ) : (
            <div className={styles.donutWrap}>
              <div className={styles.donut}>
                <PieChart width={200} height={200}>
                  <Pie
                    data={statusDistribution}
                    dataKey="count"
                    cx={90}
                    cy={90}
                    innerRadius={65}
                    outerRadius={90}
                    startAngle={-90}
                    endAngle={270}
                  >
                    {statusDistribution.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<DonutTooltip />}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                </PieChart>
              </div>
              <div className={styles.legendList}>
                {statusDistribution.map((entry) => {
                  const share = stats.total > 0 ? ((entry.count / stats.total) * 100).toFixed(0) : "0";
                  return (
                    <div key={entry.label} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ backgroundColor: entry.color }} />
                      <span className={styles.legendLabel}>{entry.label}</span>
                      <span className={styles.legendCount}>{entry.count} ({share}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Monthly trend bar chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Applications Over Time</h2>
            <span className={styles.cardSub}>Last 6 months</span>
          </div>
          {loading || stats.total === 0 ? (
            <div className={styles.loadingBox}>
              {stats.total === 0
                ? "No applications yet — add your first one to see your trend."
                : "Loading…"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  content={<MonthlyTooltip />}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={28}>
                  {monthlyTrend.map((entry) => (
                    <Cell key={entry.monthKey} fill={entry.count > 0 ? "#2563eb" : "#e2e8f0"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
            <p className={styles.emptyText}>No applications yet — let&apos;s change that!</p>
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
                      backgroundColor: statusColor(job.status) + "18",
                      color: statusColor(job.status),
                    }}
                  >
                    {statusLabel(job.status)}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <span className={styles.dateText}>
                    {formatDateOnly(job.appliedDate, "en-US", { month: "short", day: "numeric" }) || "—"}
                  </span>
                  <span className={styles.interviewBadge} style={{
                    display: statusLabel(job.status) === "Phone Screen" ? "inline" : "none",
                    marginLeft: "8px",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#0284c7",
                    textTransform: "capitalize",
                  }}>
                    {statusLabel(job.status)}
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