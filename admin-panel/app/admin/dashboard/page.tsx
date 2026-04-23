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
import type { Job } from "@/types";
import styles from "./dashboard.module.css";

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

  const stats = useMemo(() => ({
    total: jobs.length,
    interviewing: jobs.filter((j) => getStatusLabel(j.status) === "Interviewing").length,
    offers: jobs.filter((j) => getStatusLabel(j.status) === "Offered").length,
    rejected: jobs.filter((j) => getStatusLabel(j.status) === "Rejected").length,
  }), [jobs]);

  if (loading) return (
    <div className={styles.page}>
      <p className={styles.loading}>Loading dashboard…</p>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <div className={styles.logoArea}>
              <div className={styles.logoIcon}>J</div>
              <h2 className={styles.title}>OfferGrid Admin</h2>
            </div>
            <p className={styles.subtitle}>Track your application momentum.</p>
          </div>
          <Link href="/admin/job/add" className={styles.addButton}>
            + Add Application
          </Link>
        </header>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard} style={{ borderLeftColor: "#2563eb" }}>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
          <div className={styles.statCard} style={{ borderLeftColor: "#f59e0b" }}>
            <span className={styles.statLabel}>Interviews</span>
            <span className={styles.statValue}>{stats.interviewing}</span>
          </div>
          <div className={styles.statCard} style={{ borderLeftColor: "#10b981" }}>
            <span className={styles.statLabel}>Offers</span>
            <span className={styles.statValue}>{stats.offers}</span>
          </div>
          <div className={styles.statCard} style={{ borderLeftColor: "#ef4444" }}>
            <span className={styles.statLabel}>Rejected</span>
            <span className={styles.statValue}>{stats.rejected}</span>
          </div>
        </div>

        {/* Chart */}
        <div className={styles.chartSection}>
          <h3 className={styles.sectionTitle} style={{ marginBottom: "20px" }}>
            Application Activity (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#9ca3af", fontSize: 12 }} 
                dy={10} 
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.count > 0 ? "#2563eb" : "#e5e7eb"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Applications */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Applications</h3>
            <Link href="/admin/job" className={styles.viewAll}>View All</Link>
          </div>
          <div className={styles.list}>
            {jobs.length === 0 ? (
              <p className={styles.jobMeta} style={{ textAlign: "center", padding: "20px 0" }}>
                No applications yet.
              </p>
            ) : (
              jobs.slice(0, 4).map((job) => (
                <div key={job._id} className={styles.jobItem}>
                  <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{job.role}</h4>
                    <p className={styles.jobMeta}>{job.company}</p>
                  </div>
                  <span
                    className={styles.badge}
                    style={{
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

export default AdminDashboard;