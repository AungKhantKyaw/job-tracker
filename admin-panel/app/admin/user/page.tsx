"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const UserListPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseUrl}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${baseUrl}/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <div style={styles.page}>Loading users...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>User Management</h2>
          <p style={styles.subtitle}>Manage system access and roles</p>
        </div>
        <Link href="/admin/user/add" style={styles.addBtn}>+ New User</Link>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Joined Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.userName}>{user.name || "N/A"}</div>
                </td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                    color: user.role === 'admin' ? '#1e40af' : '#374151'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={styles.td}>
                  <div style={styles.actionGroup}>
                    {/* Assuming you have a user edit page, otherwise remove this link */}
                    <Link href={`/admin/user/edit/${user._id}`} style={styles.editBtn}>Edit</Link>
                    <button onClick={() => handleDelete(user._id)} style={styles.deleteBtn}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: { padding: '40px', maxWidth: '1100px', margin: '0 auto', fontFamily: '"Inter", sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#111827', margin: 0 },
  subtitle: { color: '#6b7280', marginTop: '4px' },
  addBtn: { backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' },
  tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  theadRow: { backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
  th: { padding: '16px', fontSize: '12px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '16px', fontSize: '14px', color: '#111827' },
  userName: { fontWeight: '600' },
  badge: { padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
  actionGroup: { display: 'flex', gap: '15px' },
  editBtn: { color: '#2563eb', textDecoration: 'none', fontWeight: '600' },
  deleteBtn: { color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 },
  errorBox: { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }
};

export default UserListPage;