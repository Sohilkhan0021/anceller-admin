/**
 * Service Service
 * 
 * Enterprise-level service layer for service management API operations
 * Handles all HTTP requests related to service management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetServicesParams,
  IGetServicesResponse,
  IUpdateServiceRequest,
  IUpdateServiceResponse,
  IDeleteServiceResponse,
  IApiError,
} from './service.types';

/**
 * Base URL for service management endpoints
 */
const SERVICE_BASE_URL = `${API_URL}/admin/catalog/services`;

/**
 * Get all services with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to services data with pagination
 * @throws Error if API request fails
 */
export const getServices = async (
  params: IGetServicesParams = {}
): Promise<IGetServicesResponse> => {
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
    if (params.category_id && params.category_id.trim() !== '' && params.category_id !== 'all') {
      queryParams.category_id = params.category_id;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams.search = params.search;
    }

    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log('Service API Request:', {
        url: SERVICE_BASE_URL,
        params: queryParams,
      });
    }

    const response = await axios.get<IGetServicesResponse>(SERVICE_BASE_URL, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle axios errors with better error messages
    if (axios.isAxiosError(error)) {
      // Log error details for debugging
      console.error('Service API Error:', {
        url: SERVICE_BASE_URL,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Extract error message from response
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while fetching services';

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
          'Server error occurred while fetching services. Please try again later or contact support.'
        );
      }

      throw new Error(errorMessage);
    }

    // Handle unexpected errors
    throw new Error('An unexpected error occurred while fetching services');
  }
};

/**
 * Update an existing service
 * 
 * @param data - Service data to update including ID
 * @returns Promise resolving to update response
 */
export const updateService = async (
  data: IUpdateServiceRequest
): Promise<IUpdateServiceResponse> => {
  try {
    const formData = new FormData();

    if (data.category_id) {
      formData.append('category_id', data.category_id);
    }

    if (data.name) {
      formData.append('name', data.name);
    }

    if (data.description !== undefined) {
      formData.append('description', data.description || '');
    }

    if (data.image) {
      formData.append('image', data.image);
    }

    if (data.base_price !== undefined) {
      formData.append('base_price', data.base_price.toString());
    }

    if (data.currency) {
      formData.append('currency', data.currency);
    }

    if (data.estimated_duration_minutes !== undefined) {
      formData.append('estimated_duration_minutes', data.estimated_duration_minutes.toString());
    }

    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }

    if (data.sort_order !== undefined) {
      formData.append('sort_order', data.sort_order.toString());
    }

    if (data.meta_data) {
      formData.append('meta_data', data.meta_data);
    }

    // Log request for debugging
    if (import.meta.env.DEV) {
      console.log('Update Service API Request:', {
        url: `${SERVICE_BASE_URL}/${data.id}`,
        data: Object.fromEntries((formData as any).entries()),
      });
    }

    const response = await axios.put<IUpdateServiceResponse>(
      `${SERVICE_BASE_URL}/${data.id}`,
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
      let errorMessage = 'An error occurred while updating service';

      if (responseData) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      }

      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while updating service');
  }
};

/**
 * Delete a service (soft delete)
 * 
 * @param serviceId - ID of the service to delete
 * @returns Promise resolving to delete response
 */
export const deleteService = async (
  serviceId: string
): Promise<IDeleteServiceResponse> => {
  try {
    const response = await axios.delete<IDeleteServiceResponse>(
      `${SERVICE_BASE_URL}/${serviceId}`
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while deleting service';

      if (responseData) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      }

      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while deleting service');
  }
};

/**
 * Service Service Object
 * 
 * Centralized service object for all service-related operations
 * This pattern allows for easy extension and testing
 */
export const serviceService = {
  getServices,
  updateService,
  deleteService,
  // Future methods can be added here:
  // updateServiceStatus,
};
