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
 * Create a new user
 * 
 * @param userData - User data to create
 * @returns Promise resolving to created user data
 */
export const createUser = async (
  userData: import('./user.types').ICreateUserRequest
): Promise<import('./user.types').ICreateUserResponse> => {
  try {
    const response = await axios.post<import('./user.types').ICreateUserResponse>(
      USER_BASE_URL,
      userData
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while creating user',
      };
      // Propagate the error message from backend
      throw new Error(apiError.message || 'Failed to create user');
    }
    throw new Error('An unexpected error occurred while creating user');
  }
};

/**
 * Get user details by ID
 * 
 * @param userId - ID of the user to fetch
 * @returns Promise resolving to user details
 */
export const getUserDetails = async (
  userId: string
): Promise<import('./user.types').IGetUserDetailsResponse> => {
  try {
    const response = await axios.get<import('./user.types').IGetUserDetailsResponse>(
      `${USER_BASE_URL}/${userId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error fetching user details',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching user details');
  }
};

/**
 * Update user status (Block/Unblock)
 * 
 * @param userId - ID of the user to update
 * @param status - New status to set (ACTIVE or SUSPENDED)
 * @returns Promise resolving to update response
 */
export const updateUserStatus = async (
  userId: string,
  status: 'ACTIVE' | 'SUSPENDED'
): Promise<import('./user.types').IUpdateUserStatusResponse> => {
  try {
    const response = await axios.put<import('./user.types').IUpdateUserStatusResponse>(
      `${USER_BASE_URL}/${userId}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error updating user status',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while updating user status');
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
  createUser,
  getUserDetails,
  updateUserStatus,
  // Future methods can be added here:
  // getUserById,
  // createUser,
  // updateUser,
  // deleteUser,
  // blockUser,
  // unblockUser,
};

