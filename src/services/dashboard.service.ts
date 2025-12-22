/**
 * Dashboard Service
 * 
 * Service layer for dashboard API operations
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IDashboardStatsResponse,
  IDashboardStats,
  IBookingTrendResponse,
  IRevenueByCategoryResponse,
  IRevenueByCategoryPoint,
  IPendingApprovalsResponse,
  ISettlementQueueResponse,
  IDashboardParams,
} from './dashboard.types';

const DASHBOARD_BASE_URL = `${API_URL}/admin/dashboard`;

/**
 * Get dashboard statistics
 * 
 * @param params - Query parameters (period, start_date, end_date)
 * @returns Promise resolving to dashboard stats
 * @throws Error if API request fails
 */
export const getDashboardStats = async (
  params: IDashboardParams = {}
): Promise<IDashboardStats> => {
  try {
    const queryParams: Record<string, string | number> = {};

    if (params.period) {
      queryParams.period = params.period;
    }
    if (params.start_date) {
      queryParams.start_date = params.start_date;
    }
    if (params.end_date) {
      queryParams.end_date = params.end_date;
    }

    const response = await axios.get<IDashboardStatsResponse>(`${DASHBOARD_BASE_URL}/stats`, {
      params: queryParams,
    });

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
    throw new Error('An unexpected error occurred while fetching dashboard stats');
  }
};

/**
 * Get booking trend data
 * 
 * @param params - Query parameters (days)
 * @returns Promise resolving to booking trend data
 * @throws Error if API request fails
 */
export const getBookingTrend = async (
  params: IDashboardParams = {}
): Promise<{ labels: string[]; bookings: number[]; revenue: number[] }> => {
  try {
    const queryParams: Record<string, string | number> = {};

    if (params.days) {
      queryParams.days = params.days;
    }

    const response = await axios.get<IBookingTrendResponse>(`${DASHBOARD_BASE_URL}/booking-trend`, {
      params: queryParams,
    });

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch booking trend');
    }
    throw new Error('An unexpected error occurred while fetching booking trend');
  }
};

/**
 * Get revenue by category
 * 
 * @param params - Query parameters (start_date, end_date)
 * @returns Promise resolving to revenue by category data
 * @throws Error if API request fails
 */
export const getRevenueByCategory = async (
  params: IDashboardParams = {}
): Promise<IRevenueByCategoryPoint[]> => {
  try {
    const queryParams: Record<string, string | number> = {};

    if (params.start_date) {
      queryParams.start_date = params.start_date;
    }
    if (params.end_date) {
      queryParams.end_date = params.end_date;
    }

    const response = await axios.get<IRevenueByCategoryResponse>(`${DASHBOARD_BASE_URL}/revenue-by-category`, {
      params: queryParams,
    });

    return response.data.data.categories;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch revenue by category');
    }
    throw new Error('An unexpected error occurred while fetching revenue by category');
  }
};

/**
 * Get pending provider approvals count
 * 
 * @returns Promise resolving to pending approvals count
 * @throws Error if API request fails
 */
export const getPendingApprovals = async (): Promise<number> => {
  try {
    const response = await axios.get<IPendingApprovalsResponse>(`${DASHBOARD_BASE_URL}/pending-approvals`);

    return response.data.data.count;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending approvals');
    }
    throw new Error('An unexpected error occurred while fetching pending approvals');
  }
};

/**
 * Get settlement queue count
 * 
 * @returns Promise resolving to settlement queue count
 * @throws Error if API request fails
 */
export const getSettlementQueue = async (): Promise<number> => {
  try {
    const response = await axios.get<ISettlementQueueResponse>(`${DASHBOARD_BASE_URL}/settlement-queue`);

    return response.data.data.count;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch settlement queue');
    }
    throw new Error('An unexpected error occurred while fetching settlement queue');
  }
};

/**
 * Dashboard Service Object
 */
export const dashboardService = {
  getDashboardStats,
  getBookingTrend,
  getRevenueByCategory,
  getPendingApprovals,
  getSettlementQueue,
};

