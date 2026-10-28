"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";

// Paths under /admin that require the "admin" role.
// "/admin" = the whole admin area. To restrict only some pages (the old
// behaviour), use: ["/admin/user", "/admin/status"]
const ADMIN_ONLY_PATHS = ["/admin"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Authorization is derived synchronously from sessionStorage (saved by the
  // login page), so the effect below only needs to drive navigation — it never
  // calls setState, which avoids cascading renders.
  const { authorized, target } = (() => {
    let role = "";
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "null");
      role = user?.role || "";
    } catch {
      role = "";
    }

    // Not logged in (the session user is saved by the login page)
    if (!role) return { authorized: false, target: "/login" };

    const needsAdmin = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
    if (needsAdmin && role !== "admin") {
      return { authorized: false, target: "/dashboard" };
    }
    return { authorized: true, target: null };
  })();

  useEffect(() => {
    if (target) router.replace(target);
  }, [router, target]);

  // Don't flash private content before the check finishes
  if (!authorized) {
    return (
      <div style={styles.loadingWrapper}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Verifying permissions...</p>
      </div>
    );
  }

  return (
    <div style={styles.layoutContainer}>
      <AdminHeader />
      <main style={styles.mainContent}>{children}</main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  layoutContainer: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  },
  mainContent: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  loadingWrapper: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f4f6",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "16px",
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: 500,
  },
};