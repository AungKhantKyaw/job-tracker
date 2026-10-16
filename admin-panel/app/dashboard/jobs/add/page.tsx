"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import styles from "./addJob.module.css";
import { apiFetch } from "@/lib/api";

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
        const res = await apiFetch('/api/status');
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
      const res = await apiFetch(`/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/jobs" className={styles.backLink}>
          ← Back to Applications
        </Link>
      </div>

      <div className={styles.card}>
        <h1 className={styles.title}>Add New Application</h1>
        <p className={styles.subtitle}>
          Track a new job you've applied to or plan to apply for
        </p>

        <form onSubmit={handleSubmit}>
          <Section label="General Information">
            <div className={styles.grid}>
              <Field label="Company *">
                <input
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Stripe"
                  className={styles.input}
                />
              </Field>
              <Field label="Role *">
                <input
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Engineer"
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
            </div>
          </Section>

          <Section label="Job Details">
            <div className={styles.grid}>
              <Field label="Location">
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Remote / City"
                  className={styles.input}
                />
              </Field>
              <Field label="Salary Range">
                <input
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  placeholder="e.g. $80k–$100k"
                  className={styles.input}
                />
              </Field>
              <Field label="Job Post URL" className={styles.spanFull}>
                <input
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://…"
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

          <div className={styles.actions}>
            <Link href="/dashboard/jobs" className={styles.cancelBtn}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "Saving…" : "Save Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper Components now use CSS Module classes
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