"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface EditProps {
  params: Promise<{ id: string }>;
}

const EditJobPage = ({ params: paramsPromise }: EditProps) => {
  const params = use(paramsPromise);
  const id = params.id;
  const router = useRouter();

  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    salaryRange: "",
    status: "Applied",
    appliedDate: "",
    followupDate: "", 
    link: "",
    description: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
    statusHistory: [] as any[] // Use an array
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [jobRes, statusRes] = await Promise.all([
          axios.get(`${baseUrl}/job/${id}`, { headers }),
          axios.get(`${baseUrl}/status`, { headers }),
        ]);

        setStatuses(statusRes.data);

        const job = jobRes.data;
        
        // Helper to format dates specifically for HTML input (YYYY-MM-DD)
        const formatDate = (dateStr: string | null) => {
          if (!dateStr) return "";
          return new Date(dateStr).toISOString().split("T")[0];
        };

        setFormData({
          ...job,
          appliedDate: formatDate(job.appliedDate),
          followupDate: formatDate(job.followupDate),
        });
      } catch (err: any) {
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, baseUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      // Clean data for submission: convert empty strings back to null for Dates
      const submissionData = {
        ...formData,
        followupDate: formData.followupDate || null,
        appliedDate: formData.appliedDate || null,
      };

      await axios.put(`${baseUrl}/job/${id}`, submissionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/admin/job");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update job application.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading application details...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Edit Job Application</h2>
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* General Information */}
          <div style={styles.sectionTitle}>General Information</div>
          <div style={styles.grid}>
            <div style={styles.floatingGroup}>
              <input name="company" value={formData.company} onChange={handleChange} required style={styles.floatingInput} />
              <label style={styles.floatingLabel}>Company *</label>
            </div>
            <div style={styles.floatingGroup}>
              <input name="role" value={formData.role} onChange={handleChange} required style={styles.floatingInput} />
              <label style={styles.floatingLabel}>Role *</label>
            </div>
            <div style={styles.floatingGroup}>
              <select name="status" value={formData.status} onChange={handleChange} style={styles.floatingInput}>
                {statuses.map((s) => (
                  <option key={s._id} value={s.label}>{s.label}</option>
                ))}
                {statuses.length === 0 && <option value="Applied">Applied</option>}
              </select>
              <label style={styles.floatingLabel}>Status</label>
            </div>
            <div style={styles.floatingGroup}>
              <input type="date" name="appliedDate" value={formData.appliedDate} onChange={handleChange} style={styles.floatingInput} />
              <label style={styles.floatingLabel}>Applied Date</label>
            </div>
            <div style={styles.floatingGroup}>
              <input type="date" name="followupDate" value={formData.followupDate} onChange={handleChange} style={styles.floatingInput} />
              <label style={styles.floatingLabel}>Follow-up Date</label>
            </div>
          </div>

          {/* Job Details */}
          <div style={styles.sectionTitle}>Job Details</div>
          <div style={styles.grid}>
            <div style={styles.floatingGroup}>
              <input name="location" value={formData.location} onChange={handleChange} style={styles.floatingInput} />
              <label style={styles.floatingLabel}>Location</label>
            </div>
            <div style={styles.floatingGroup}>
              <input name="salaryRange" value={formData.salaryRange} onChange={handleChange} style={styles.floatingInput} />
              <label style={styles.floatingLabel}>Salary Range</label>
            </div>
            <div style={{ ...styles.floatingGroup, gridColumn: "span 2" }}>
              <input name="link" value={formData.link} onChange={handleChange} style={styles.floatingInput} />
              <label style={styles.floatingLabel}>Job Post URL</label>
            </div>
          </div>

          {/* Contact Information */}
          <div style={styles.sectionTitle}>Contact Person (optional)</div>
          <div style={styles.grid}>
            <div style={styles.floatingGroup}>
              <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} style={styles.floatingInput} />
              <label style={styles.floatingLabel}>Name</label>
            </div>
            <div style={styles.floatingGroup}>
              <input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} style={styles.floatingInput} />
              <label style={styles.floatingLabel}>Email</label>
            </div>
            <div style={styles.floatingGroup}>
              <input name="contactPhone" type="tel" value={formData.contactPhone} onChange={handleChange} style={styles.floatingInput} />
              <label style={styles.floatingLabel}>Phone</label>
            </div>
          </div>

          {/* Description & Notes */}
          <div style={styles.sectionTitle}>Description & Notes</div>
          <div style={styles.textareaContainer}>
            <div style={styles.floatingGroup}>
              <textarea name="description" value={formData.description} onChange={handleChange} style={styles.floatingTextarea} />
              <label style={styles.floatingLabel}>Job Description</label>
            </div>
            <div style={styles.floatingGroup}>
              <textarea name="notes" value={formData.notes} onChange={handleChange} style={{ ...styles.floatingTextarea, minHeight: "80px" }} />
              <label style={styles.floatingLabel}>Personal Notes</label>
            </div>
          </div>

            <div style={styles.sectionTitle}>Application Timeline</div>
            <div style={styles.timelineContainer}>
            {formData.statusHistory && formData.statusHistory.length > 0 ? (
                formData.statusHistory.map((history: any, index: number) => (
                <div key={index} style={styles.timelineItem}>
                    <div style={styles.timelineDot}></div>
                    <div style={styles.timelineContent}>
                    <span style={styles.timelineStatus}>{history.status}</span>
                    <span style={styles.timelineDate}>
                        {new Date(history.date).toLocaleDateString(undefined, { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                    </span>
                    </div>
                    {index !== formData.statusHistory.length - 1 && <div style={styles.timelineLine}></div>}
                </div>
                ))
            ) : (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>No history yet. Change the status to start the timeline.</p>
            )}
            </div>

          {/* Action Buttons */}
          <div style={styles.actionArea}>
            <button type="button" onClick={() => router.back()} style={styles.cancelBtn}>Cancel</button>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.submitBtn,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? "not-allowed" : "pointer"
              }}
            >
              {saving ? "Saving Changes..." : "Update Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", padding: "40px 20px", display: "flex", justifyContent: "center", fontFamily: '"Inter", sans-serif' },
  card: { width: "100%", maxWidth: "850px", backgroundColor: "#ffffff", borderRadius: "16px", padding: "40px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" },
  title: { fontSize: "26px", fontWeight: "700", color: "#111827", marginBottom: "30px", textAlign: "center" },
  sectionTitle: { fontSize: "13px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", margin: "30px 0 20px", paddingBottom: "8px", borderBottom: "1px solid #f3f4f6" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "10px" },
  floatingGroup: { position: "relative" },
  floatingInput: { width: "100%", padding: "14px 16px", paddingTop: "18px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "15px", outline: "none", backgroundColor: "white" },
  floatingTextarea: { width: "100%", padding: "18px 16px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "15px", outline: "none", minHeight: "120px", resize: "vertical" },
  floatingLabel: { position: "absolute", left: "12px", top: "-10px", fontSize: "12px", fontWeight: "600", color: "#2563eb", backgroundColor: "#ffffff", padding: "0 6px", pointerEvents: "none", zIndex: 1 },
  textareaContainer: { display: "flex", flexDirection: "column", gap: "24px" },
  errorBox: { backgroundColor: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #fecaca" },
  actionArea: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "40px" },
  submitBtn: { padding: "12px 28px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
  cancelBtn: { padding: "12px 28px", backgroundColor: "transparent", color: "#4b5563", border: "1px solid #d1d5db", borderRadius: "10px", fontWeight: "500", cursor: "pointer" },
  timelineContainer: {
    padding: '20px 10px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #f3f4f6',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    position: 'relative',
    paddingBottom: '24px',
    gap: '15px'
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    backgroundColor: '#2563eb',
    borderRadius: '50%',
    marginTop: '5px',
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: '5.5px', // Centers line under dot
    top: '15px',
    bottom: '0',
    width: '1px',
    backgroundColor: '#d1d5db',
    zIndex: 1,
  },
  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  timelineStatus: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827'
  },
  timelineDate: {
    fontSize: '12px',
    color: '#6b7280'
  }
};

export default EditJobPage;