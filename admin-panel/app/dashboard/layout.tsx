"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface SessionUser {
  name: string;
  email: string;
  role: string;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/dashboard/jobs",
    label: "Applications",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("user") || "{}");
      if (saved?.name) setUser(saved);
      else router.push("/login");
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002"}/user/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );
    } finally {
      sessionStorage.removeItem("user");
      router.push("/login");
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Sora:wght@300;400;500;600&display=swap');
        .nav-item:hover { background: #f1f5f9 !important; }
        .nav-item.active { background: #f0f7ff !important; color: #2563eb !important; }
        .nav-item.active svg { stroke: #2563eb; }
        .logout-btn:hover { background: #fef2f2 !important; color: #dc2626 !important; }
        .add-btn:hover { background: #1d4ed8 !important; transform: translateY(-1px); }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); transition: transform 0.25s ease; }
          .sidebar.open { transform: translateX(0) !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        style={styles.sidebar}
      >
        {/* Logo */}
        <div style={styles.sidebarTop}>
          <Link href="/dashboard" style={styles.logo}>
            <span style={styles.logoMark}>OF</span>
            <span style={styles.logoText}>OfferFlow</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          <p style={styles.navSection}>Menu</p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${isActive ? " active" : ""}`}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <span
                  style={{
                    ...styles.navIcon,
                    ...(isActive ? { color: "#2563eb" } : {}),
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userRow}>
            <div style={styles.avatar}>{initials}</div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name || "—"}</span>
              <span style={styles.userEmail}>{user?.email || "—"}</span>
            </div>
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            style={styles.logoutBtn}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Mobile topbar */}
        <div style={styles.mobileTopbar}>
          <button
            style={styles.hamburger}
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Open menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={styles.mobileLogo}>OfferFlow</span>
          <div style={styles.mobileAvatar}>{initials}</div>
        </div>

        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  root: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: '"Sora", system-ui, sans-serif',
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 40,
  },

  // Sidebar
  sidebar: {
    width: 240,
    flexShrink: 0,
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    zIndex: 50,
  },
  sidebarTop: {
    padding: "24px 20px 20px",
    borderBottom: "1px solid #f1f5f9",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  logoText: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 18,
    color: "#0f172a",
    fontWeight: 400,
  },

  nav: {
    flex: 1,
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  navSection: {
    fontSize: 10,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "0 8px",
    marginBottom: 8,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: "#475569",
    textDecoration: "none",
    transition: "background 0.15s",
  },
  navItemActive: { color: "#2563eb", background: "#f0f7ff" },
  navIcon: { color: "#94a3b8", display: "flex", flexShrink: 0 },

  sidebarFooter: {
    padding: "16px 12px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  userRow: { display: "flex", alignItems: "center", gap: 10, padding: "0 4px" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    overflow: "hidden",
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userEmail: {
    fontSize: 11,
    color: "#94a3b8",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    color: "#64748b",
    transition: "background 0.15s, color 0.15s",
    width: "100%",
  },

  // Main
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  mobileTopbar: {
    display: "none",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 30,
  },
  hamburger: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#475569",
    padding: 4,
  },
  mobileLogo: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 18,
    color: "#0f172a",
  },
  mobileAvatar: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
  },
  content: { flex: 1, padding: "32px" },
};
