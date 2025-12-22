/**
 * Payout Service
 * 
 * Enterprise-level service layer for payout management API operations
 * Handles all HTTP requests related to payout management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetPayoutsParams,
  IGetPayoutsResponse,
  IGetPayoutStatsResponse,
  IApiError,
} from './payout.types';

/**
 * Base URL for payout management endpoints
 */
const PAYOUT_BASE_URL = `${API_URL}/admin/payments/payouts`;

/**
 * Get provider payouts with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to payouts data with pagination
 * @throws Error if API request fails
 */
export const getPayouts = async (
  params: IGetPayoutsParams = {}
): Promise<IGetPayoutsResponse['data']> => {
  try {
    const queryParams: Record<string, string | number> = {};
    
    if (params.page !== undefined) {
      queryParams.page = params.page;
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit;
    }
    if (params.status && params.status.trim() !== '' && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams.search = params.search;
    }

    const response = await axios.get<{ status: number; message: string; data: IGetPayoutsResponse['data'] }>(
      PAYOUT_BASE_URL,
      { params: queryParams }
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching payouts',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching payouts');
  }
};

/**
 * Get payout statistics
 * 
 * @returns Promise resolving to payout statistics
 * @throws Error if API request fails
 */
export const getPayoutStats = async (): Promise<IGetPayoutStatsResponse['data']> => {
  try {
    const response = await axios.get<{ status: number; message: string; data: IGetPayoutStatsResponse['data'] }>(
      `${PAYOUT_BASE_URL}/stats`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching payout stats',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching payout stats');
  }
};

/**
 * Payout Service Object
 * 
 * Centralized service object for all payout-related operations
 */
export const payoutService = {
  getPayouts,
  getPayoutStats,
};

