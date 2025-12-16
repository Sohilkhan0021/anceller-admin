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
  IApiError,
} from './coupon.types';

/**
 * Base URL for coupon management endpoints
 */
const COUPON_BASE_URL = `${API_URL}/admin/coupons`;

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

    const response = await axios.get<IGetCouponsResponse>(COUPON_BASE_URL, {
      params: queryParams,
    });

    return response.data;
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
 * Coupon Service Object
 * 
 * Centralized service object for all coupon-related operations
 * This pattern allows for easy extension and testing
 */
export const couponService = {
  getCoupons,
  // Future methods can be added here:
  // getCouponById,
  // createCoupon,
  // updateCoupon,
  // deleteCoupon,
  // updateCouponStatus,
};

