/**
 * User Management Types
 * 
 * Type definitions for user management API responses and data structures
 */

/**
 * User status enum
 */
export type UserStatus = 'active' | 'blocked' | 'inactive';

/**
 * User entity interface
 */
export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  status: UserStatus;
  joinDate: string;
  lastActive: string;
  totalSpent: number;
  // Additional fields that might come from API
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Query parameters for fetching users
 */
export interface IGetUsersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

/**
 * Pagination metadata
 */
export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * API response structure for get users endpoint
 */
export interface IGetUsersResponse {
  success: boolean;
  data: {
    users: IUser[];
    pagination: IPaginationMeta;
  };
  message?: string;
}

/**
 * Error response structure
 */
export interface IApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

