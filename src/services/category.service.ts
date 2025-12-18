/**
 * Category Service
 * 
 * Enterprise-level service layer for category management API operations
 * Handles all HTTP requests related to category management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetCategoriesParams,
  IGetCategoriesResponse,
  ICreateCategoryRequest,
  ICreateCategoryResponse,
  IUpdateCategoryRequest,
  IUpdateCategoryResponse,
  IDeleteCategoryResponse,
  IApiError,
} from './category.types';

/**
 * Base URL for category management endpoints
 */
const CATEGORY_BASE_URL = `${API_URL}/admin/catalog/categories`;

/**
 * Get all categories with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to categories data with pagination
 * @throws Error if API request fails
 */
export const getCategories = async (
  params: IGetCategoriesParams = {}
): Promise<IGetCategoriesResponse> => {
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
      console.log('Category API Request:', {
        url: CATEGORY_BASE_URL,
        params: queryParams,
      });
    }

    const response = await axios.get<IGetCategoriesResponse>(CATEGORY_BASE_URL, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle axios errors with better error messages
    if (axios.isAxiosError(error)) {
      // Log error details for debugging
      console.error('Category API Error:', {
        url: CATEGORY_BASE_URL,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Extract error message from response
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while fetching categories';

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
          'Server error occurred while fetching categories. Please try again later or contact support.'
        );
      }

      throw new Error(errorMessage);
    }

    // Handle unexpected errors
    throw new Error('An unexpected error occurred while fetching categories');
  }
};

/**
 * Create a new service category
 * 
 * @param data - Category data including potential file uploads
 * @returns Promise resolving to creation response
 */
export const createCategory = async (
  data: ICreateCategoryRequest
): Promise<ICreateCategoryResponse> => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);

    if (data.description) {
      formData.append('description', data.description);
    }

    if (data.image) {
      formData.append('image', data.image);
    }

    if (data.icon) {
      formData.append('icon', data.icon);
    }

    if (data.sort_order !== undefined) {
      formData.append('sort_order', data.sort_order.toString());
    }

    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }

    if (data.meta_data) {
      formData.append('meta_data', data.meta_data);
    }

    const response = await axios.post<ICreateCategoryResponse>(
      CATEGORY_BASE_URL,
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
      let errorMessage = 'An error occurred while creating category';

      if (responseData) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      }

      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while creating category');
  }
};

/**
 * Update an existing service category
 * 
 * @param data - Category data to update including ID
 * @returns Promise resolving to update response
 */
export const updateCategory = async (
  data: IUpdateCategoryRequest
): Promise<IUpdateCategoryResponse> => {
  try {
    const formData = new FormData();

    if (data.name) {
      formData.append('name', data.name);
    }

    if (data.description !== undefined) {
      formData.append('description', data.description || '');
    }

    if (data.image) {
      formData.append('image', data.image);
    }

    if (data.icon) {
      formData.append('icon', data.icon);
    }

    if (data.sort_order !== undefined) {
      formData.append('sort_order', data.sort_order.toString());
    }

    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }

    if (data.meta_data) {
      formData.append('meta_data', data.meta_data);
    }

    const response = await axios.put<IUpdateCategoryResponse>(
      `${CATEGORY_BASE_URL}/${data.id}`,
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
      let errorMessage = 'An error occurred while updating category';

      if (responseData) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      }

      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while updating category');
  }
};

/**
 * Delete an existing service category
 * 
 * @param categoryId - UUID of the category to delete
 * @returns Promise resolving to delete response
 */
export const deleteCategory = async (
  categoryId: string
): Promise<IDeleteCategoryResponse> => {
  try {
    const response = await axios.delete<IDeleteCategoryResponse>(
      `${CATEGORY_BASE_URL}/${categoryId}`
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while deleting category';

      if (responseData) {
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      }

      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while deleting category');
  }
};

/**
 * Category Service Object
 * 
 * Centralized service object for all category-related operations
 * This pattern allows for easy extension and testing
 */
export const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Future methods can be added here:
  // getCategoryById,
  // createCategory,
  // updateCategory,
  // deleteCategory,
  // updateCategoryStatus,
};

