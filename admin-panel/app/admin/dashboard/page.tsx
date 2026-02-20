"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

  useEffect(() => {

    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('userName');
    const role = localStorage.getItem('role');

    //Redirect if no token or if not an admin
    if (!token || role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    setUserName(storedName);

    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${baseUrl}/job`, {
          headers: {
            Authorization: `Bearer ${token}` 
          }
        });
        setJobs(response.data);
      } catch (err) {
        setError('Could not fetch jobs. Your session might have expired.');
        if (err.response?.status === 401) {
          localStorage.clear();
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [router, baseUrl]);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading your jobs...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <AdminHeader userName={userName} />

      {error && <p style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}

      <section>
        <h3 style={{ marginBottom: '15px' }}>Job Applications Management</h3>
        {jobs.length === 0 ? (
          <p>No jobs found in the system.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {jobs.map((job) => (
              <div key={job._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#f9f9f9' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{job.title}</h4>
                <p style={{ margin: '5px 0' }}><strong>Company:</strong> {job.company}</p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Status:</strong> 
                  <span style={{ color: '#0070f3', marginLeft: '5px' }}>{job.status || 'Pending'}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;