"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

interface Status {
  _id: string;
  label: string;
}

interface FormData {
  company: string;
  role: string;
  location: string;
  salaryRange: string;
  status: string;
  appliedDate: string;
  link: string;
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

export default function UserAddJobPage() {
  const toast = useToast();
  const router = useRouter();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    company: "",
    role: "",
    location: "",
    salaryRange: "",
    status: "",
    appliedDate: new Date().toISOString().split("T")[0],
    link: "",
    description: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
  });

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/status`, {
          credentials: "include",
        });
        const data: Status[] = await res.json();
        setStatuses(data);
        if (data.length > 0)
          setFormData((prev) => ({ ...prev, status: data[0]._id }));
      } catch {
        toast.error("Could not load statuses. Please refresh.");
      }
    };
    fetchStatuses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.status) {
      toast.warning("Please select a status.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create job.");

      toast.success("Application saved successfully!");
      router.push("/dashboard/jobs");
    } catch (err: any) {
      toast.error(err.message || "Failed to create job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.breadcrumb}>
        <Link href="/dashboard/jobs" style={styles.backLink}>
          ← Back to Applications
        </Link>
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>Add New Application</h1>
        <p style={styles.subtitle}>
          Track a new job you've applied to or plan to apply for
        </p>

        <form onSubmit={handleSubmit}>
          <Section label="General Information">
            <div style={styles.grid}>
              <Field label="Company *">
                <input
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Stripe"
                  style={styles.input}
                />
              </Field>
              <Field label="Role *">
                <input
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Engineer"
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
            </div>
          </Section>

          <Section label="Job Details">
            <div style={styles.grid}>
              <Field label="Location">
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Remote / City"
                  style={styles.input}
                />
              </Field>
              <Field label="Salary Range">
                <input
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  placeholder="e.g. $80k–$100k"
                  style={styles.input}
                />
              </Field>
              <Field label="Job Post URL" style={{ gridColumn: "span 2" }}>
                <input
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://…"
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

          <div style={styles.actions}>
            <Link href="/dashboard/jobs" style={styles.cancelBtn}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving…" : "Save Application"}
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
    fontFamily: '"Inter", sans-serif',
    fontSize: 24,
    fontWeight: 400,
    color: "#0f172a",
    margin: "0 0 4px",
    letterSpacing: "-0.4px",
  },
  subtitle: { fontSize: 14, color: "#64748b", margin: "0 0 28px" },
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
  },
};
