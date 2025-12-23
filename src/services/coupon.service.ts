/**
 * Coupon Service
 * 
 * Enterprise-level service layer for coupon management API operations
 * Handles all HTTP requests related to coupon management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetCouponsParams,
  IGetCouponsResponse,
  ICouponStatsResponse,
  ICouponStats,
  ICoupon,
  IPaginationMeta,
  ICreateCouponRequest,
  ICreateCouponResponse,
  IGetCouponDetailResponse,
  IUpdateCouponRequest,
  IUpdateCouponResponse,
  IDeleteCouponResponse,
  IApiError,
} from './coupon.types';

/**
 * Base URL for coupon management endpoints
 */
const COUPON_BASE_URL = `${API_URL}/admin/coupons`;

/**
 * Helper to handle API errors and extract detailed validation messages
 */
const handleApiError = (error: any, defaultMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data;

    // Check for validation errors array first
    if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      // Return the first validation error message
      const firstError = errorData.errors[0];
      if (firstError.message) {
        throw new Error(firstError.message);
      }
    }

    // Fallback to top-level message or string error
    const message = errorData?.message || errorData?.error || defaultMessage;
    throw new Error(message);
  }
  throw new Error(`An unexpected error occurred: ${defaultMessage}`);
};

/**
 * Get all coupons with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to coupons data with pagination
 * @throws Error if API request fails
 */
export const getCoupons = async (
  params: IGetCouponsParams = {}
): Promise<IGetCouponsResponse> => {
  try {
    // Build query parameters, excluding undefined and empty values
    const queryParams: Record<string, string | number> = {};

    if (params.page !== undefined && params.page > 0) {
      queryParams.page = params.page;
    }
    if (params.limit !== undefined && params.limit > 0) {
      queryParams.limit = params.limit;
    }
    if (params.status && params.status.trim() !== '' && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams.search = params.search;
    }

    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log('Coupon API Request:', {
        url: COUPON_BASE_URL,
        params: queryParams,
      });
    }

    const response = await axios.get<{ status: number; message: string; data: { coupons: ICoupon[]; pagination: IPaginationMeta } }>(COUPON_BASE_URL, {
      params: queryParams,
    });

    // Backend returns { status: 1, message, data: { coupons, pagination } }
    // Transform to match IGetCouponsResponse format
    return {
      success: response.data.status === 1,
      data: {
        coupons: response.data.data.coupons,
        pagination: response.data.data.pagination
      },
      message: response.data.message
    };
  } catch (error) {
    // Handle axios errors with better error messages
    if (axios.isAxiosError(error)) {
      // Log error details for debugging
      const errorData = error.response?.data;
      console.error('Coupon API Error:', {
        url: COUPON_BASE_URL,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
      });
      // Log the full error data separately for better visibility
      if (errorData) {
        console.error('Coupon API Error Data:', JSON.stringify(errorData, null, 2));
        console.error('Coupon API Error Data (raw):', errorData);
      }

      // Extract error message from response
      let errorMessage = 'An error occurred while fetching coupons';

      // Try to extract meaningful error message from response
      if (errorData) {
        // Handle structured error response (status, message, errorCode)
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string'
            ? errorData.error
            : errorData.error.message || JSON.stringify(errorData.error);
        } else if (errorData.errors) {
          errorMessage = Array.isArray(errorData.errors)
            ? errorData.errors.join(', ')
            : JSON.stringify(errorData.errors);
        }

        // For 500 errors, try to extract backend error details
        if (error.response?.status === 500) {
          // Check if it's a Prisma/database error
          if (errorMessage.includes('prisma') ||
            errorMessage.includes('Prisma') ||
            errorMessage.includes('Unknown field') ||
            errorMessage.includes('Invalid')) {
            // Extract a cleaner error message for Prisma errors
            const prismaErrorMatch = errorMessage.match(/Unknown field `(\w+)`/);
            if (prismaErrorMatch) {
              errorMessage = `Backend database error: Field '${prismaErrorMatch[1]}' does not exist in the database schema. Please contact the backend team to fix this issue.`;
            } else {
              errorMessage = `Backend database error: ${errorMessage}. Please contact the backend team to fix this issue.`;
            }
          } else if (errorMessage && errorMessage !== 'An error occurred while fetching coupons') {
            errorMessage = `Backend error: ${errorMessage}. Please try again later or contact support.`;
          }
        }
      }

      // Provide more specific error messages based on status code
      if (error.response?.status === 500) {
        throw new Error(
          errorMessage ||
          'Server error occurred while fetching coupons. Please try again later or contact support.'
        );
      }

      throw new Error(errorMessage);
    }

    // Handle unexpected errors
    throw new Error('An unexpected error occurred while fetching coupons');
  }
};

/**
 * Get coupon statistics
 * 
 * @returns Promise resolving to coupon statistics
 * @throws Error if API request fails
 */
export const getCouponStats = async (): Promise<ICouponStatsResponse['data']> => {
  try {
    const response = await axios.get<{ status: number; message: string; data: ICouponStats }>(`${COUPON_BASE_URL}/stats`);
    // Backend returns { status: 1, message, data: { total_redemptions, revenue_impact, active_coupons } }
    return response.data.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch coupon stats');
  }
};

/**
 * Create a new coupon
 * 
 * @param data - Coupon data to create
 * @returns Promise resolving to creation response
 * @throws Error if API request fails
 */
export const createCoupon = async (
  data: ICreateCouponRequest
): Promise<ICreateCouponResponse> => {
  try {
    const response = await axios.post<ICreateCouponResponse>(COUPON_BASE_URL, data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to create coupon');
  }
};

/**
 * Get coupon details by ID
 * 
 * @param couponId - ID of the coupon to fetch
 * @returns Promise resolving to coupon details
 * @throws Error if API request fails
 */
export const getCouponById = async (
  couponId: string
): Promise<IGetCouponDetailResponse> => {
  try {
    const response = await axios.get<IGetCouponDetailResponse>(`${COUPON_BASE_URL}/${couponId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch coupon details');
  }
};

/**
 * Update an existing coupon
 * 
 * @param couponId - ID of the coupon to update
 * @param data - Updated coupon data
 * @returns Promise resolving to update response
 * @throws Error if API request fails
 */
export const updateCoupon = async (
  couponId: string,
  data: IUpdateCouponRequest
): Promise<IUpdateCouponResponse> => {
  try {
    const response = await axios.put<IUpdateCouponResponse>(`${COUPON_BASE_URL}/${couponId}`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to update coupon');
  }
};

/**
 * Delete a coupon
 * 
 * @param couponId - ID of the coupon to delete
 * @returns Promise resolving to deletion response
 * @throws Error if API request fails
 */
export const deleteCoupon = async (
  couponId: string
): Promise<IDeleteCouponResponse> => {
  try {
    const response = await axios.delete<IDeleteCouponResponse>(`${COUPON_BASE_URL}/${couponId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to delete coupon');
  }
};

/**
 * Coupon Service Object
 * 
 * Centralized service object for all coupon-related operations
 * This pattern allows for easy extension and testing
 */
export const couponService = {
  getCoupons,
  getCouponStats,
  createCoupon,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};

