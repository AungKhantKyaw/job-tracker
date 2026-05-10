"use client";

import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={styles.layoutContainer}>
      <AdminHeader />
      <main style={styles.mainContent}>{children}</main>
    </div>
  );
}

const styles = {
  layoutContainer: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  },
  mainContent: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
};