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
  IVerifyKycDocumentRequest,
  IVerifyKycDocumentResponse,
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
): Promise<IApproveProviderResponse['data'] & { message?: string }> => {
  // console.log(' [API] approveProvider called with providerId:', providerId);
  // console.log('[API] Making POST request to:', `${PROVIDER_BASE_URL}/${providerId}/approve`);
  
  try {
    const response = await axios.post<IApproveProviderResponse>(`${PROVIDER_BASE_URL}/${providerId}/approve`);
    
    // console.log('[API] approveProvider response received:', response);
    // console.log('[API] Response status:', response.data.status);
    // console.log('[API] Response message:', response.data.message);
    // console.log('[API] Response data:', response.data.data);
    
    // Check if the response indicates an error (status 0)
    if (response.data.status === 0 || response.data.status !== 1) {
      // console.error('[API] Response indicates error (status !== 1)');
      throw new Error(response.data.message || 'Failed to approve provider');
    }
    
    // Return data with message (data might not exist if status is 0)
    const result = {
      ...(response.data.data || {}),
      message: response.data.message,
    };
    // console.log('[API] approveProvider returning:', result);
    return result;
  } catch (error) {
    // console.error('[API] approveProvider error:', error);
    if (axios.isAxiosError(error)) {
      console.error('[API] Axios error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to approve provider';
      throw new Error(errorMessage);
    }
    // If it's already an Error, re-throw it
    if (error instanceof Error) {
      throw error;
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
): Promise<IRejectProviderResponse['data'] & { message?: string }> => {
  // console.log('[API] rejectProvider called with:', { providerId, reason });
  // console.log('[API] Making POST request to:', `${PROVIDER_BASE_URL}/${providerId}/reject`);
  
  try {
    const response = await axios.post<IRejectProviderResponse>(
      `${PROVIDER_BASE_URL}/${providerId}/reject`,
      { reason }
    );
    
    // console.log('[API] rejectProvider response received:', response);
    // console.log('[API] Response status:', response.data.status);
    // console.log('[API] Response message:', response.data.message);
    // console.log('[API] Response data:', response.data.data);
    
    // Check if the response indicates an error (status 0)
    if (response.data.status === 0) {
      // console.error('[API] Response indicates error (status === 0)');
      throw new Error(response.data.message || 'Failed to reject provider');
    }
    
    // Return data with message
    const result = {
      ...(response.data.data || {}),
      message: response.data.message,
    };
    // console.log('[API] rejectProvider returning:', result);
    return result;
  } catch (error) {
    // console.error('[API] rejectProvider error:', error);
    if (axios.isAxiosError(error)) {
      console.error('[API] Axios error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.message || 'Failed to reject provider';
      throw new Error(errorMessage);
    }
    throw error;
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
): Promise<IUpdateProviderStatusResponse['data'] & { message?: string }> => {
  try {
    const response = await axios.put<IUpdateProviderStatusResponse>(
      `${PROVIDER_BASE_URL}/${providerId}/status`,
      { status }
    );
    
    // Check if the response indicates an error (status 0)
    if (response.data.status === 0) {
      throw new Error(response.data.message || 'Failed to update provider status');
    }
    
    // Return data with message
    return {
      ...(response.data.data || {}),
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Failed to update provider status';
      throw new Error(errorMessage);
    }
    throw error;
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
 * Verify KYC document
 * 
 * @param documentId - Document ID
 * @param data - Verification data (action and optional rejection_reason)
 * @returns Promise resolving to verification result
 * @throws Error if API request fails
 */
export const verifyKycDocument = async (
  documentId: string,
  data: IVerifyKycDocumentRequest
): Promise<IVerifyKycDocumentResponse['data'] & { message?: string }> => {
  try {
    const response = await axios.post<IVerifyKycDocumentResponse>(
      `${API_URL}/providers/kyc/documents/${documentId}/verify`,
      data
    );
    
    // Check if the response indicates an error (status 0)
    if (response.data.status === 0 || response.data.status !== 1) {
      throw new Error(response.data.message || 'Failed to verify KYC document');
    }
    
    // Return data with message
    return {
      ...(response.data.data || {}),
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[API] Axios error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify KYC document';
      throw new Error(errorMessage);
    }
    // If it's already an Error, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while verifying KYC document');
  }
};

/**
 * Update provider details
 * 
 * @param providerId - Provider ID
 * @param data - Update data
 * @returns Promise resolving to update result
 * @throws Error if API request fails
 */
export const updateProvider = async (
  providerId: string,
  data: {
    business_name?: string;
    contact_name?: string;
    contact_email?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    pan_number?: string;
    gstin?: string;
    bank_account_number?: string;
    bank_ifsc?: string;
    bank_account_name?: string;
    category_ids?: string[];
  }
): Promise<any> => {
  try {
    const response = await axios.put(
      `${PROVIDER_BASE_URL}/${providerId}`,
      data
    );
    
    // Check if the response indicates an error (status 0)
    if (response.data.status === 0) {
      throw new Error(response.data.message || 'Failed to update provider');
    }
    
    // Return data with message
    return {
      ...(response.data.data || {}),
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Failed to update provider';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

/**
 * Delete provider (soft delete)
 * 
 * @param providerId - Provider ID
 * @returns Promise resolving to delete result
 * @throws Error if API request fails
 */
export const deleteProvider = async (
  providerId: string
): Promise<{ message?: string }> => {
  try {
    const response = await axios.delete<{ status: number; message: string; data?: any }>(
      `${PROVIDER_BASE_URL}/${providerId}`
    );
    
    // Check if the response indicates an error (status 0)
    if (response.data.status === 0 || response.data.status !== 1) {
      throw new Error(response.data.message || 'Failed to delete provider');
    }
    
    // Return data with message
    return {
      message: response.data.message,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Failed to delete provider';
      throw new Error(errorMessage);
    }
    throw error;
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
  verifyKycDocument,
  updateProvider,
  deleteProvider,
};

