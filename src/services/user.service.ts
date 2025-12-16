/**
 * User Service
 * 
 * Enterprise-level service layer for user management API operations
 * Handles all HTTP requests related to user management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetUsersParams,
  IGetUsersResponse,
  IApiError,
} from './user.types';

/**
 * Base URL for user management endpoints
 */
const USER_BASE_URL = `${API_URL}/admin/users`;

/**
 * Get all users with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to users data with pagination
 * @throws Error if API request fails
 */
export const getUsers = async (
  params: IGetUsersParams = {}
): Promise<IGetUsersResponse> => {
  try {
    // Build query parameters, excluding undefined values
    const queryParams: Record<string, string | number> = {};
    
    if (params.page !== undefined) {
      queryParams.page = params.page;
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit;
    }
    if (params.status && params.status.trim() !== '') {
      queryParams.status = params.status;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams.search = params.search;
    }

    const response = await axios.get<IGetUsersResponse>(USER_BASE_URL, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching users',
      };
      throw new Error(apiError.message);
    }
    
    // Handle unexpected errors
    throw new Error('An unexpected error occurred while fetching users');
  }
};

/**
 * User Service Object
 * 
 * Centralized service object for all user-related operations
 * This pattern allows for easy extension and testing
 */
export const userService = {
  getUsers,
  // Future methods can be added here:
  // getUserById,
  // createUser,
  // updateUser,
  // deleteUser,
  // blockUser,
  // unblockUser,
};

