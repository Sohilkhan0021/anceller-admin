/**
 * Dashboard Hooks
 * 
 * Custom React hooks for dashboard operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult } from 'react-query';
import { dashboardService } from './dashboard.service';
import type {
  IDashboardStats,
  IRevenueByCategoryPoint,
  IDashboardParams,
} from './dashboard.types';

/**
 * Hook to fetch dashboard statistics
 */
export const useDashboardStats = (
  params: IDashboardParams = {},
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
): UseQueryResult<IDashboardStats, Error> => {
  return useQuery(
    ['dashboard-stats', params.period, params.start_date, params.end_date],
    () => dashboardService.getDashboardStats(params),
    {
      enabled: options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
      staleTime: options?.staleTime ?? 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
    }
  );
};

/**
 * Hook to fetch booking trend
 */
export const useBookingTrend = (
  params: IDashboardParams = {},
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
): UseQueryResult<{ labels: string[]; bookings: number[]; revenue: number[] }, Error> => {
  return useQuery(
    ['booking-trend', params.days],
    () => dashboardService.getBookingTrend(params),
    {
      enabled: options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
      staleTime: options?.staleTime ?? 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
    }
  );
};

/**
 * Hook to fetch revenue by category
 */
export const useRevenueByCategory = (
  params: IDashboardParams = {},
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
): UseQueryResult<IRevenueByCategoryPoint[], Error> => {
  return useQuery(
    ['revenue-by-category', params.start_date, params.end_date],
    () => dashboardService.getRevenueByCategory(params),
    {
      enabled: options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
      staleTime: options?.staleTime ?? 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
    }
  );
};

/**
 * Hook to fetch pending approvals count
 */
export const usePendingApprovals = (
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
): UseQueryResult<number, Error> => {
  return useQuery(
    ['pending-approvals'],
    () => dashboardService.getPendingApprovals(),
    {
      enabled: options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
      staleTime: options?.staleTime ?? 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
    }
  );
};

/**
 * Hook to fetch settlement queue count
 */
export const useSettlementQueue = (
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
): UseQueryResult<number, Error> => {
  return useQuery(
    ['settlement-queue'],
    () => dashboardService.getSettlementQueue(),
    {
      enabled: options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
      staleTime: options?.staleTime ?? 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
    }
  );
};

