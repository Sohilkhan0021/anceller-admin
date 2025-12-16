/**
 * Booking Service
 * 
 * Enterprise-level service layer for booking management API operations
 * Handles all HTTP requests related to booking management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetBookingsParams,
  IGetBookingsResponse,
  IApiError,
} from './booking.types';

/**
 * Base URL for booking management endpoints
 */
const BOOKING_BASE_URL = `${API_URL}/admin/bookings`;

/**
 * Get all bookings with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to bookings data with pagination
 * @throws Error if API request fails
 */
export const getBookings = async (
  params: IGetBookingsParams = {}
): Promise<IGetBookingsResponse> => {
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
    if (params.payment_status && params.payment_status.trim() !== '' && params.payment_status !== 'all') {
      queryParams.payment_status = params.payment_status;
    }
    // Only include date parameters if they have valid values
    if (params.start_date && params.start_date.trim() !== '') {
      queryParams.start_date = params.start_date;
    }
    if (params.end_date && params.end_date.trim() !== '') {
      queryParams.end_date = params.end_date;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams.search = params.search;
    }

    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log('Booking API Request:', {
        url: BOOKING_BASE_URL,
        params: queryParams,
      });
    }

    const response = await axios.get<IGetBookingsResponse>(BOOKING_BASE_URL, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle axios errors with better error messages
    if (axios.isAxiosError(error)) {
      // Log error details for debugging
      console.error('Booking API Error:', {
        url: BOOKING_BASE_URL,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Extract error message from response
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while fetching bookings';
      
      // Try to extract meaningful error message from response
      if (responseData) {
        // Handle structured error response (status, message, errorCode)
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.error) {
          errorMessage = typeof responseData.error === 'string' 
            ? responseData.error 
            : responseData.error.message || JSON.stringify(responseData.error);
        } else if (responseData.errors) {
          errorMessage = Array.isArray(responseData.errors)
            ? responseData.errors.join(', ')
            : JSON.stringify(responseData.errors);
        }
      }
      
      // Provide more specific error messages based on status code
      if (error.response?.status === 500) {
        // Check if it's a Prisma error (common backend issue)
        if (errorMessage.includes('prisma') || errorMessage.includes('Unknown field')) {
          // Extract a cleaner error message for Prisma errors
          const prismaErrorMatch = errorMessage.match(/Unknown field `(\w+)`/);
          if (prismaErrorMatch) {
            errorMessage = `Backend database error: Field '${prismaErrorMatch[1]}' does not exist in the database schema. Please contact the backend team to fix this issue.`;
          } else {
            errorMessage = 'Database query error on server. The backend needs to be fixed. Please contact the backend team.';
          }
        }
        throw new Error(
          errorMessage || 
          'Server error occurred while fetching bookings. Please try again later or contact support.'
        );
      }
      
      throw new Error(errorMessage);
    }
    
    // Handle unexpected errors
    throw new Error('An unexpected error occurred while fetching bookings');
  }
};

/**
 * Booking Service Object
 * 
 * Centralized service object for all booking-related operations
 * This pattern allows for easy extension and testing
 */
export const bookingService = {
  getBookings,
  // Future methods can be added here:
  // getBookingById,
  // createBooking,
  // updateBooking,
  // deleteBooking,
  // cancelBooking,
  // updateBookingStatus,
};

