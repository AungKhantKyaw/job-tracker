"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";


const AdminHeader = () => {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    try {
      const userJson = sessionStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserName(user.name || "User");
        setUserRole(user.role || "user");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      sessionStorage.removeItem('user');
      router.push('/login');
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <h1 style={styles.logo}>OfferGrid</h1>
        {userName && (
          <span style={styles.welcomeText}>
            Welcome, <strong>{userName}</strong>
            <span style={styles.roleBadge}>{userRole}</span>
          </span>
        )}
      </div>

      <nav style={styles.nav}>
        <Link href="/admin/dashboard" style={styles.navLink}>Dashboard</Link>
        <Link href="/admin/job"       style={styles.navLink}>Applications</Link>
        <Link href="/admin/status"    style={styles.navLink}>Status</Link>
        <Link href="/admin/profile"   style={styles.navLink}>My Profile</Link>
        {userRole === "admin" && (
          <Link href="/admin/user" style={styles.navLinkAdmin}>Manage Users</Link>
        )}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </nav>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #2563eb",
    padding: "12px 30px",
    backgroundColor: "#ffffff",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  leftSection: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  logo: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#0f172b",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  welcomeText: {
    color: "#64748b",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  roleBadge: {
    fontSize: "10px",
    backgroundColor: "#eff6ff",
    padding: "2px 6px",
    borderRadius: "4px",
    textTransform: "uppercase",
    fontWeight: "700",
    color: "#1d4ed8",
  },
  nav: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "500",
  },
  navLinkAdmin: {
    textDecoration: "none",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "700",
  },
  logoutBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
  },
};

export default AdminHeader;
