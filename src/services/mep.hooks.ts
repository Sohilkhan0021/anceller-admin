/**
 * MEP Management Hooks
 * 
 * Custom React hooks for MEP management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient } from 'react-query';
import { mepService } from './mep.service';
import type {
  IGetMEPProjectsParams,
  IGetMEPProjectsResponse,
  IGetMEPProjectItemsParams,
  IGetMEPProjectItemsResponse,
  IGetMEPItemsParams,
  IGetMEPItemsResponse,
  ICreateMEPProjectRequest,
  ICreateMEPProjectResponse,
  IUpdateMEPProjectRequest,
  IUpdateMEPProjectResponse,
  ICreateMEPProjectItemRequest,
  ICreateMEPProjectItemResponse,
  IUpdateMEPProjectItemRequest,
  IUpdateMEPProjectItemResponse,
  ICreateMEPItemRequest,
  ICreateMEPItemResponse,
  IUpdateMEPItemRequest,
  IUpdateMEPItemResponse,
  IDeleteMEPResponse,
  IPaginationMeta,
} from './mep.types';

/**
 * Hook return type for better type safety
 */
export interface IUseProjectsReturn {
  projects: any[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch projects with filters
 */
export const useProjects = (
  params: IGetMEPProjectsParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseProjectsReturn => {
  const {
    page = 1,
    limit = 10,
    status = '',
    search = '',
  } = params;

  const queryParams: IGetMEPProjectsParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetMEPProjectsResponse, Error> = useQuery(
    ['mep-projects', page, limit, status, search],
    () => mepService.getProjects(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );

  const normalizedProjects = (queryResult.data?.data?.projects || []).map((project: any) => {
    let normalizedStatus = 'inactive';
    if (project.status) {
      normalizedStatus = project.status.toLowerCase();
    } else if (project.is_active === true || project.is_active === 'true') {
      normalizedStatus = 'active';
    } else if (project.is_active === false || project.is_active === 'false') {
      normalizedStatus = 'inactive';
    }
    
    return {
      ...project,
      id: project.id || project.public_id || project.project_id,
      displayOrder: project.displayOrder ?? project.sort_order ?? undefined,
      imageUrl: project.imageUrl ?? project.image_url ?? undefined,
      status: normalizedStatus,
      is_active: normalizedStatus === 'active',
    };
  });

  return {
    projects: normalizedProjects,
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Custom hook to create a new project
 */
export const useCreateProject = (options?: {
  onSuccess?: (data: ICreateMEPProjectResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<ICreateMEPProjectResponse, Error, ICreateMEPProjectRequest> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: ICreateMEPProjectRequest) => mepService.createProject(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['mep-projects']);
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );
};

/**
 * Custom hook to update an existing project
 */
export const useUpdateProject = (options?: {
  onSuccess?: (data: IUpdateMEPProjectResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IUpdateMEPProjectResponse, Error, IUpdateMEPProjectRequest> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: IUpdateMEPProjectRequest) => mepService.updateProject(data.id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['mep-projects']);
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );
};

/**
 * Custom hook to delete a project
 */
export const useDeleteProject = (options?: {
  onSuccess?: (data: IDeleteMEPResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IDeleteMEPResponse, Error, string> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (projectId: string) => mepService.deleteProject(projectId),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['mep-projects']);
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );
};

/**
 * Hook return type for project items
 */
export interface IUseProjectItemsReturn {
  projectItems: any[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch project items with filters
 */
export const useProjectItems = (
  params: IGetMEPProjectItemsParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseProjectItemsReturn => {
  const {
    page = 1,
    limit = 10,
    status = '',
    project_id = '',
    search = '',
  } = params;

  const queryParams: IGetMEPProjectItemsParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (project_id && project_id.trim() !== '') {
    queryParams.project_id = project_id;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetMEPProjectItemsResponse, Error> = useQuery(
    ['mep-project-items', page, limit, status, project_id, search],
    () => mepService.getProjectItems(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );

  const normalizedProjectItems = (queryResult.data?.data?.project_items || []).map((item: any) => {
    let normalizedStatus = 'inactive';
    if (item.status) {
      normalizedStatus = item.status.toLowerCase();
    } else if (item.is_active === true || item.is_active === 'true') {
      normalizedStatus = 'active';
    } else if (item.is_active === false || item.is_active === 'false') {
      normalizedStatus = 'inactive';
    }
    
    return {
      ...item,
      id: item.id || item.public_id || item.project_item_id,
      project_id: item.project_id || item.project?.id || item.project?.project_id || item.project?.public_id,
      project_name: item.project_name || item.project?.name || '—',
      displayOrder: item.displayOrder ?? item.sort_order ?? undefined,
      imageUrl: item.imageUrl ?? item.image_url ?? undefined,
      status: normalizedStatus,
      is_active: normalizedStatus === 'active',
    };
  });

  return {
    projectItems: normalizedProjectItems,
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Custom hook to create a new project item
 */
export const useCreateProjectItem = (options?: {
  onSuccess?: (data: ICreateMEPProjectItemResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<ICreateMEPProjectItemResponse, Error, ICreateMEPProjectItemRequest> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: ICreateMEPProjectItemRequest) => mepService.createProjectItem(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['mep-project-items']);
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );
};

/**
 * Custom hook to update an existing project item
 */
export const useUpdateProjectItem = (options?: {
  onSuccess?: (data: IUpdateMEPProjectItemResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IUpdateMEPProjectItemResponse, Error, IUpdateMEPProjectItemRequest> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: IUpdateMEPProjectItemRequest) => mepService.updateProjectItem(data.id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['mep-project-items']);
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );
};

/**
 * Custom hook to delete a project item
 */
export const useDeleteProjectItem = (options?: {
  onSuccess?: (data: IDeleteMEPResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IDeleteMEPResponse, Error, string> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (projectItemId: string) => mepService.deleteProjectItem(projectItemId),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['mep-project-items']);
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );
};

/**
 * Hook return type for items
 */
export interface IUseItemsReturn {
  items: any[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch items with filters
 */
export const useItems = (
  params: IGetMEPItemsParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseItemsReturn => {
  const {
    page = 1,
    limit = 10,
    status = '',
    project_item_id = '',
    search = '',
  } = params;

  const queryParams: IGetMEPItemsParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (project_item_id && project_item_id.trim() !== '') {
    queryParams.project_item_id = project_item_id;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetMEPItemsResponse, Error> = useQuery(
    ['mep-items', page, limit, status, project_item_id, search],
    () => mepService.getItems(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000,
      cacheTime: 300000,
    }
  );

  const normalizedItems = (queryResult.data?.data?.items || []).map((item: any) => {
    let normalizedStatus = 'inactive';
    if (item.status) {
      normalizedStatus = item.status.toLowerCase();
    } else if (item.is_active === true || item.is_active === 'true') {
      normalizedStatus = 'active';
    } else if (item.is_active === false || item.is_active === 'false') {
      normalizedStatus = 'inactive';
    }
    
    // Extract price from item.price or meta_data.price
    let price = item.price;
    if (!price && item.meta_data) {
      if (typeof item.meta_data === 'object' && item.meta_data.price) {
        price = typeof item.meta_data.price === 'number' ? item.meta_data.price : parseFloat(item.meta_data.price);
      }
    }
    
    return {
      ...item,
      id: item.id || item.public_id || item.item_id,
      project_item_id: item.project_item_id || item.project_item?.id || item.project_item?.project_item_id || item.project_item?.public_id,
      project_item_name: item.project_item_name || item.project_item?.name || '—',
      displayOrder: item.displayOrder ?? item.sort_order ?? undefined,
      imageUrl: item.imageUrl ?? item.image_url ?? undefined,
      price: price || undefined,
      status: normalizedStatus,
      is_active: normalizedStatus === 'active',
    };
  });

  return {
    items: normalizedItems,
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Custom hook to create a new item
 */
export const useCreateItem = (options?: {
  onSuccess?: (data: ICreateMEPItemResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<ICreateMEPItemResponse, Error, ICreateMEPItemRequest> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: ICreateMEPItemRequest) => mepService.createItem(data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['mep-items']);
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );
};

/**
 * Custom hook to update an existing item
 */
export const useUpdateItem = (options?: {
  onSuccess?: (data: IUpdateMEPItemResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IUpdateMEPItemResponse, Error, IUpdateMEPItemRequest> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: IUpdateMEPItemRequest) => mepService.updateItem(data.id, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['mep-items']);
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );
};

/**
 * Custom hook to delete an item
 */
export const useDeleteItem = (options?: {
  onSuccess?: (data: IDeleteMEPResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IDeleteMEPResponse, Error, string> => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (itemId: string) => mepService.deleteItem(itemId),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['mep-items']);
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: (error) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    }
  );
};
