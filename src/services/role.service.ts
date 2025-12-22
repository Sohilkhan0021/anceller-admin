/**
 * Role Service
 * 
 * Enterprise-level service layer for roles and permissions API operations
 * Handles all HTTP requests related to roles and permissions management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetRolesParams,
  IGetRolesResponse,
  IGetRoleByIdResponse,
  IGetPermissionsResponse,
  ICreateRoleRequest,
  ICreateRoleResponse,
  IUpdateRoleRequest,
  IDeleteRoleResponse,
  ICreatePermissionRequest,
  ICreatePermissionResponse,
  IUpdatePermissionRequest,
  IApiError,
} from './role.types';

/**
 * Base URL for roles and permissions endpoints
 */
const ROLES_BASE_URL = `${API_URL}/admin/roles`;
const PERMISSIONS_BASE_URL = `${API_URL}/admin/permissions`;

/**
 * Get all roles with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to roles data with pagination
 * @throws Error if API request fails
 */
export const getRoles = async (
  params: IGetRolesParams = {}
): Promise<IGetRolesResponse> => {
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

    const response = await axios.get<IGetRolesResponse>(ROLES_BASE_URL, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while fetching roles',
      };
      throw new Error(apiError.message);
    }

    // Handle unexpected errors
    throw new Error('An unexpected error occurred while fetching roles');
  }
};

/**
 * Get role details by ID
 * 
 * @param roleId - ID of the role to fetch
 * @returns Promise resolving to role details
 */
export const getRoleById = async (
  roleId: string
): Promise<IGetRoleByIdResponse> => {
  try {
    const response = await axios.get<IGetRoleByIdResponse>(
      `${ROLES_BASE_URL}/${roleId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error fetching role details',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching role details');
  }
};

/**
 * Create a new role
 * 
 * @param roleData - Role data to create
 * @returns Promise resolving to created role data
 */
export const createRole = async (
  roleData: ICreateRoleRequest
): Promise<ICreateRoleResponse> => {
  try {
    const response = await axios.post<ICreateRoleResponse>(
      ROLES_BASE_URL,
      roleData
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while creating role',
      };
      // Propagate the error message from backend
      throw new Error(apiError.message || 'Failed to create role');
    }
    throw new Error('An unexpected error occurred while creating role');
  }
};

/**
 * Update a role
 * 
 * @param roleId - ID of the role to update
 * @param roleData - Role data to update
 * @returns Promise resolving to updated role data
 */
export const updateRole = async (
  roleId: string,
  roleData: IUpdateRoleRequest
): Promise<ICreateRoleResponse> => {
  try {
    const response = await axios.put<ICreateRoleResponse>(
      `${ROLES_BASE_URL}/${roleId}`,
      roleData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error updating role',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while updating role');
  }
};

/**
 * Delete a role
 * 
 * @param roleId - ID of the role to delete
 * @returns Promise resolving to delete response
 */
export const deleteRole = async (
  roleId: string
): Promise<IDeleteRoleResponse> => {
  try {
    const response = await axios.delete<IDeleteRoleResponse>(
      `${ROLES_BASE_URL}/${roleId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error deleting role',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while deleting role');
  }
};

/**
 * Get all available permissions
 * 
 * @returns Promise resolving to permissions data grouped by module
 */
export const getPermissions = async (): Promise<IGetPermissionsResponse> => {
  try {
    const response = await axios.get<IGetPermissionsResponse>(
      PERMISSIONS_BASE_URL
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error fetching permissions',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while fetching permissions');
  }
};

/**
 * Create a new permission
 * 
 * @param permissionData - Permission data to create
 * @returns Promise resolving to created permission data
 */
export const createPermission = async (
  permissionData: ICreatePermissionRequest
): Promise<ICreatePermissionResponse> => {
  try {
    const response = await axios.post<ICreatePermissionResponse>(
      PERMISSIONS_BASE_URL,
      permissionData
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'An error occurred while creating permission',
      };
      throw new Error(apiError.message || 'Failed to create permission');
    }
    throw new Error('An unexpected error occurred while creating permission');
  }
};

/**
 * Update a permission
 * 
 * @param permissionId - ID of the permission to update
 * @param permissionData - Permission data to update
 * @returns Promise resolving to updated permission data
 */
export const updatePermission = async (
  permissionId: string,
  permissionData: IUpdatePermissionRequest
): Promise<ICreatePermissionResponse> => {
  try {
    const response = await axios.put<ICreatePermissionResponse>(
      `${PERMISSIONS_BASE_URL}/${permissionId}`,
      permissionData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error updating permission',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while updating permission');
  }
};

/**
 * Delete a permission
 * 
 * @param permissionId - ID of the permission to delete
 * @returns Promise resolving to delete response
 */
export const deletePermission = async (
  permissionId: string
): Promise<IDeleteRoleResponse> => {
  try {
    const response = await axios.delete<IDeleteRoleResponse>(
      `${PERMISSIONS_BASE_URL}/${permissionId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: IApiError = error.response?.data || {
        success: false,
        message: error.message || 'Error deleting permission',
      };
      throw new Error(apiError.message);
    }
    throw new Error('An unexpected error occurred while deleting permission');
  }
};

/**
 * Role Service Object
 * 
 * Centralized service object for all role-related operations
 * This pattern allows for easy extension and testing
 */
export const roleService = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
};

