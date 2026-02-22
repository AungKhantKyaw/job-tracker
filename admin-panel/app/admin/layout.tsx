"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthorized(false);
      return;
    }

    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : null;
    const role = user?.role || localStorage.getItem("role");

    if (!token) {
      localStorage.clear();
      router.push("/login");
      return;
    }

    // Define paths that ONLY an Admin can access
    const adminOnlyPaths = ["/admin/user", "/admin/status"];
    const isTryingAdminPath = adminOnlyPaths.some((path) =>
      pathname.startsWith(path),
    );

    if (isTryingAdminPath && role !== "admin") {
      router.push("/admin/dashboard");
      return;
    }

    // If all checks pass
    setIsAuthorized(true);
  }, [router, isLoginPage, pathname]);

  // Handle Login Page view
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state to prevent "flashing" of private content
  if (!isAuthorized) {
    return (
      <div style={styles.loadingWrapper}>
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
    fontWeight: "500",
  },
};

if (typeof document !== "undefined") {
  const styleSheet = document.styleSheets[0];
  const keyframes = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
}
