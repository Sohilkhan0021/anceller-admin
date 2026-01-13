/**
 * Sub-Service Service
 * 
 * Enterprise-level service layer for sub-service management API operations
 * Handles all HTTP requests related to sub-service management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import { getAuth } from '@/auth/_helpers';
import type {
  IGetSubServicesParams,
  IGetSubServicesResponse,
  IDeleteSubServiceResponse,
  IUpdateSubServiceRequest,
  IUpdateSubServiceResponse,
  IApiError,
} from './subservice.types';

export interface IGetSubServiceByIdResponse {
  status: number;
  message: string;
  data: {
    sub_service_id: string;
    name: string;
    description?: string;
    image_url?: string;
    base_price?: string;
    currency?: string;
    duration_minutes?: number;
    skills_tags?: any;
    max_add_count?: number;
    is_active?: boolean;
    sort_order?: number;
    meta_data?: any;
    service?: {
      service_id: string;
      name: string;
      category?: {
        category_id: string;
        name: string;
      };
    };
    category?: {
      category_id: string;
      name: string;
    };
    bookings?: number;
    revenue?: number;
    created_at?: string;
    updated_at?: string;
  };
}

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
 * Create a new sub-service
 * 
 * @param data - Sub-service data
 * @returns Promise resolving to create response
 * @throws Error if API request fails
 */
export const createSubService = async (
  data: IUpdateSubServiceRequest
): Promise<IUpdateSubServiceResponse> => {
  try {
    const formData = new FormData();
    
    if (data.service_id) formData.append('service_id', data.service_id);
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    // base_price and duration_minutes are required - always send them
    formData.append('base_price', (data.base_price !== undefined ? data.base_price : 0).toString());
    formData.append('currency', 'INR'); // Currency is always INR
    formData.append('duration_minutes', (data.duration_minutes !== undefined ? data.duration_minutes : 1).toString());
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());
    if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString());
    
    // Handle image - prioritize file upload over image_url
    if (data.image instanceof File) {
      formData.append('image', data.image);
      if (import.meta.env.DEV) {
        console.log('Sub-service create: Sending image file', {
          fileName: data.image.name,
          fileSize: data.image.size,
          fileType: data.image.type,
          isFile: data.image instanceof File
        });
      }
    } else if (data.image_url !== undefined) {
      // Always send image_url if provided (even if null/empty to clear it)
      formData.append('image_url', data.image_url || '');
      if (import.meta.env.DEV) {
        console.log('Sub-service create: Sending image_url', { image_url: data.image_url });
      }
    }
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

    // Get auth token using the auth helper
    const auth = getAuth();
    const token = auth?.access_token;

    // CRITICAL: Verify FormData is being sent correctly
    if (import.meta.env.DEV) {
      console.log('Sub-service create - About to send request', {
        url: SUB_SERVICE_BASE_URL,
        isFormData: formData instanceof FormData,
        hasImage: formData.has('image'),
        imageIsFile: formData.get('image') instanceof File,
        contentType: 'Will be set automatically by axios with boundary',
        allKeys: Array.from(formData.keys())
      });
    }

    const response = await axios.post<IUpdateSubServiceResponse>(
      SUB_SERVICE_BASE_URL,
      formData, // This MUST be FormData, not a plain object
      {
        headers: {
          // DO NOT set Content-Type manually - axios will set it automatically with the correct boundary
          // Setting it manually breaks multipart/form-data parsing on the backend
          // Axios will automatically set: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        // Ensure axios doesn't try to serialize FormData as JSON
        transformRequest: [(data) => {
          // If it's FormData, return it as-is (axios will handle it)
          if (data instanceof FormData) {
            return data;
          }
          // Otherwise, let axios handle it (shouldn't happen)
          return data;
        }],
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while creating sub-service';

      if (responseData) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      }

      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while creating sub-service');
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
    if (data.description !== undefined) formData.append('description', data.description || '');
    // base_price and duration_minutes are required - always send them
    formData.append('base_price', (data.base_price !== undefined ? data.base_price : 0).toString());
    formData.append('currency', 'INR'); // Currency is always INR
    formData.append('duration_minutes', (data.duration_minutes !== undefined ? data.duration_minutes : 1).toString());
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());
    if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString());
    
    // Handle image - prioritize file upload over image_url
    if (data.image instanceof File) {
      formData.append('image', data.image);
      if (import.meta.env.DEV) {
        console.log('Sub-service update: Sending image file', { 
          fileName: data.image.name, 
          fileSize: data.image.size,
          fileType: data.image.type,
          isFile: data.image instanceof File,
          fileObject: data.image
        });
      }
    } else if (data.image_url !== undefined) {
      // Always send image_url if provided (even if null/empty to clear it)
      formData.append('image_url', data.image_url || '');
      if (import.meta.env.DEV) {
        console.log('Sub-service update: Sending image_url', { image_url: data.image_url });
      }
    }
    
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

    // Verify FormData contents (for debugging)
    if (import.meta.env.DEV) {
      const formDataEntries: string[] = [];
      for (const key of formData.keys()) {
        const value = formData.get(key);
        if (value instanceof File) {
          formDataEntries.push(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          formDataEntries.push(`${key}: ${typeof value === 'string' ? value.substring(0, 50) : typeof value}`);
        }
      }
      
      console.log('Sub-service update request - FormData prepared', {
        subServiceId,
        hasImage: !!data.image,
        isImageFile: data.image instanceof File,
        hasImageUrl: data.image_url !== undefined,
        imageUrl: data.image_url,
        note: data.image instanceof File 
          ? '✓ File is being sent - backend will process and set image_url in response' 
          : data.image_url !== undefined 
            ? '✓ image_url is being sent (no file upload)' 
            : 'No image or image_url provided',
        formDataKeys: Array.from(formData.keys()),
        formDataEntries: formDataEntries,
        formDataHasImage: formData.has('image'),
        imageFileInFormData: formData.get('image') instanceof File,
        imageFileDetails: formData.get('image') instanceof File ? {
          name: (formData.get('image') as File).name,
          size: (formData.get('image') as File).size,
          type: (formData.get('image') as File).type
        } : null
      });
    }

    // Get auth token using the auth helper
    const auth = getAuth();
    const token = auth?.access_token;
    
    if (import.meta.env.DEV) {
      console.log('Sub-service update - Auth token check', {
        hasAuth: !!auth,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
      });
    }

    // CRITICAL: Verify FormData is being sent correctly
    if (import.meta.env.DEV) {
      console.log('Sub-service update - About to send request', {
        url: `${SUB_SERVICE_BASE_URL}/${subServiceId}`,
        isFormData: formData instanceof FormData,
        hasImage: formData.has('image'),
        imageIsFile: formData.get('image') instanceof File,
        contentType: 'Will be set automatically by axios with boundary',
        allKeys: Array.from(formData.keys())
      });
    }

    const response = await axios.put<IUpdateSubServiceResponse>(
      `${SUB_SERVICE_BASE_URL}/${subServiceId}`,
      formData, // This MUST be FormData, not a plain object
      {
        headers: {
          // DO NOT set Content-Type manually - axios will set it automatically with the correct boundary
          // Setting it manually breaks multipart/form-data parsing on the backend
          // Axios will automatically set: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        // Ensure axios doesn't try to serialize FormData as JSON
        transformRequest: [(data) => {
          // If it's FormData, return it as-is (axios will handle it)
          if (data instanceof FormData) {
            return data;
          }
          // Otherwise, let axios handle it (shouldn't happen)
          return data;
        }],
      }
    );

    if (import.meta.env.DEV) {
      console.log('Sub-service update response - Full response:', JSON.stringify(response.data, null, 2));
      console.log('Sub-service update response - Status:', response.data.status);
      console.log('Sub-service update response - Message:', response.data.message);
      console.log('Sub-service update response - Data object:', response.data.data);
      console.log('Sub-service update response - Image URL in data:', response.data.data?.image_url);
      console.log('Sub-service update response - Data keys:', response.data.data ? Object.keys(response.data.data) : 'no data');
      console.log('Sub-service update response - Has image_url key:', response.data.data ? 'image_url' in response.data.data : false);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Log detailed error information
      if (import.meta.env.DEV) {
        console.error('Sub-service update - Axios error details', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            hasAuthHeader: !!error.config?.headers?.Authorization
          }
        });
      }

      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while updating sub-service';

      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this sub-service.';
      } else if (responseData) {
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
 * Get a single sub-service by ID
 * 
 * @param subServiceId - Public ID of the sub-service
 * @returns Promise resolving to sub-service data
 * @throws Error if API request fails
 */
export const getSubServiceById = async (
  subServiceId: string
): Promise<IGetSubServiceByIdResponse> => {
  try {
    const response = await axios.get<IGetSubServiceByIdResponse>(
      `${SUB_SERVICE_BASE_URL}/${subServiceId}`
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while fetching sub-service';

      if (responseData) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      }

      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while fetching sub-service');
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
  getSubServiceById,
  createSubService,
  deleteSubService,
  updateSubService,
};

