/**
 * Provider Management Types
 * 
 * Type definitions for provider management API responses and data structures
 */

/**
 * Provider status enum
 */
export type ProviderStatus = 'active' | 'blocked' | 'suspended';

/**
 * KYC status enum
 */
export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'under-review';

/**
 * Provider entity interface
 */
export interface IProvider {
  id: string;
  name: string;
  serviceCategory: string;
  kycStatus: KYCStatus;
  rating: number;
  jobsCompleted: number;
  earnings: number;
  status: ProviderStatus;
  joinDate: string;
  lastActive: string;
  // Additional fields that might come from API
  email?: string;
  phone?: string;
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
 * Query parameters for fetching providers
 */
export interface IGetProvidersParams {
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
 * API response structure for get providers endpoint
 */
export interface IGetProvidersResponse {
  success: boolean;
  data: {
    providers: IProvider[];
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

