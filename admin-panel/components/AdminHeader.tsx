"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const AdminHeader = () => {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Read non-sensitive display data from sessionStorage
    // (Token itself stays in httpOnly cookie — never readable by JS)
    try {
      const userJson = sessionStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserName(user.name || "User");
        setUserRole(user.role || "user");
      } else {
        // sessionStorage is empty (e.g. after page close) — redirect to login
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      // ✅ Tell the server to clear the httpOnly cookie
      await fetch(`${BASE_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Even if the request fails, clear client state and redirect
    } finally {
      sessionStorage.removeItem("user");
      router.push("/login");
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.leftSection}>
        <h1 style={styles.logo}>JobTracker</h1>
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
    borderBottom: "1px solid #eee",
    padding: "12px 30px",
    backgroundColor: "#fff",
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
    color: "#111827",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  welcomeText: {
    color: "#666",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  roleBadge: {
    fontSize: "10px",
    backgroundColor: "#f3f4f6",
    padding: "2px 6px",
    borderRadius: "4px",
    textTransform: "uppercase",
    fontWeight: "700",
    color: "#374151",
  },
  nav: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#0070f3",
    fontSize: "14px",
    fontWeight: "500",
  },
  navLinkAdmin: {
    textDecoration: "none",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "700",
  },
  logoutBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
};

export default AdminHeader;