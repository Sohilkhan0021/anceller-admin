/**
 * Dashboard Types
 * 
 * Type definitions for dashboard API responses and data structures
 */

/**
 * Dashboard stats response
 */
export interface IDashboardStats {
  bookings: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    growth: number | null;
  };
  revenue: {
    total: number;
    growth: number | null;
  };
  users: {
    active: number;
    growth: number | null;
  };
  providers: {
    active: number;
    growth: number | null;
  };
  commission: {
    earned: number;
    percentage: number;
  };
}

/**
 * Dashboard stats API response
 */
export interface IDashboardStatsResponse {
  status: number;
  message: string;
  data: IDashboardStats;
}

/**
 * Booking trend data point
 */
export interface IBookingTrendPoint {
  date: string;
  bookings: number;
  revenue: number;
}

/**
 * Booking trend response
 */
export interface IBookingTrendResponse {
  status: number;
  message: string;
  data: {
    labels: string[];
    bookings: number[];
    revenue: number[];
  };
}

/**
 * Revenue by category data point
 */
export interface IRevenueByCategoryPoint {
  category_name: string;
  revenue: number;
  percentage: number;
}

/**
 * Revenue by category response
 */
export interface IRevenueByCategoryResponse {
  status: number;
  message: string;
  data: {
    categories: IRevenueByCategoryPoint[];
  };
}

/**
 * Pending approvals response
 */
export interface IPendingApprovalsResponse {
  status: number;
  message: string;
  data: {
    count: number;
  };
}

/**
 * Settlement queue response
 */
export interface ISettlementQueueResponse {
  status: number;
  message: string;
  data: {
    count: number;
  };
}

/**
 * Dashboard query parameters
 */
export interface IDashboardParams {
  period?: 'today' | 'week' | 'month';
  start_date?: string;
  end_date?: string;
  days?: number;
}

