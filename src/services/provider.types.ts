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
  is_deleted?: boolean;
  deleted_at?: string | null;
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
  onboarding_status?: string;
  onboarding?: IProviderOnboarding;
  billing_model?: IProviderBillingModel;
  wallet?: IProviderWalletSummary;
}

export interface IProviderOnboardingChecklistItem {
  required: boolean;
  completed?: boolean;
  amount?: number;
  paid_at?: string | null;
  scheduled_date?: string | null;
  status?: string | null;
  delivered?: boolean;
  completed_at?: string | null;
}

export interface IProviderOnboardingChecklist {
  registration_fee: IProviderOnboardingChecklistItem;
  training: IProviderOnboardingChecklistItem;
  kit: IProviderOnboardingChecklistItem;
  verification: IProviderOnboardingChecklistItem;
}

export interface IProviderOnboarding {
  onboarding_id: string;
  public_id: string;
  onboarding_status: string;
  provider: {
    provider_id: string;
    public_id: string;
    contact_name?: string | null;
    phone_number?: string | null;
  };
  city_coordinator?: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  checklist: IProviderOnboardingChecklist;
  notes?: string | null;
}

export interface IProviderBillingModel {
  billing_model_id: string;
  public_id: string;
  model_type: 'COMMISSION' | 'PACKAGE';
  is_active: boolean;
  minimum_wallet_balance?: number | null;
  current_wallet_balance?: number | null;
  commissionTier?: {
    tier_id: string;
    public_id: string;
    tier_name: string;
    commission_rate: number;
  } | null;
  package?: {
    package_id: string;
    public_id: string;
    package_name: string;
    monthly_fee: number;
    lead_quota: number;
  } | null;
}

export interface IProviderWalletSummary {
  wallet_id: string;
  public_id: string;
  earnings_balance: number;
  commission_balance: number;
  package_balance: number;
  total_balance: number;
  last_updated_at: string;
}

export interface IGetProviderOnboardingResponse {
  status: number;
  message: string;
  data: IProviderOnboarding;
}

export interface IAssignTrainingRequest {
  scheduled_date: string;
  scheduled_time?: string | null;
  location?: string | null;
  trainer_name?: string | null;
  trainer_contact?: string | null;
}

export interface IMarkTrainingCompleteRequest {
  completion_notes?: string | null;
}

export interface IScheduleKitDeliveryRequest {
  scheduled_date: string;
  scheduled_time?: string | null;
  hub_location?: string | null;
  hub_address?: string | null;
}

export interface IMarkKitDeliveredRequest {
  received_by?: string | null;
  delivery_notes?: string | null;
  digital_signature?: string | null;
}

export interface IUpdateOnboardingRequest {
  registration_fee_paid?: boolean;
  training_fee_paid?: boolean;
  kit_fee_paid?: boolean;
  training_assigned?: boolean;
  registration_fee_amount?: number;
  training_fee_amount?: number;
  kit_fee_amount?: number;
}

export interface IAdminOnboardingPayment {
  payment_id: string;
  public_id: string;
  fee_type: 'REGISTRATION' | 'TRAINING' | 'KIT';
  amount: string | number;
  payment_status: 'PENDING' | 'SUCCESS' | 'FAILED';
  payment_gateway?: string | null;
  gateway_transaction_id?: string | null;
  paid_at?: string | null;
  created_at: string;
}

export interface IProviderOnboardingPaymentsResponse {
  payments: IAdminOnboardingPayment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ICreateAdminOnboardingPaymentRequest {
  fee_type: 'REGISTRATION' | 'TRAINING' | 'KIT';
  amount?: number;
  mark_as_paid?: boolean;
  payment_method?: string;
  transaction_reference?: string;
  remarks?: string;
  paid_at?: string;
}

export interface IMarkAdminOnboardingPaymentPaidRequest {
  payment_method?: string;
  transaction_reference?: string;
  remarks?: string;
  paid_at?: string;
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

