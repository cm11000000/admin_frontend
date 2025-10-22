/**
 * Global Type Definitions
 */

/**
 * User Types
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "admin" | "manager" | "operator" | "viewer";

/**
 * Authentication Types
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * API Response Types
 */
export interface APIError {
  message: string;
  code?: string;
  field?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  message?: string;
}

/**
 * Common UI Types
 */
export type Status = "idle" | "loading" | "success" | "error";

export type Theme = "light" | "dark" | "system";

export type Variant =
  | "default"
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

export type Size = "sm" | "md" | "lg" | "xl";

/**
 * Transaction Types
 */
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type TransactionType =
  | "payment"
  | "refund"
  | "transfer"
  | "withdrawal";

/**
 * Chart Data Types
 */
export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

/**
 * Filter Types
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FilterOptions {
  search?: string;
  status?: string[];
  dateRange?: DateRange;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Table Types
 */
export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

/**
 * Form Types
 */
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "select" | "textarea" | "date";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
}

/**
 * Notification Types
 */
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

/**
 * Dashboard Types
 */
export interface DashboardStats {
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  activeUsers: number;
}

/**
 * Settings Types
 */
export interface AppSettings {
  theme: Theme;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  display: {
    compactMode: boolean;
    showAnimations: boolean;
  };
}
