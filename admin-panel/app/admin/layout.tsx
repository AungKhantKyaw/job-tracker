"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // 1. If we are on the login page, we don't need to check authorization
    if (isLoginPage) {
      setIsAuthorized(false); 
      return;
    }

    // 2. Check for token and role
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // Use the role from the user object or a separate localStorage key
    const role = user?.role || localStorage.getItem('role');

    if (!token || role !== 'admin') {
      // Clear anything left over if they aren't authorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      
      router.push('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router, isLoginPage, pathname]);

  // 3. Render the login page without the Header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 4. Show a clean loading state while verifying the token
  if (!isAuthorized) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Verifying credentials...</p>
      </div>
    );
  }

  // 5. Protected Layout with Navigation Header
  return (
    <div style={styles.layoutContainer}>
      <AdminHeader />
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  layoutContainer: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  mainContent: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loadingWrapper: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #f3f4f6',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500'
  }
};