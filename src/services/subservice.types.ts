/**
 * Sub-Service Management Types
 * 
 * Type definitions for sub-service management API responses and data structures
 */

/**
 * Sub-service status enum
 */
export type SubServiceStatus = 'active' | 'inactive';

/**
 * Sub-service entity interface
 */
export interface ISubService {
  id: string;
  name: string;
  service_id?: string;
  serviceId?: string; // Normalized camelCase
  categoryId?: string; // For backward compatibility
  icon?: string;
  image?: string;
  image_url?: string; // Snake case version from API
  status: SubServiceStatus;
  displayOrder?: number; // Optional as API might not always return it
  display_order?: number; // Snake case version from API
  // Additional fields that might come from API
  public_id?: string;
  description?: string;
  base_price?: number;
  duration_minutes?: number;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

/**
 * Query parameters for fetching sub-services
 */
export interface IGetSubServicesParams {
  page?: number;
  limit?: number;
  search?: string;
  service_id?: string;
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
 * API response structure for get sub-services endpoint
 */
export interface IGetSubServicesResponse {
  success: boolean;
  data: {
    subServices: ISubService[];
    sub_services?: ISubService[]; // Snake case version
    pagination: IPaginationMeta;
  };
  message?: string;
}

/**
 * Response structure for sub-service deletion
 */
export interface IDeleteSubServiceResponse {
  status: number;
  message: string;
  data: null;
}

/**
 * Request structure for updating a sub-service
 */
export interface IUpdateSubServiceRequest {
  service_id?: string;
  name?: string;
  description?: string;
  image?: File;
  image_url?: string;
  base_price?: number;
  currency?: string;
  duration_minutes?: number;
  skills_tags?: string[] | string;
  is_active?: boolean;
  sort_order?: number;
  meta_data?: string | object;
}

/**
 * Response structure for sub-service update
 */
export interface IUpdateSubServiceResponse {
  status: number;
  message: string;
  data: {
    sub_service_id: string;
    name?: string;
    description?: string;
    image_url?: string | null;
    base_price?: string;
    currency?: string;
    duration_minutes?: number;
    is_active?: boolean;
    sort_order?: number;
    service?: {
      service_id: string;
      name: string;
      category?: {
        category_id: string;
        name: string;
        icon_url?: string | null;
      } | null;
    };
    category?: {
      category_id: string;
      name: string;
      icon_url?: string | null;
    } | null;
    created_at?: string;
    updated_at?: string;
  };
}

/**
 * Error response structure
 */
export interface IApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

