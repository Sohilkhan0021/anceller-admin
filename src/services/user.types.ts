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
  // Mapped/Original fields from API (Snake case support)
  user_id?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture_url?: string | null;
  is_phone_verified?: boolean;
  is_email_verified?: boolean;
  joined_at?: string;
  last_login_at?: string | null;

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

export interface IUserStats {
  total_orders: number;
  total_addresses: number;
  total_revenue: number;
}

export interface IUserDetails extends IUser {
  user_id: string; // Enforce user_id for details
  is_phone_verified: boolean;
  is_email_verified: boolean;
  joined_at: string;
  last_login_at: string | null;
  stats: IUserStats;
  recent_orders: any[]; // Define structure if available, else any[]
  addresses: any[];     // Define structure if available, else any[]
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
 * Request payload for creating a new user
 */
export interface ICreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status?: string;
  is_verified?: boolean;
  notes?: string;
}

/**
 * API response structure for create user endpoint
 */
export interface ICreateUserResponse {
  status: number | string;
  message: string;
  data: {
    user: IUser;
  };
}

/**
 * API response structure for get user details endpoint
 */
export interface IGetUserDetailsResponse {
  status: number | string;
  message: string;
  data: {
    user: IUserDetails;
  };
}

/**
 * Error response structure
 */
export interface IApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

