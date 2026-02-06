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
      
      // Create error with detailed validation messages
      const errorMessage = apiError.message || 'Failed to create user';
      const errorObj: any = new Error(errorMessage);
      errorObj.response = error.response;
      errorObj.errors = apiError.errors; // Include validation errors
      throw errorObj;
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
 * Create admin user with password and role
 * 
 * @param userData - Admin user data including email, password, and role
 * @returns Promise resolving to created admin user data
 */
export const createAdminUser = async (
  userData: {
    email: string;
    password: string;
    role: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    status?: string;
  }
): Promise<import('./user.types').ICreateUserResponse> => {
  try {
    const response = await axios.post<import('./user.types').ICreateUserResponse>(
      `${USER_BASE_URL}/admin`,
      userData
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while creating admin user',
      };
      throw new Error(apiError.message || 'Failed to create admin user');
    }
    throw new Error('An unexpected error occurred while creating admin user');
  }
};

/**
 * Update user role
 * 
 * @param userId - ID of the user to update
 * @param role - New role to assign
 * @returns Promise resolving to update response
 */
export const updateUserRole = async (
  userId: string,
  role: string
): Promise<import('./user.types').IUpdateUserStatusResponse> => {
  try {
    const response = await axios.put<import('./user.types').IUpdateUserStatusResponse>(
      `${USER_BASE_URL}/${userId}/role`,
      { role }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error updating user role',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while updating user role');
  }
};

/**
 * Update user password
 * 
 * @param userId - ID of the user to update
 * @param password - New password
 * @returns Promise resolving to update response
 */
export const updateUserPassword = async (
  userId: string,
  password: string
): Promise<import('./user.types').IUpdateUserStatusResponse> => {
  try {
    const response = await axios.put<import('./user.types').IUpdateUserStatusResponse>(
      `${USER_BASE_URL}/${userId}/password`,
      { password }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error updating user password',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while updating user password');
  }
};

/**
 * Update user details
 * 
 * @param userId - ID of the user to update
 * @param userData - User data to update
 * @returns Promise resolving to updated user data
 */
export const updateUser = async (
  userId: string,
  userData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    status?: string;
    is_verified?: boolean;
    notes?: string;
  }
): Promise<import('./user.types').ICreateUserResponse | import('./user.types').IUpdateUserStatusResponse> => {
  try {
    // Map frontend status to backend status
    const updateData: any = { ...userData };
    if (updateData.status) {
      const statusMap: Record<string, string> = {
        'active': 'ACTIVE',
        'inactive': 'INACTIVE',
        'suspended': 'SUSPENDED',
        'blocked': 'SUSPENDED',
        'deleted': 'DELETED'
      };
      updateData.status = statusMap[updateData.status.toLowerCase()] || updateData.status.toUpperCase();
    }
    
    // Use status endpoint if only status is being updated
    if (Object.keys(updateData).length === 1 && updateData.status) {
      return await updateUserStatus(userId, updateData.status as 'ACTIVE' | 'SUSPENDED');
    }
    
    // For now, update status separately if provided, then update other fields via multiple endpoints
    // TODO: Backend should provide a general PUT /admin/users/:user_id endpoint
    const response = await axios.put<import('./user.types').ICreateUserResponse>(
      `${USER_BASE_URL}/${userId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // If 404, the endpoint doesn't exist yet - use status endpoint as fallback
      if (error.response?.status === 404) {
        // Fallback: update status if provided
        if (userData.status) {
          const statusMap: Record<string, 'ACTIVE' | 'SUSPENDED'> = {
            'active': 'ACTIVE',
            'blocked': 'SUSPENDED',
            'suspended': 'SUSPENDED'
          };
          const backendStatus = statusMap[userData.status.toLowerCase()] || 'ACTIVE';
          return await updateUserStatus(userId, backendStatus);
        }
      }
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error updating user',
      };
      
      // Create error with detailed validation messages
      const errorMessage = apiError.message || 'Failed to update user';
      const errorObj: any = new Error(errorMessage);
      errorObj.response = error.response;
      errorObj.errors = apiError.errors; // Include validation errors
      throw errorObj;
    }
    throw new Error('An unexpected error occurred while updating user');
  }
};

/**
 * Get user bookings by user ID
 * 
 * @param userId - ID of the user
 * @param params - Query parameters for pagination
 * @returns Promise resolving to bookings data
 */
export const getUserBookings = async (
  userId: string,
  params: { page?: number; limit?: number } = {}
): Promise<any> => {
  try {
    const queryParams: Record<string, string | number> = {
      user_id: userId,
      ...(params.page && { page: params.page }),
      ...(params.limit && { limit: params.limit })
    };

    const response = await axios.get(`${API_URL}/admin/bookings`, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error fetching user bookings',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching user bookings');
  }
};

/**
 * Get user payments by user ID
 * 
 * @param userId - ID of the user
 * @param params - Query parameters for pagination
 * @returns Promise resolving to payments data
 */
export const getUserPayments = async (
  userId: string,
  params: { page?: number; limit?: number } = {}
): Promise<any> => {
  try {
    const queryParams: Record<string, string | number> = {
      user_id: userId,
      ...(params.page && { page: params.page }),
      ...(params.limit && { limit: params.limit })
    };

    const response = await axios.get(`${API_URL}/admin/payments/transactions`, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error fetching user payments',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching user payments');
  }
};

/**
 * Get user support tickets/disputes by user ID
 * 
 * @param userId - ID of the user
 * @param params - Query parameters for pagination
 * @returns Promise resolving to tickets/disputes data
 */
export const getUserSupportTickets = async (
  userId: string,
  params: { page?: number; limit?: number } = {}
): Promise<any> => {
  try {
    const queryParams: Record<string, string | number> = {
      user_id: userId,
      ...(params.page && { page: params.page }),
      ...(params.limit && { limit: params.limit })
    };

    // Use disputes endpoint as support tickets (if no dedicated tickets endpoint exists)
    const response = await axios.get(`${API_URL}/admin/disputes`, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error fetching user support tickets',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching user support tickets');
  }
};

/**
 * Delete user (soft delete)
 * 
 * @param userId - ID of the user to delete
 * @returns Promise resolving to delete response
 */
export const deleteUser = async (
  userId: string
): Promise<import('./user.types').IUpdateUserStatusResponse> => {
  try {
    const response = await axios.delete<import('./user.types').IUpdateUserStatusResponse>(
      `${USER_BASE_URL}/${userId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error deleting user',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while deleting user');
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
  createAdminUser,
  getUserDetails,
  updateUserStatus,
  updateUserRole,
  updateUserPassword,
  updateUser,
  getUserBookings,
  getUserPayments,
  getUserSupportTickets,
  deleteUser,
  // Future methods can be added here:
  // getUserById,
  // blockUser,
  // unblockUser,
};

