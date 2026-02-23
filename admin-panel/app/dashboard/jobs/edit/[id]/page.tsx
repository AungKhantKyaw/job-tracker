"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

interface EditProps {
  params: Promise<{ id: string }>;
}

interface Status {
  _id: string;
  label: string;
  color?: string;
}

interface StatusHistory {
  status: Status | string;
  date: string;
}

interface FormData {
  company: string;
  role: string;
  location: string;
  salaryRange: string;
  status: string;
  appliedDate: string;
  followupDate: string;
  link: string;
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  statusHistory: StatusHistory[];
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const formatDate = (d: string | null) =>
  d ? new Date(d).toISOString().split("T")[0] : "";

const getHistoryLabel = (status: StatusHistory["status"]) => {
  if (!status) return "Unknown";
  if (typeof status === "object") return status.label;
  return status;
};

export default function UserEditJobPage({ params: paramsPromise }: EditProps) {
  const toast = useToast();
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();

  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    company: "",
    role: "",
    location: "",
    salaryRange: "",
    status: "",
    appliedDate: "",
    followupDate: "",
    link: "",
    description: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
    statusHistory: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, statusRes] = await Promise.all([
          fetch(`${BASE_URL}/job/${id}`, { credentials: "include" }),
          fetch(`${BASE_URL}/status`, { credentials: "include" }),
        ]);
        if (!jobRes.ok) throw new Error("Failed to load job.");
        const [job, statusData] = await Promise.all([
          jobRes.json(),
          statusRes.json(),
        ]);
        setStatuses(statusData);
        setFormData({
          ...job,
          status: job.status?._id || job.status || "",
          appliedDate: formatDate(job.appliedDate),
          followupDate: formatDate(job.followupDate),
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/job/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          appliedDate: formData.appliedDate || null,
          followupDate: formData.followupDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update.");

      toast.success("Application updated successfully!");
      router.push("/dashboard/jobs");
    } catch (err: any) {
      toast.error(err.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p
            style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}
          >
            Loading…
          </p>
        </div>
      </div>
    );

  return (
    <div style={styles.page}>
      <div style={styles.breadcrumb}>
        <Link href="/dashboard/jobs" style={styles.backLink}>
          ← Back to Applications
        </Link>
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>Edit Application</h1>
        <p style={styles.subtitle}>
          {formData.company} — {formData.role}
        </p>

        {error && <div style={styles.errorBox}>✕ {error}</div>}

        <form onSubmit={handleSubmit}>
          <Section label="General Information">
            <div style={styles.grid}>
              <Field label="Company *">
                <input
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  style={styles.input}
                />
              </Field>
              <Field label="Role *">
                <input
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  style={styles.input}
                />
              </Field>
              <Field label="Status">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={styles.input}
                >
                  {statuses.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Applied Date">
                <input
                  type="date"
                  name="appliedDate"
                  value={formData.appliedDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </Field>
              <Field label="Follow-up Date">
                <input
                  type="date"
                  name="followupDate"
                  value={formData.followupDate}
                  onChange={handleChange}
                  style={styles.input}
                />
              </Field>
            </div>
          </Section>

          <Section label="Job Details">
            <div style={styles.grid}>
              <Field label="Location">
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  style={styles.input}
                />
              </Field>
              <Field label="Salary Range">
                <input
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  style={styles.input}
                />
              </Field>
              <Field label="Job Post URL" style={{ gridColumn: "span 2" }}>
                <input
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  style={styles.input}
                />
              </Field>
            </div>
          </Section>

          <Section label="Contact Person (optional)">
            <div style={styles.grid}>
              <Field label="Name">
                <input
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  style={styles.input}
                />
              </Field>
              <Field label="Email">
                <input
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  style={styles.input}
                />
              </Field>
              <Field label="Phone">
                <input
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </Field>
            </div>
          </Section>

          <Section label="Notes">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Job Description">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={styles.textarea}
                />
              </Field>
              <Field label="Personal Notes">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  style={{ ...styles.textarea, minHeight: 80 }}
                />
              </Field>
            </div>
          </Section>

          {/* Timeline */}
          {formData.statusHistory?.length > 0 && (
            <Section label="Application Timeline">
              <div style={styles.timeline}>
                {formData.statusHistory.map((h, i) => (
                  <div key={i} style={styles.timelineItem}>
                    <div style={styles.timelineDot} />
                    <div>
                      <p style={styles.timelineStatus}>
                        {getHistoryLabel(h.status)}
                      </p>
                      <p style={styles.timelineDate}>
                        {new Date(h.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {i < formData.statusHistory.length - 1 && (
                      <div style={styles.timelineLine} />
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          <div style={styles.actions}>
            <Link href="/dashboard/jobs" style={styles.cancelBtn}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving…" : "Update Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 14px",
          paddingBottom: 8,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { maxWidth: 820, margin: "0 auto" },
  breadcrumb: { marginBottom: 16 },
  backLink: { fontSize: 13, color: "#64748b", textDecoration: "none" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: "32px 36px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  title: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 24,
    fontWeight: 400,
    color: "#0f172a",
    margin: "0 0 4px",
    letterSpacing: "-0.4px",
  },
  subtitle: { fontSize: 14, color: "#64748b", margin: "0 0 28px" },
  errorBox: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "11px 14px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 20,
    border: "1px solid #fecaca",
    fontWeight: 500,
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    backgroundColor: "#fff",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    minHeight: 100,
    resize: "vertical",
    width: "100%",
    boxSizing: "border-box",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    backgroundColor: "#fff",
  },
  submitBtn: {
    padding: "10px 24px",
    borderRadius: 8,
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: "16px 20px",
    border: "1px solid #f1f5f9",
  },
  timelineItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    position: "relative",
    paddingBottom: 20,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    flexShrink: 0,
    marginTop: 4,
    zIndex: 2,
  },
  timelineLine: {
    position: "absolute",
    left: 4,
    top: 14,
    bottom: 0,
    width: 2,
    backgroundColor: "#e2e8f0",
    zIndex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
    margin: 0,
  },
  timelineDate: { fontSize: 12, color: "#94a3b8", margin: "2px 0 0" },
};
