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
  IGetProviderDetailResponse,
  IApproveProviderResponse,
  IRejectProviderRequest,
  IRejectProviderResponse,
  IUpdateProviderStatusRequest,
  IUpdateProviderStatusResponse,
  IProviderStatsResponse,
  ICreateProviderRequest,
  ICreateProviderResponse,
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
): Promise<IGetProvidersResponse['data']> => {
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
    if (params.kyc_status && params.kyc_status.trim() !== '') {
      queryParams.kyc_status = params.kyc_status;
    }
    if (params.category_id && params.category_id.trim() !== '' && params.category_id !== 'all') {
      queryParams.category_id = params.category_id;
    }

    const response = await axios.get<{ status: number; message: string; data: { providers: any[]; pagination: any } }>(PROVIDER_BASE_URL, {
      params: queryParams,
    });

    // Backend returns { status: 1, message, data: { providers, pagination } }
    return response.data.data;
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        message: error.message || 'An error occurred while fetching providers',
      };
      throw new Error(apiError.message);
    }
    
    // Handle unexpected errors
    throw new Error('An unexpected error occurred while fetching providers');
  }
};

/**
 * Get provider by ID
 * 
 * @param providerId - Provider ID (public_id or UUID)
 * @returns Promise resolving to provider details
 * @throws Error if API request fails
 */
export const getProviderById = async (
  providerId: string
): Promise<IGetProviderDetailResponse['data']> => {
  try {
    const response = await axios.get<{ status: number; message: string; data: { provider: any } }>(`${PROVIDER_BASE_URL}/${providerId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch provider details');
    }
    throw new Error('An unexpected error occurred while fetching provider details');
  }
};

/**
 * Approve provider (KYC approval)
 * 
 * @param providerId - Provider ID
 * @returns Promise resolving to approval result
 * @throws Error if API request fails
 */
export const approveProvider = async (
  providerId: string
): Promise<IApproveProviderResponse['data']> => {
  try {
    const response = await axios.post<{ status: number; message: string; data: any }>(`${PROVIDER_BASE_URL}/${providerId}/approve`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to approve provider');
    }
    throw new Error('An unexpected error occurred while approving provider');
  }
};

/**
 * Reject provider (KYC rejection)
 * 
 * @param providerId - Provider ID
 * @param reason - Rejection reason
 * @returns Promise resolving to rejection result
 * @throws Error if API request fails
 */
export const rejectProvider = async (
  providerId: string,
  reason: string
): Promise<IRejectProviderResponse['data']> => {
  try {
    const response = await axios.post<{ status: number; message: string; data: any }>(
      `${PROVIDER_BASE_URL}/${providerId}/reject`,
      { reason }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to reject provider');
    }
    throw new Error('An unexpected error occurred while rejecting provider');
  }
};

/**
 * Update provider status
 * 
 * @param providerId - Provider ID
 * @param status - New status (ACTIVE, SUSPENDED, DELETED)
 * @returns Promise resolving to update result
 * @throws Error if API request fails
 */
export const updateProviderStatus = async (
  providerId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
): Promise<IUpdateProviderStatusResponse['data']> => {
  try {
    const response = await axios.put<{ status: number; message: string; data: any }>(
      `${PROVIDER_BASE_URL}/${providerId}/status`,
      { status }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update provider status');
    }
    throw new Error('An unexpected error occurred while updating provider status');
  }
};

/**
 * Get provider statistics
 * Calculates stats from providers data
 * 
 * @param providers - List of providers
 * @returns Provider statistics
 */
export const getProviderStats = (providers: any[]): IProviderStatsResponse['data'] => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalProviders = providers.length;
  const pendingApprovals = providers.filter(p => 
    (p.kyc_status || p.kycStatus) === 'PENDING' || 
    (p.kyc_status || p.kycStatus) === 'pending'
  ).length;
  const topRatedProviders = providers.filter(p => 
    (p.rating || 0) >= 4.5
  ).length;
  const newThisMonth = providers.filter(p => {
    const joinedAt = p.joined_at || p.joinDate || p.createdAt;
    if (!joinedAt) return false;
    const joinDate = new Date(joinedAt);
    return joinDate >= startOfMonth;
  }).length;

  return {
    total_providers: totalProviders,
    pending_approvals: pendingApprovals,
    top_rated_providers: topRatedProviders,
    new_this_month: newThisMonth,
  };
};

/**
 * Create provider
 * 
 * @param data - Provider creation data
 * @returns Promise resolving to created provider
 * @throws Error if API request fails
 */
export const createProvider = async (
  data: ICreateProviderRequest
): Promise<ICreateProviderResponse['data']> => {
  try {
    // Transform form data to API format
    const apiData: any = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      phone_country_code: data.phone_country_code || '+91',
      password: data.password,
      business_name: data.business_name || data.businessName,
      pan_number: data.pan_number || data.panNumber,
      bank_account_number: data.bank_account_number || data.bankAccount,
      bank_ifsc: data.bank_ifsc || data.ifscCode,
      kyc_status: data.kyc_status || 'pending',
      status: data.status || 'active',
    };

    // Handle category_ids - if serviceCategory is provided, try to find category
    if (data.category_ids && data.category_ids.length > 0) {
      apiData.category_ids = data.category_ids;
    } else if (data.serviceCategory) {
      // If only serviceCategory is provided, we'll need to find the category ID
      // For now, we'll require category_ids to be provided
      // This could be enhanced to search by category name
      apiData.category_ids = [data.serviceCategory];
    }

    const response = await axios.post<{ status: number; message: string; data: any }>(
      PROVIDER_BASE_URL,
      apiData
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create provider');
    }
    throw new Error('An unexpected error occurred while creating provider');
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
  getProviderById,
  approveProvider,
  rejectProvider,
  updateProviderStatus,
  getProviderStats,
  createProvider,
};

