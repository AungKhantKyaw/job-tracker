"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminHeader = () => {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {    
    const storedName = localStorage.getItem('userName');
    setUserName(storedName || 'Admin');
  }, []);

  const handleLogout = () => {
    // Clear everything from local storage
    localStorage.clear(); 
    // Send them back to the admin login page
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      borderBottom: '1px solid #eee', 
      padding: '10px 20px',
      marginBottom: '20px' 
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>JobTracker</h1>
        <span style={{ color: '#666' }}>Welcome, <strong>{userName || 'Admin'}</strong></span>
      </div>

      <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <a href="/admin/dashboard" style={{ textDecoration: 'none', color: '#0070f3' }}>Dashboard</a>
        <a href="/admin/job" style={{ textDecoration: 'none', color: '#0070f3' }}>Job Application</a>
        <a href="/admin/status" style={{ textDecoration: 'none', color: '#0070f3' }}>Status</a>
        <a href="/admin/user" style={{ textDecoration: 'none', color: '#0070f3' }}>Manage Users</a>
        <button 
          onClick={handleLogout} 
          style={{ 
            background: '#ff4444', 
            color: 'white', 
            border: 'none', 
            padding: '8px 15px', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </nav>
    </header>
  );
};

export default AdminHeader;