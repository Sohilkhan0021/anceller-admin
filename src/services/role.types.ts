/**
 * Roles & Permissions Types
 * 
 * Type definitions for roles and permissions API responses and data structures
 */

/**
 * Role status enum
 */
export type RoleStatus = 'active' | 'inactive';

/**
 * Permission detail interface
 */
export interface IPermissionDetail {
  permission_id: string;
  name: string;
  module: string;
  description?: string | null;
}

/**
 * Role entity interface
 */
export interface IRole {
  role_id: string;
  name: string; // Display name (human-readable)
  role_name?: string; // Actual role name for API usage (lowercase, matches UserRole enum)
  description?: string | null;
  permissions: string[]; // Array of permission names
  permissions_detail?: IPermissionDetail[];
  permissions_count?: number;
  users_count: number;
  status: RoleStatus;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Permission action interface
 */
export interface IPermissionAction {
  permission_id: string;
  permission: string; // Full permission name (e.g., "users:view")
  name: string; // Display name (e.g., "View")
  description?: string | null;
}

/**
 * Permission module interface
 */
export interface IPermissionModule {
  module: string;
  actions: IPermissionAction[];
}

/**
 * Query parameters for fetching roles
 */
export interface IGetRolesParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive' | '';
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
}

/**
 * API response structure for get roles endpoint
 */
export interface IGetRolesResponse {
  success: boolean;
  data: {
    roles: IRole[];
    pagination: IPaginationMeta;
  };
  message?: string;
}

/**
 * API response structure for get role by ID endpoint
 */
export interface IGetRoleByIdResponse {
  success: boolean;
  data: {
    role: IRole;
  };
  message?: string;
}

/**
 * API response structure for get permissions endpoint
 */
export interface IGetPermissionsResponse {
  success: boolean;
  data: {
    permissions: IPermissionModule[];
  };
  message?: string;
}

/**
 * Request payload for creating a new role
 */
export interface ICreateRoleRequest {
  name: string;
  display_name?: string;
  description?: string;
  is_active?: boolean;
  permissions?: string[]; // Array of permission names
}

/**
 * Request payload for updating a role
 */
export interface IUpdateRoleRequest {
  display_name?: string;
  description?: string;
  is_active?: boolean;
  permissions?: string[]; // Array of permission names
}

/**
 * API response structure for create/update role endpoint
 */
export interface ICreateRoleResponse {
  success: boolean;
  data: {
    role: IRole;
  };
  message?: string;
}

/**
 * API response structure for delete role endpoint
 */
export interface IDeleteRoleResponse {
  success: boolean;
  data: null;
  message?: string;
}

/**
 * Request payload for creating a new permission
 */
export interface ICreatePermissionRequest {
  name: string;
  module: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Request payload for updating a permission
 */
export interface IUpdatePermissionRequest {
  name?: string;
  module?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * API response structure for create/update permission endpoint
 */
export interface ICreatePermissionResponse {
  success: boolean;
  data: {
    permission_id: string;
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

