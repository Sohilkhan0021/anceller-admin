/**
 * Add-On Service
 * 
 * Enterprise-level service layer for add-on management API operations
 * Handles all HTTP requests related to add-on management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetAddOnsParams,
  IGetAddOnsResponse,
  IUpdateAddOnRequest,
  IUpdateAddOnResponse,
  IApiError,
} from './addon.types';

/**
 * Base URL for add-on management endpoints
 */
const ADDON_BASE_URL = `${API_URL}/admin/catalog/add-ons`;

/**
 * Get all add-ons with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to add-ons data with pagination
 * @throws Error if API request fails
 */
export const getAddOns = async (
  params: IGetAddOnsParams = {}
): Promise<IGetAddOnsResponse> => {
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
      console.log('Add-On API Request:', {
        url: ADDON_BASE_URL,
        params: queryParams,
      });
    }

    const response = await axios.get<IGetAddOnsResponse>(ADDON_BASE_URL, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle axios errors with better error messages
    if (axios.isAxiosError(error)) {
      // Log error details for debugging
      const errorData = error.response?.data;
      console.error('Add-On API Error:', {
        url: ADDON_BASE_URL,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
      });
      // Log the full error data separately for better visibility
      if (errorData) {
        console.error('Add-On API Error Data:', JSON.stringify(errorData, null, 2));
        console.error('Add-On API Error Data (raw):', errorData);
      }

      // Extract error message from response
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while fetching add-ons';
      
      // Try to extract meaningful error message from response
      if (responseData) {
        // Handle structured error response (status, message, errorCode)
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.error) {
          errorMessage = typeof responseData.error === 'string' 
            ? responseData.error 
            : responseData.error.message || JSON.stringify(responseData.error);
        } else if (responseData.errors) {
          errorMessage = Array.isArray(responseData.errors)
            ? responseData.errors.join(', ')
            : JSON.stringify(responseData.errors);
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
          } else if (errorMessage && errorMessage !== 'An error occurred while fetching add-ons') {
            errorMessage = `Backend error: ${errorMessage}. Please try again later or contact support.`;
          }
        }
      }
      
      // Provide more specific error messages based on status code
      if (error.response?.status === 500) {
        throw new Error(
          errorMessage || 
          'Server error occurred while fetching add-ons. Please try again later or contact support.'
        );
      }
      
      throw new Error(errorMessage);
    }
    
    // Handle unexpected errors
    throw new Error('An unexpected error occurred while fetching add-ons');
  }
};

/**
 * Update an existing add-on
 * 
 * @param addOnId - Public ID of the add-on to update
 * @param data - Update data
 * @returns Promise resolving to update response
 * @throws Error if API request fails
 */
export const updateAddOn = async (
  addOnId: string,
  data: IUpdateAddOnRequest
): Promise<IUpdateAddOnResponse> => {
  try {
    const response = await axios.put<IUpdateAddOnResponse>(
      `${ADDON_BASE_URL}/${addOnId}`,
      data
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while updating add-on';

      if (responseData) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      }

      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while updating add-on');
  }
};

/**
 * Add-On Service Object
 * 
 * Centralized service object for all add-on-related operations
 * This pattern allows for easy extension and testing
 */
export const addonService = {
  getAddOns,
  updateAddOn,
};

