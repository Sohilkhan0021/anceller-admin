/**
 * Add-On Management Types
 * 
 * Type definitions for add-on management API responses and data structures
 */

/**
 * Add-on status enum
 */
export type AddOnStatus = 'active' | 'inactive';

/**
 * Add-on entity interface
 */
export interface IAddOn {
  id: string;
  name: string;
  price?: number;
  price_per_unit?: number; // Snake case version from API
  isPerUnit?: boolean;
  is_per_unit?: boolean; // Snake case version from API
  status: AddOnStatus;
  appliesTo?: string[]; // Service IDs
  applies_to?: string[]; // Snake case version from API
  service_ids?: string[]; // Alternative field name
  // Additional fields that might come from API
  public_id?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

/**
 * Query parameters for fetching add-ons
 */
export interface IGetAddOnsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
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
 * API response structure for get add-ons endpoint
 */
export interface IGetAddOnsResponse {
  success: boolean;
  data: {
    addOns?: IAddOn[]; // CamelCase version
    add_ons?: IAddOn[]; // Snake case version from API
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

