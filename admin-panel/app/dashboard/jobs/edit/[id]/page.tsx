"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import styles from "./editJob.module.css";

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
      <div className={styles.page}>
        <div className={styles.card}>
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>
            Loading…
          </p>
        </div>
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/jobs" className={styles.backLink}>
          ← Back to Applications
        </Link>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>Edit Application</h1>
        <p className={styles.subtitle}>
          {formData.company} — {formData.role}
        </p>

        {error && <div className={styles.errorBox}>✕ {error}</div>}

        <form onSubmit={handleSubmit}>
          <Section label="General Information">
            <div className={styles.grid}>
              <Field label="Company *">
                <input
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className={styles.input}
                />
              </Field>
              <Field label="Role *">
                <input
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className={styles.input}
                />
              </Field>
              <Field label="Status">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.input}
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
                  className={styles.input}
                />
              </Field>
              <Field label="Follow-up Date">
                <input
                  type="date"
                  name="followupDate"
                  value={formData.followupDate}
                  onChange={handleChange}
                  className={styles.input}
                />
              </Field>
            </div>
          </Section>

          <Section label="Job Details">
            <div className={styles.grid}>
              <Field label="Location">
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={styles.input}
                />
              </Field>
              <Field label="Salary Range">
                <input
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  className={styles.input}
                />
              </Field>
              <Field label="Job Post URL" className={styles.spanFull}>
                <input
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className={styles.input}
                />
              </Field>
            </div>
          </Section>

          <Section label="Contact Person (optional)">
            <div className={styles.grid}>
              <Field label="Name">
                <input
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className={styles.input}
                />
              </Field>
              <Field label="Email">
                <input
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className={styles.input}
                />
              </Field>
              <Field label="Phone">
                <input
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className={styles.input}
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
                  className={styles.textarea}
                />
              </Field>
              <Field label="Personal Notes">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className={styles.textarea}
                  style={{ minHeight: 80 }}
                />
              </Field>
            </div>
          </Section>

          {formData.statusHistory?.length > 0 && (
            <Section label="Application Timeline">
              <div className={styles.timeline}>
                {formData.statusHistory.map((h, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    <div>
                      <p className={styles.timelineStatus}>
                        {getHistoryLabel(h.status)}
                      </p>
                      <p className={styles.timelineDate}>
                        {new Date(h.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {i < formData.statusHistory.length - 1 && (
                      <div className={styles.timelineLine} />
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          <div className={styles.actions}>
            <Link href="/dashboard/jobs" className={styles.cancelBtn}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={styles.submitBtn}
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
    <div className={styles.sectionContainer}>
      <p className={styles.sectionLabel}>{label}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.fieldContainer} ${className || ""}`}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}