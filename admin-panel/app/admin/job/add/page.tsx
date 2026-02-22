"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Status, JobFormData } from "@/types";


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const AddJobPage = () => {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<JobFormData>({
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

        // Pre-select the first status
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, status: data[0]._id }));
        }
      } catch {
        console.error("Could not load statuses.");
      }
    };

    fetchStatuses();
  }, [router]);

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
    setError("");

    if (!formData.status) {
      setError("Please select a status.");
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

      if (!res.ok)
        throw new Error(data.message || "Failed to create job entry.");

      router.push("/admin/job");
    } catch (err: any) {
      setError(err.message || "Failed to create job entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Add New Job Application</h2>

        {error && <div style={styles.errorBox}>✕ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* General Information */}
          <div style={styles.sectionTitle}>General Information</div>
          <div style={styles.grid}>
            <div style={styles.floatingGroup}>
              <input
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                style={styles.floatingInput}
              />
              <label style={styles.floatingLabel}>Company *</label>
            </div>
            <div style={styles.floatingGroup}>
              <input
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                style={styles.floatingInput}
              />
              <label style={styles.floatingLabel}>Role *</label>
            </div>
            <div style={styles.floatingGroup}>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.floatingInput}
              >
                {statuses.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <label style={styles.floatingLabel}>Status</label>
            </div>
            <div style={styles.floatingGroup}>
              <input
                type="date"
                name="appliedDate"
                value={formData.appliedDate}
                onChange={handleChange}
                style={styles.floatingInput}
              />
              <label style={styles.floatingLabel}>Applied Date</label>
            </div>
          </div>

          {/* Job Details */}
          <div style={styles.sectionTitle}>Job Details</div>
          <div style={styles.grid}>
            <div style={styles.floatingGroup}>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                style={styles.floatingInput}
              />
              <label style={styles.floatingLabel}>Location</label>
            </div>
            <div style={styles.floatingGroup}>
              <input
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleChange}
                style={styles.floatingInput}
              />
              <label style={styles.floatingLabel}>Salary Range</label>
            </div>
            <div style={{ ...styles.floatingGroup, gridColumn: "span 2" }}>
              <input
                name="link"
                value={formData.link}
                onChange={handleChange}
                style={styles.floatingInput}
              />
              <label style={styles.floatingLabel}>Job Post URL</label>
            </div>
          </div>

          {/* Contact */}
          <div style={styles.sectionTitle}>Contact Person (optional)</div>
          <div style={styles.grid}>
            <div style={styles.floatingGroup}>
              <input
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                style={styles.floatingInput}
              />
              <label style={styles.floatingLabel}>Name</label>
            </div>
            <div style={styles.floatingGroup}>
              <input
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                style={styles.floatingInput}
              />
              <label style={styles.floatingLabel}>Email</label>
            </div>
            <div style={styles.floatingGroup}>
              <input
                name="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={handleChange}
                style={styles.floatingInput}
              />
              <label style={styles.floatingLabel}>Phone</label>
            </div>
          </div>

          {/* Description & Notes */}
          <div style={styles.sectionTitle}>Description & Notes</div>
          <div style={styles.textareaContainer}>
            <div style={styles.floatingGroup}>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={styles.floatingTextarea}
              />
              <label style={styles.floatingLabel}>Job Description</label>
            </div>
            <div style={styles.floatingGroup}>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                style={{ ...styles.floatingTextarea, minHeight: "80px" }}
              />
              <label style={styles.floatingLabel}>Personal Notes</label>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actionArea}>
            <button
              type="button"
              onClick={() => router.back()}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
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
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    fontFamily: '"Inter", sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: "850px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    height: "fit-content",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "30px",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "30px 0 20px",
    paddingBottom: "8px",
    borderBottom: "1px solid #f3f4f6",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
    marginBottom: "10px",
  },
  floatingGroup: { position: "relative" },
  floatingInput: {
    width: "100%",
    padding: "14px 16px",
    paddingTop: "18px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  floatingTextarea: {
    width: "100%",
    padding: "18px 16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
    minHeight: "120px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  floatingLabel: {
    position: "absolute",
    left: "12px",
    top: "-10px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#4a4a4a",
    backgroundColor: "#ffffff",
    padding: "0 6px",
    pointerEvents: "none",
  },
  textareaContainer: { display: "flex", flexDirection: "column", gap: "24px" },
  form: { display: "flex", flexDirection: "column" },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #fecaca",
    fontWeight: "500",
  },
  actionArea: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "40px",
  },
  submitBtn: {
    padding: "12px 28px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
  },
  cancelBtn: {
    padding: "12px 28px",
    backgroundColor: "transparent",
    color: "#4b5563",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontWeight: "500",
    cursor: "pointer",
  },
};

export default AddJobPage;
