// types/index.ts
// Shared types used across the admin panel

// ─── Status ──────────────────────────────────────────────────────────────────

export interface Status {
  _id: string;
  label: string;
  color: string;
  createdAt?: string;
}

export interface StatusItem {
  _id: string;
  label: string;
  color: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "editor" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt?: string;
}

export interface SessionUser {
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginFormData {
  name: string;
  email: string;
  password: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  password: string;
}

// ─── Job ─────────────────────────────────────────────────────────────────────

export interface StatusHistory {
  status: Status;
  date: string;
}

export interface Job {
  _id: string;
  company: string;
  role: string;
  location?: string;
  salaryRange?: string;
  status?: Status;
  appliedDate?: string;
  followupDate?: string;
  link?: string;
  description?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  statusHistory?: StatusHistory[];
  createdAt?: string;
  updatedAt?: string;
}

// Job form state — status is a string ID while editing, object when fetched
export interface JobFormData {
  company: string;
  role: string;
  location: string;
  salaryRange: string;
  status: string; 
  appliedDate: string;
  followupDate: string;
  link: string;
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  statusHistory?: StatusHistory[];
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface PaginatedUsers {
  users: User[];
  pagination: Pagination;
}

export interface PaginatedJobs {
  jobs: Job[];
  totalPages: number;
  currentPage: number;
  totalJobs: number;
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ApiError {
  message: string;
}
