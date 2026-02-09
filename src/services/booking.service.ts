/**
 * Booking Service
 * 
 * Enterprise-level service layer for booking management API operations
 * Handles all HTTP requests related to booking management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import { getErrorMessage, isNetworkError } from '@/utils/networkError';
import type {
  IGetBookingsParams,
  IGetBookingsResponse,
  IGetBookingDetailResponse,
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
    if (params.category_id && params.category_id.trim() !== '' && params.category_id !== 'all') {
      queryParams.category_id = params.category_id;
    }

    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log('Booking API Request:', {
        url: BOOKING_BASE_URL,
        params: queryParams,
      });
    }

    const response = await axios.get<any>(BOOKING_BASE_URL, {
      params: queryParams,
    });

    // Transform backend response to match frontend interface
    // Backend returns: { status: 1, message: "...", data: { bookings: [...], pagination: {...} } }
    const backendData = response.data.data || response.data;
    const bookings = backendData?.bookings || [];
    const pagination = backendData?.pagination || {};
    
    const transformedData: IGetBookingsResponse = {
      success: response.data.status === 1 || response.data.success === true,
      data: {
        bookings: bookings.map((booking: any) => {
          // Combine scheduled_date and scheduled_time for dateTime
          let dateTime = '';
          if (booking.scheduled_date) {
            dateTime = booking.scheduled_date;
            if (booking.scheduled_time) {
              dateTime += ` ${booking.scheduled_time}`;
            } else if (booking.scheduled_time_start) {
              const timeStart = new Date(booking.scheduled_time_start);
              dateTime += ` ${timeStart.toTimeString().slice(0, 5)}`;
            }
          } else if (booking.created_at) {
            dateTime = booking.created_at;
          }
          
          return {
            id: booking.booking_id || booking.id,
            userName: booking.user?.name || booking.userName || 'N/A',
            providerName: booking.provider?.name || booking.providerName || booking.provider?.business_name || 'N/A',
            service: booking.service || booking.service_name || 'N/A',
            dateTime: dateTime,
            status: (booking.status || 'pending').toLowerCase(),
            amount: booking.amount || 0,
            paymentType: booking.payment_method || booking.paymentType || 'N/A',
            paymentStatus: (booking.payment_status || 'pending').toLowerCase() as any,
            address: booking.address || booking.address?.full_address || 'N/A',
            phone: booking.user?.phone || booking.phone || 'N/A',
            userId: booking.user?.user_id || booking.userId,
            providerId: booking.provider?.provider_id || booking.providerId,
            serviceId: booking.service_id,
            createdAt: booking.created_at,
            updatedAt: booking.updated_at,
            notes: booking.notes
          };
        }),
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || 20,
          total: pagination.total || 0,
          totalPages: pagination.totalPages || 0,
          hasNextPage: pagination.hasNextPage ?? (pagination.page < pagination.totalPages),
          hasPreviousPage: pagination.hasPreviousPage ?? (pagination.page > 1)
        }
      },
      message: response.data.message
    };

    return transformedData;
  } catch (error) {
    // Handle network errors first
    if (isNetworkError(error)) {
      throw new Error(getErrorMessage(error, 'No internet connection. Please check your network settings and try again.'));
    }

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
    throw new Error(getErrorMessage(error, 'An unexpected error occurred while fetching bookings'));
  }
};

/**
 * Get booking details by ID
 * 
 * @param bookingId - ID of the booking to fetch
 * @returns Promise resolving to booking detail data
 * @throws Error if API request fails
 */
export const getBookingDetail = async (
  bookingId: string
): Promise<IGetBookingDetailResponse> => {
  try {
    const response = await axios.get<IGetBookingDetailResponse>(
      `${BOOKING_BASE_URL}/${bookingId}`
    );
    return response.data;
  } catch (error) {
    // Handle network errors first
    if (isNetworkError(error)) {
      throw new Error(getErrorMessage(error, 'No internet connection. Please check your network settings and try again.'));
    }

    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching booking details',
      };
      throw new Error(apiError.message);
    }
    throw new Error(getErrorMessage(error, 'An unexpected error occurred while fetching booking details'));
  }
};

/**
 * Cancel booking
 * 
 * @param bookingId - ID of the booking to cancel
 * @param reason - Optional cancellation reason
 * @returns Promise resolving to cancellation result
 * @throws Error if API request fails
 */
export const cancelBooking = async (
  bookingId: string,
  reason?: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const response = await axios.post<{ status: number; message: string; data?: any }>(
      `${BOOKING_BASE_URL}/${bookingId}/cancel`,
      { reason: reason || 'Cancelled by admin' }
    );
    
    if (response.data.status === 0) {
      throw new Error(response.data.message || 'Failed to cancel booking');
    }
    
    return {
      success: true,
      message: response.data.message || 'Booking cancelled successfully',
      data: response.data.data
    };
  } catch (error) {
    // Handle network errors first
    if (isNetworkError(error)) {
      throw new Error(getErrorMessage(error, 'No internet connection. Please check your network settings and try again.'));
    }

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
      throw new Error(errorMessage);
    }
    throw new Error(getErrorMessage(error, 'Failed to cancel booking'));
  }
};

/**
 * Delete booking (soft delete)
 * 
 * @param bookingId - ID of the booking to delete
 * @returns Promise resolving to deletion result
 * @throws Error if API request fails
 */
export const deleteBooking = async (
  bookingId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const response = await axios.delete<{ status: number; message: string; data?: any }>(
      `${BOOKING_BASE_URL}/${bookingId}`
    );
    
    if (response.data.status === 0) {
      throw new Error(response.data.message || 'Failed to delete booking');
    }
    
    return {
      success: true,
      message: response.data.message || 'Booking deleted successfully',
      data: response.data.data
    };
  } catch (error) {
    // Handle network errors first
    if (isNetworkError(error)) {
      throw new Error(getErrorMessage(error, 'No internet connection. Please check your network settings and try again.'));
    }

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Failed to delete booking';
      throw new Error(errorMessage);
    }
    throw new Error(getErrorMessage(error, 'Failed to delete booking'));
  }
};

/**
 * Update booking status
 * 
 * @param bookingId - ID of the booking to update
 * @param status - New status
 * @param reason - Optional reason for status change
 * @returns Promise resolving to update result
 * @throws Error if API request fails
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: string,
  reason?: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const response = await axios.put<{ status: number; message: string; data?: any }>(
      `${BOOKING_BASE_URL}/${bookingId}/status`,
      { status, reason }
    );
    
    if (response.data.status === 0) {
      throw new Error(response.data.message || 'Failed to update booking status');
    }
    
    return {
      success: true,
      message: response.data.message || 'Booking status updated successfully',
      data: response.data.data
    };
  } catch (error) {
    // Handle network errors first
    if (isNetworkError(error)) {
      throw new Error(getErrorMessage(error, 'No internet connection. Please check your network settings and try again.'));
    }

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Failed to update booking status';
      throw new Error(errorMessage);
    }
    throw new Error(getErrorMessage(error, 'Failed to update booking status'));
  }
};

/**
 * Assign provider to booking
 * 
 * @param bookingId - ID of the booking
 * @param providerId - Provider ID (public_id or UUID)
 * @param notes - Optional assignment notes
 * @returns Promise resolving to assignment result
 * @throws Error if API request fails
 */
export const assignProvider = async (
  bookingId: string,
  providerId: string,
  notes?: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const response = await axios.post<{ status: number; message: string; data?: any }>(
      `${BOOKING_BASE_URL}/${bookingId}/assign`,
      { provider_id: providerId, notes: notes || null }
    );
    
    if (response.data.status === 0) {
      throw new Error(response.data.message || 'Failed to assign provider');
    }
    
    return {
      success: true,
      message: response.data.message || 'Provider assigned successfully',
      data: response.data.data
    };
  } catch (error) {
    // Handle network errors first
    if (isNetworkError(error)) {
      throw new Error(getErrorMessage(error, 'No internet connection. Please check your network settings and try again.'));
    }

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Failed to assign provider';
      throw new Error(errorMessage);
    }
    throw new Error(getErrorMessage(error, 'Failed to assign provider'));
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
  getBookingDetail,
  cancelBooking,
  deleteBooking,
  updateBookingStatus,
  assignProvider,
};

