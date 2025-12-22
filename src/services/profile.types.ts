/**
 * Profile Management Types
 * 
 * Type definitions for admin profile API responses and data structures
 */

/**
 * Admin profile entity interface
 */
export interface IAdminProfile {
  user_id: string;
  public_id?: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string | null;
  phone: string | null;
  phone_number?: string;
  phone_country_code?: string;
  profile_picture_url: string | null;
  status: string;
  role: string;
  is_phone_verified?: boolean;
  is_email_verified?: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * API response structure for get admin profile endpoint
 */
export interface IGetAdminProfileResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    user: IAdminProfile;
  };
}

/**
 * Request structure for updating admin profile
 */
export interface IUpdateAdminProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  phone_country_code?: string;
  profile_picture_url?: string;
}

/**
 * Response structure for profile update
 */
export interface IUpdateAdminProfileResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    user: IAdminProfile;
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

