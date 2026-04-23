import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Application",
  description: "View and edit your job application information",
};

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}