/**
 * Roles & Permissions Hooks
 * 
 * Custom React hooks for roles and permissions operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult } from 'react-query';
import { roleService } from './role.service';
import type {
  IGetRolesParams,
  IGetRolesResponse,
  IGetRoleByIdResponse,
  IGetPermissionsResponse,
  IRole,
  IPermissionModule,
  IPaginationMeta,
  ICreateRoleRequest,
  IUpdateRoleRequest,
  ICreatePermissionRequest,
  IUpdatePermissionRequest,
} from './role.types';

/**
 * Hook return type for better type safety
 */
export interface IUseRolesReturn {
  roles: IRole[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch roles with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * @returns Roles data, loading state, error state, and refetch function
 */
export const useRoles = (
  params: IGetRolesParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseRolesReturn => {
  const {
    page = 1,
    limit = 20,
    status = '',
    search = '',
  } = params;

  const queryResult: UseQueryResult<IGetRolesResponse, Error> = useQuery(
    ['roles', page, limit, status, search],
    () => roleService.getRoles({ page, limit, status, search }),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  return {
    roles: queryResult.data?.data?.roles || [],
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Custom hook to fetch a single role by ID
 * 
 * @param roleId - ID of the role to fetch
 * @param options - Additional React Query options
 * @returns Role data, loading state, error state, and refetch function
 */
export const useRole = (
  roleId: string | null,
  options?: {
    enabled?: boolean;
  }
) => {
  const queryResult: UseQueryResult<IGetRoleByIdResponse, Error> = useQuery(
    ['role', roleId],
    () => roleService.getRoleById(roleId!),
    {
      enabled: options?.enabled !== false && roleId !== null,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );

  return {
    role: queryResult.data?.data?.role || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
};

/**
 * Custom hook to fetch permissions
 * 
 * @param options - Additional React Query options
 * @returns Permissions data grouped by module, loading state, error state, and refetch function
 */
export const usePermissions = (options?: {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}) => {
  const queryResult: UseQueryResult<IGetPermissionsResponse, Error> = useQuery(
    ['permissions'],
    () => roleService.getPermissions(),
    {
      enabled: options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 60000, // Consider data fresh for 1 minute (permissions change less frequently)
      cacheTime: 600000, // Cache data for 10 minutes
    }
  );

  return {
    permissions: queryResult.data?.data?.permissions || [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
  };
};

/**
 * Custom hook to create a new role
 * 
 * @returns Mutation object with createRole function and loading/error states
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (roleData: ICreateRoleRequest) => roleService.createRole(roleData),
    {
      onSuccess: () => {
        // Invalidate and refetch roles list
        queryClient.invalidateQueries(['roles']);
      },
    }
  );
};

/**
 * Custom hook to update a role
 * 
 * @returns Mutation object with updateRole function and loading/error states
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ roleId, roleData }: { roleId: string; roleData: IUpdateRoleRequest }) =>
      roleService.updateRole(roleId, roleData),
    {
      onSuccess: (_, variables) => {
        // Invalidate and refetch roles list and specific role
        queryClient.invalidateQueries(['roles']);
        queryClient.invalidateQueries(['role', variables.roleId]);
      },
    }
  );
};

/**
 * Custom hook to delete a role
 * 
 * @returns Mutation object with deleteRole function and loading/error states
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (roleId: string) => roleService.deleteRole(roleId),
    {
      onSuccess: () => {
        // Invalidate and refetch roles list
        queryClient.invalidateQueries(['roles']);
      },
    }
  );
};

/**
 * Custom hook to create a new permission
 * 
 * @returns Mutation object with createPermission function and loading/error states
 */
export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (permissionData: ICreatePermissionRequest) =>
      roleService.createPermission(permissionData),
    {
      onSuccess: () => {
        // Invalidate and refetch permissions list
        queryClient.invalidateQueries(['permissions']);
      },
    }
  );
};

/**
 * Custom hook to update a permission
 * 
 * @returns Mutation object with updatePermission function and loading/error states
 */
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({
      permissionId,
      permissionData,
    }: {
      permissionId: string;
      permissionData: IUpdatePermissionRequest;
    }) => roleService.updatePermission(permissionId, permissionData),
    {
      onSuccess: () => {
        // Invalidate and refetch permissions list
        queryClient.invalidateQueries(['permissions']);
        // Also invalidate roles since they depend on permissions
        queryClient.invalidateQueries(['roles']);
      },
    }
  );
};

/**
 * Custom hook to delete a permission
 * 
 * @returns Mutation object with deletePermission function and loading/error states
 */
export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (permissionId: string) => roleService.deletePermission(permissionId),
    {
      onSuccess: () => {
        // Invalidate and refetch permissions list
        queryClient.invalidateQueries(['permissions']);
        // Also invalidate roles since they depend on permissions
        queryClient.invalidateQueries(['roles']);
      },
    }
  );
};

