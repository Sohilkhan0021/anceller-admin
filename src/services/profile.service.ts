/**
 * Profile Service
 * 
 * Enterprise-level service layer for admin profile API operations
 * Handles all HTTP requests related to admin profile management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetAdminProfileResponse,
  IUpdateAdminProfileRequest,
  IUpdateAdminProfileResponse,
  IApiError,
} from './profile.types';

/**
 * Base URL for admin profile endpoints
 */
const PROFILE_BASE_URL = `${API_URL}/admin/profile`;

/**
 * Get current admin user profile
 * 
 * @returns Promise resolving to admin profile data
 * @throws Error if API request fails
 */
export const getAdminProfile = async (): Promise<IGetAdminProfileResponse> => {
  try {
    const response = await axios.get<IGetAdminProfileResponse>(PROFILE_BASE_URL);

    return response.data;
  } catch (error) {
    // Handle axios errors with better error messages
    if (axios.isAxiosError(error)) {
      // Log error details for debugging
      console.error('Profile API Error:', {
        url: PROFILE_BASE_URL,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Extract error message from response
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while fetching profile';

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
          'Server error occurred while fetching profile. Please try again later or contact support.'
        );
      }

      throw new Error(errorMessage);
    }

    // Handle unexpected errors
    throw new Error('An unexpected error occurred while fetching profile');
  }
};

/**
 * Update admin user profile
 * 
 * @param data - Profile update data (can include File for image upload)
 * @returns Promise resolving to updated profile data
 * @throws Error if API request fails
 */
export const updateAdminProfile = async (
  data: IUpdateAdminProfileRequest & { profile_picture?: File }
): Promise<IUpdateAdminProfileResponse> => {
  try {
    // Check if we have a file to upload
    const formData = new FormData();
    
    // Add file if present
    if (data.profile_picture) {
      formData.append('profile_picture', data.profile_picture);
    }
    
    // Add other fields
    if (data.first_name !== undefined) {
      formData.append('first_name', data.first_name);
    }
    if (data.last_name !== undefined) {
      formData.append('last_name', data.last_name);
    }
    if (data.phone_number !== undefined) {
      formData.append('phone_number', data.phone_number);
    }
    if (data.phone_country_code !== undefined) {
      formData.append('phone_country_code', data.phone_country_code);
    }
    if (data.profile_picture_url !== undefined && !data.profile_picture) {
      // Only send URL if no file is being uploaded
      formData.append('profile_picture_url', data.profile_picture_url);
    }

    const response = await axios.put<IUpdateAdminProfileResponse>(
      PROFILE_BASE_URL,
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
      console.error('Update Profile API Error:', {
        url: PROFILE_BASE_URL,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while updating profile';
      let validationErrors: Array<{ field: string; message: string }> = [];

      if (responseData) {
        // Check for validation errors array
        if (responseData.errors && Array.isArray(responseData.errors)) {
          validationErrors = responseData.errors;
          errorMessage = responseData.message || 'Validation failed';
        } else if (responseData.errors && typeof responseData.errors === 'object') {
          // Handle object format: { field1: ['message1'], field2: ['message2'] }
          validationErrors = Object.entries(responseData.errors).map(([field, messages]: [string, any]) => ({
            field,
            message: Array.isArray(messages) ? messages.join(', ') : String(messages)
          }));
          errorMessage = responseData.message || 'Validation failed';
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.error) {
          errorMessage = typeof responseData.error === 'string'
            ? responseData.error
            : responseData.error.message || JSON.stringify(responseData.error);
        }
      }

      // Create error with validation details
      const errorWithDetails = new Error(errorMessage) as any;
      errorWithDetails.validationErrors = validationErrors;
      errorWithDetails.response = error.response; // Preserve response for additional error handling
      throw errorWithDetails;
    }

    throw new Error('An unexpected error occurred while updating profile');
  }
};

/**
 * Profile Service Object
 * 
 * Centralized service object for all profile-related operations
 */
export const profileService = {
  getAdminProfile,
  updateAdminProfile,
};

