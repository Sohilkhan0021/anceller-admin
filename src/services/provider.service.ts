/**
 * Provider Service
 * 
 * Enterprise-level service layer for provider management API operations
 * Handles all HTTP requests related to provider management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetProvidersParams,
  IGetProvidersResponse,
  IApiError,
} from './provider.types';

/**
 * Base URL for provider management endpoints
 */
const PROVIDER_BASE_URL = `${API_URL}/admin/providers`;

/**
 * Get all providers with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to providers data with pagination
 * @throws Error if API request fails
 */
export const getProviders = async (
  params: IGetProvidersParams = {}
): Promise<IGetProvidersResponse> => {
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

    const response = await axios.get<IGetProvidersResponse>(PROVIDER_BASE_URL, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching providers',
      };
      throw new Error(apiError.message);
    }
    
    // Handle unexpected errors
    throw new Error('An unexpected error occurred while fetching providers');
  }
};

/**
 * Provider Service Object
 * 
 * Centralized service object for all provider-related operations
 * This pattern allows for easy extension and testing
 */
export const providerService = {
  getProviders,
  // Future methods can be added here:
  // getProviderById,
  // createProvider,
  // updateProvider,
  // deleteProvider,
  // blockProvider,
  // unblockProvider,
  // approveKYC,
  // rejectKYC,
};

