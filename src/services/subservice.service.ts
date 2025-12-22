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
  IDeleteSubServiceResponse,
  IUpdateSubServiceRequest,
  IUpdateSubServiceResponse,
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
 * Delete an existing sub-service
 * 
 * @param subServiceId - UUID of the sub-service to delete
 * @returns Promise resolving to delete response
 */
export const deleteSubService = async (
  subServiceId: string
): Promise<IDeleteSubServiceResponse> => {
  try {
    const response = await axios.delete<IDeleteSubServiceResponse>(
      `${SUB_SERVICE_BASE_URL}/${subServiceId}`
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while deleting sub-service';

      if (responseData) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      }

      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while deleting sub-service');
  }
};

/**
 * Update an existing sub-service
 * 
 * @param subServiceId - Public ID of the sub-service to update
 * @param data - Update data
 * @returns Promise resolving to update response
 * @throws Error if API request fails
 */
export const updateSubService = async (
  subServiceId: string,
  data: IUpdateSubServiceRequest
): Promise<IUpdateSubServiceResponse> => {
  try {
    const formData = new FormData();
    
    if (data.service_id) formData.append('service_id', data.service_id);
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.base_price !== undefined) formData.append('base_price', data.base_price.toString());
    if (data.currency) formData.append('currency', data.currency);
    if (data.duration_minutes !== undefined) formData.append('duration_minutes', data.duration_minutes.toString());
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());
    if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString());
    if (data.image) formData.append('image', data.image);
    if (data.image_url) formData.append('image_url', data.image_url);
    if (data.skills_tags) {
      formData.append('skills_tags', Array.isArray(data.skills_tags) 
        ? JSON.stringify(data.skills_tags) 
        : data.skills_tags);
    }
    if (data.meta_data) {
      formData.append('meta_data', typeof data.meta_data === 'string' 
        ? data.meta_data 
        : JSON.stringify(data.meta_data));
    }

    const response = await axios.put<IUpdateSubServiceResponse>(
      `${SUB_SERVICE_BASE_URL}/${subServiceId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while updating sub-service';

      if (responseData) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      }

      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while updating sub-service');
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
  deleteSubService,
  updateSubService,
};

