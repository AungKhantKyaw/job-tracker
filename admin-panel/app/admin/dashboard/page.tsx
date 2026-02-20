"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
        
        const response = await axios.get(`${baseUrl}/job`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(response.data);
      } catch (err) {
        console.error("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <p>Loading jobs...</p>;

  return (
    <section>
      <h3>Admin Overview</h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {jobs.map((job) => (
          <div key={job._id} style={{ border: '1px solid #ddd', padding: '15px' }}>
            <h4>{job.title} at {job.company}</h4>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminDashboard;