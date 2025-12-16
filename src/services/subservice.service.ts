/**
 * Sub-Service Service
 * 
 * Enterprise-level service layer for sub-service management API operations
 * Handles all HTTP requests related to sub-service management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetSubServicesParams,
  IGetSubServicesResponse,
  IApiError,
} from './subservice.types';

/**
 * Base URL for sub-service management endpoints
 */
const SUB_SERVICE_BASE_URL = `${API_URL}/admin/catalog/sub-services`;

/**
 * Get all sub-services with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to sub-services data with pagination
 * @throws Error if API request fails
 */
export const getSubServices = async (
  params: IGetSubServicesParams = {}
): Promise<IGetSubServicesResponse> => {
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
    if (params.service_id && params.service_id.trim() !== '' && params.service_id !== 'all') {
      queryParams.service_id = params.service_id;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams.search = params.search;
    }

    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log('Sub-Service API Request:', {
        url: SUB_SERVICE_BASE_URL,
        params: queryParams,
      });
    }

    const response = await axios.get<IGetSubServicesResponse>(SUB_SERVICE_BASE_URL, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle axios errors with better error messages
    if (axios.isAxiosError(error)) {
      // Log error details for debugging
      console.error('Sub-Service API Error:', {
        url: SUB_SERVICE_BASE_URL,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Extract error message from response
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while fetching sub-services';
      
      if (responseData) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.error) {
          errorMessage = typeof responseData.error === 'string' 
            ? responseData.error 
            : responseData.error.message || JSON.stringify(responseData.error);
        }
      }
      
      // Provide more specific error messages based on status code
      if (error.response?.status === 500) {
        throw new Error(
          errorMessage || 
          'Server error occurred while fetching sub-services. Please try again later or contact support.'
        );
      }
      
      throw new Error(errorMessage);
    }
    
    // Handle unexpected errors
    throw new Error('An unexpected error occurred while fetching sub-services');
  }
};

/**
 * Sub-Service Service Object
 * 
 * Centralized service object for all sub-service-related operations
 * This pattern allows for easy extension and testing
 */
export const subServiceService = {
  getSubServices,
  // Future methods can be added here:
  // getSubServiceById,
  // createSubService,
  // updateSubService,
  // deleteSubService,
  // updateSubServiceStatus,
};

