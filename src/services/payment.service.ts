/**
 * Payment Service
 * 
 * Enterprise-level service layer for payment management API operations
 * Handles all HTTP requests related to payment management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetPaymentTransactionsParams,
  IGetPaymentTransactionsResponse,
  IGetPaymentDetailResponse,
  IGetRevenueStatsResponse,
  IGetRevenueByGatewayResponse,
  IApiError,
} from './payment.types';

/**
 * Base URL for payment management endpoints
 */
const PAYMENT_BASE_URL = `${API_URL}/admin/payments`;

/**
 * Get payment transactions with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to payment transactions data with pagination
 * @throws Error if API request fails
 */
export const getPaymentTransactions = async (
  params: IGetPaymentTransactionsParams = {}
): Promise<IGetPaymentTransactionsResponse['data']> => {
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
    if (params.gateway && params.gateway.trim() !== '' && params.gateway !== 'all') {
      queryParams.gateway = params.gateway;
    }
    if (params.start_date && params.start_date.trim() !== '') {
      queryParams.start_date = params.start_date;
    }
    if (params.end_date && params.end_date.trim() !== '') {
      queryParams.end_date = params.end_date;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams.search = params.search;
    }

    const response = await axios.get<{ status: number; message: string; data: IGetPaymentTransactionsResponse['data'] }>(
      `${PAYMENT_BASE_URL}/transactions`,
      { params: queryParams }
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching payment transactions',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching payment transactions');
  }
};

/**
 * Get payment transaction details by ID
 * 
 * @param transactionId - ID of the transaction to fetch
 * @returns Promise resolving to payment detail data
 * @throws Error if API request fails
 */
export const getPaymentDetail = async (
  transactionId: string
): Promise<IGetPaymentDetailResponse['data']> => {
  try {
    const response = await axios.get<{ status: number; message: string; data: IGetPaymentDetailResponse['data'] }>(
      `${PAYMENT_BASE_URL}/transactions/${transactionId}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching payment details',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching payment details');
  }
};

/**
 * Get revenue statistics
 * 
 * @param startDate - Start date for revenue calculation
 * @param endDate - End date for revenue calculation
 * @returns Promise resolving to revenue statistics
 * @throws Error if API request fails
 */
export const getRevenueStats = async (
  startDate?: string,
  endDate?: string
): Promise<IGetRevenueStatsResponse['data']> => {
  try {
    const queryParams: Record<string, string> = {};
    if (startDate) queryParams.start_date = startDate;
    if (endDate) queryParams.end_date = endDate;

    const response = await axios.get<{ status: number; message: string; data: IGetRevenueStatsResponse['data'] }>(
      `${PAYMENT_BASE_URL}/revenue-stats`,
      { params: queryParams }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching revenue stats',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching revenue stats');
  }
};

/**
 * Get revenue breakdown by payment gateway
 * 
 * @param startDate - Start date for revenue calculation
 * @param endDate - End date for revenue calculation
 * @returns Promise resolving to revenue by gateway data
 * @throws Error if API request fails
 */
export const getRevenueByGateway = async (
  startDate?: string,
  endDate?: string
): Promise<IGetRevenueByGatewayResponse['data']> => {
  try {
    const queryParams: Record<string, string> = {};
    if (startDate) queryParams.start_date = startDate;
    if (endDate) queryParams.end_date = endDate;

    const response = await axios.get<{ status: number; message: string; data: IGetRevenueByGatewayResponse['data'] }>(
      `${PAYMENT_BASE_URL}/revenue-by-gateway`,
      { params: queryParams }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching revenue by gateway',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching revenue by gateway');
  }
};

/**
 * Export payment data
 * 
 * @param filters - Filter parameters for export
 * @returns Promise resolving to exported payment data
 * @throws Error if API request fails
 */
export const exportPaymentData = async (
  filters: IGetPaymentTransactionsParams = {}
): Promise<any[]> => {
  try {
    const queryParams: Record<string, string | number> = {};
    if (filters.status) queryParams.status = filters.status;
    if (filters.start_date) queryParams.start_date = filters.start_date;
    if (filters.end_date) queryParams.end_date = filters.end_date;

    const response = await axios.get<{ status: number; message: string; data: any[] }>(
      `${PAYMENT_BASE_URL}/export`,
      { params: queryParams }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while exporting payment data',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while exporting payment data');
  }
};

/**
 * Payment Service Object
 * 
 * Centralized service object for all payment-related operations
 */
export const paymentService = {
  getPaymentTransactions,
  getPaymentDetail,
  getRevenueStats,
  getRevenueByGateway,
  exportPaymentData,
};

