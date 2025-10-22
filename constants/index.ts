/**
 * Application Constants
 */

export const APP_NAME = "SabPaisa Admin Portal";
export const APP_VERSION = "5.0.0";
export const APP_DESCRIPTION = "World-class mobile-first payment management dashboard";

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY: "/auth/verify",
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE: "/user/update",
    CHANGE_PASSWORD: "/user/change-password",
  },
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "sabpaisa_auth_token",
  REFRESH_TOKEN: "sabpaisa_refresh_token",
  USER_DATA: "sabpaisa_user_data",
  THEME: "sabpaisa_theme",
  LANGUAGE: "sabpaisa_language",
} as const;

/**
 * Route Paths
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
} as const;

/**
 * Breakpoints (matches Tailwind config)
 */
export const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/**
 * Animation Durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  DISPLAY: "DD MMM YYYY",
  DISPLAY_WITH_TIME: "DD MMM YYYY, hh:mm A",
  API: "YYYY-MM-DD",
  API_WITH_TIME: "YYYY-MM-DD HH:mm:ss",
} as const;

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/**
 * Status Types
 */
export const STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  LOADING: "loading",
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Toast Configuration
 */
export const TOAST_CONFIG = {
  DURATION: 3000,
  POSITION: "top-right" as const,
} as const;

/**
 * Currency Configuration
 */
export const CURRENCY = {
  CODE: "INR",
  SYMBOL: "₹",
  LOCALE: "en-IN",
} as const;

/**
 * File Upload Configuration
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".pdf"],
} as const;

/**
 * Validation Rules
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PHONE_LENGTH: 10,
} as const;

/**
 * Query Keys for React Query
 */
export const QUERY_KEYS = {
  USER: "user",
  PROFILE: "profile",
  DASHBOARD: "dashboard",
  TRANSACTIONS: "transactions",
  REPORTS: "reports",
} as const;
