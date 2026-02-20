"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import AdminHeader from '@/components/AdminHeader';

export default function AdminLayout({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 1. If the user is on the login page, don't protect it!
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Skip security check if we are already on the login page
    if (isLoginPage) return;

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      router.push('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router, isLoginPage]);

  // 2. If it's the login page, just show it cleanly (no header)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 3. While checking token for protected pages, show a loader
  if (!isAuthorized) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Verifying...</div>;
  }

  // 4. For Dashboard/Job pages, show Header + Content
  return (
    <>
      <AdminHeader />
      <main style={{ padding: '20px' }}>
        {children}
      </main>
    </>
  );
}