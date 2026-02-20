/**
 * Service Management Types
 * 
 * Type definitions for service management API responses and data structures
 */

/**
 * Service status enum
 */
export type ServiceStatus = 'active' | 'inactive';

/**
 * Service entity interface
 */
export interface IService {
  id: string;
  name: string;
  subServiceId?: string;
  sub_service_id?: string; // Snake case version from API
  subServiceName?: string;
  sub_service_name?: string; // Snake case version from API
  category?: string | { category_id?: string; name?: string }; // Can be string or object from API
  category_id?: string; // Category ID from API
  categoryId?: string; // Normalized camelCase
  categoryName?: string; // Extracted category name
  description?: string;
  basePrice?: number;
  base_price?: number; // Snake case version from API
  duration?: number; // Duration in minutes
  duration_minutes?: number; // Snake case version from API
  status: ServiceStatus;
  is_active?: boolean; // Boolean active status from API
  popularity?: number;
  bookings?: number;
  revenue?: number;
  image?: string;
  image_url?: string; // Snake case version from API
  skills?: string;
  skills_tags?: string; // Snake case version from API
  displayOrder?: number;
  display_order?: number; // Snake case version from API
  // Additional fields that might come from API
  public_id?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

/**
 * Query parameters for fetching services
 */
export interface IGetServicesParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
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
 * API response structure for get services endpoint
 */
export interface IGetServicesResponse {
  success: boolean;
  data: {
    services: IService[];
    pagination: IPaginationMeta;
  };
  message?: string;
}

/**
 * Request structure for creating a service
 */
export interface ICreateServiceRequest {
  category_id?: string; // Category ID (optional - backend will use default if not provided)
  name: string;
  description?: string;
  image?: File;
  is_active?: boolean;
  sort_order?: number;
  meta_data?: string;
}

/**
 * Request structure for updating a service
 */
export interface IUpdateServiceRequest {
  id: string; // service_id for URL
  category_id?: string; // Category ID (optional - backend will use default if not provided)
  name?: string;
  description?: string;
  image?: File;
  image_url?: string | null; // Send null to delete image, string to set URL, undefined to keep existing
  is_active?: boolean;
  sort_order?: number;
  meta_data?: string;
}

/**
 * Response structure for create service endpoint
 */
export interface ICreateServiceResponse {
  status: number;
  message: string;
  data: IService | null;
}

/**
 * Response structure for update service endpoint
 */
export interface IUpdateServiceResponse {
  success: boolean;
  message: string;
  data: IService | null;
}

/**
 * Response structure for delete service endpoint
 */
export interface IDeleteServiceResponse {
  status: number;
  message: string;
  data: null;
}

/**
 * Error response structure
 */
export interface IApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
