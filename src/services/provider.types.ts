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
  provider_id?: string; // Backend field
  name: string;
  business_name?: string; // Backend field
  serviceCategory: string;
  service_categories?: Array<{ category_id: string; name: string }>; // Backend field
  kycStatus: KYCStatus;
  kyc_status?: string; // Backend field
  rating: number;
  jobsCompleted: number;
  jobs?: number; // Backend field
  total_jobs?: number; // Backend field
  earnings?: number | { total_net: number; total_gross: number }; // Can be number or object
  status: ProviderStatus;
  joinDate: string;
  joined_at?: string; // Backend field
  lastActive?: string;
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
  quality_score?: number;
}

/**
 * Query parameters for fetching providers
 */
export interface IGetProvidersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  kyc_status?: string;
  category_id?: string;
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
  status: number;
  message: string;
  data: {
    providers: IProvider[];
    pagination: IPaginationMeta;
  };
}

/**
 * Provider detail response
 */
export interface IGetProviderDetailResponse {
  status: number;
  message: string;
  data: {
    provider: IProviderDetail;
  };
}

/**
 * Provider detail interface (from getProviderById)
 */
export interface IProviderDetail extends IProvider {
  user?: {
    user_id: string;
    name: string;
    email: string;
    phone: string;
  };
  zones?: Array<{
    zone_id: string;
    name: string;
    center: {
      latitude: string;
      longitude: string;
    };
    radius_km: string;
  }>;
  kyc?: {
    status: string;
    documents: Array<{
      document_id: string;
      public_id: string;
      document_type: string;
      status: string;
      uploaded_at: string;
      verified_at?: string;
    }>;
  };
  stats?: {
    total_jobs: number;
    completed_jobs: number;
    cancelled_jobs: number;
    total_earnings: number;
    pending_payout: number;
    rating: number;
    quality_score: number;
    reviews_count: number;
  };
  earnings?: {
    total_net: number;
    total_gross: number;
  };
  recent_jobs?: Array<{
    assignment_id: string;
    order_id: string;
    scheduled_date: string;
    amount: string;
    status: string;
  }>;
  recent_reviews?: Array<{
    review_id: string;
    rating: number;
    comment: string;
    user_name: string;
    order_id: string;
    created_at: string;
  }>;
  is_available?: boolean;
}

/**
 * Approve provider request/response
 */
export interface IApproveProviderResponse {
  status: number;
  message: string;
  data: {
    provider_id: string;
    status: string;
    kyc_status: string;
  };
}

/**
 * Reject provider request
 */
export interface IRejectProviderRequest {
  reason: string;
}

/**
 * Reject provider response
 */
export interface IRejectProviderResponse {
  status: number;
  message: string;
  data: {
    provider_id: string;
    status: string;
    kyc_status: string;
    kyc_rejected_at: string;
    rejection_reason: string;
  };
}

/**
 * Update provider status request
 */
export interface IUpdateProviderStatusRequest {
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

/**
 * Update provider status response
 */
export interface IUpdateProviderStatusResponse {
  status: number;
  message: string;
  data: {
    provider_id: string;
    status: string;
  };
}

/**
 * Provider stats interface
 */
export interface IProviderStats {
  total_providers: number;
  pending_approvals: number;
  top_rated_providers: number;
  new_this_month: number;
}

/**
 * Provider stats response
 */
export interface IProviderStatsResponse {
  status: number;
  message: string;
  data: IProviderStats;
}

/**
 * Create provider request
 */
export interface ICreateProviderRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  phone_country_code?: string;
  password?: string;
  business_name?: string;
  businessName?: string;
  category_ids?: string[];
  serviceCategory?: string; // Legacy field
  pan_number?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  bank_account_number?: string;
  bankAccount?: string;
  bank_ifsc?: string;
  ifscCode?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  kyc_status?: 'pending' | 'approved' | 'rejected' | 'under-review';
  status?: 'active' | 'suspended' | 'inactive';
  isVerified?: boolean;
  notes?: string;
  service_radius_km?: number;
  max_concurrent_jobs?: number;
}

/**
 * Create provider response
 */
export interface ICreateProviderResponse {
  status: number;
  message: string;
  data: {
    provider_id: string;
    user_id: string;
    business_name: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    kyc_status: string;
    service_categories: Array<{
      category_id: string;
      name: string;
    }>;
  };
}

/**
 * Verify KYC document request
 */
export interface IVerifyKycDocumentRequest {
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

/**
 * Verify KYC document response
 */
export interface IVerifyKycDocumentResponse {
  status: number;
  message: string;
  data: {
    document_id: string;
    status: string;
    verified_at?: string;
  };
}

/**
 * Error response structure
 */
export interface IApiError {
  status?: number;
  message: string;
  errors?: Record<string, string[]>;
}

