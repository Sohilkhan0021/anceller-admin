/**
 * Category Management Hooks
 * 
 * Custom React hooks for category management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, useMutation, UseQueryResult, UseMutationResult } from 'react-query';
import { categoryService } from './category.service';
import type {
  IGetCategoriesParams,
  IGetCategoriesResponse,
  ICategory,
  IPaginationMeta,
  ICreateCategoryRequest,
  ICreateCategoryResponse,
  IUpdateCategoryRequest,
  IUpdateCategoryResponse,
  IDeleteCategoryResponse,
} from './category.types';

/**
 * Hook return type for better type safety
 */
export interface IUseCategoriesReturn {
  categories: ICategory[];
  pagination: IPaginationMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Custom hook to fetch categories with filters
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * @returns Categories data, loading state, error state, and refetch function
 * 
 * @example
 * ```tsx
 * const { categories, pagination, isLoading, isError, error, refetch } = useCategories({
 *   page: 1,
 *   limit: 10,
 *   status: 'active',
 *   search: 'electrical'
 * });
 * ```
 */
export const useCategories = (
  params: IGetCategoriesParams = {},
  options?: {
    enabled?: boolean;
    keepPreviousData?: boolean;
    refetchOnWindowFocus?: boolean;
  }
): IUseCategoriesReturn => {
  const {
    page = 1,
    limit = 10,
    status = '',
    search = '',
  } = params;

  // Build params object, excluding empty strings
  const queryParams: IGetCategoriesParams = {
    page,
    limit,
  };

  if (status && status.trim() !== '') {
    queryParams.status = status;
  }
  if (search && search.trim() !== '') {
    queryParams.search = search;
  }

  const queryResult: UseQueryResult<IGetCategoriesResponse, Error> = useQuery(
    ['categories', page, limit, status, search],
    () => categoryService.getCategories(queryParams),
    {
      enabled: options?.enabled !== false,
      keepPreviousData: options?.keepPreviousData ?? true,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
      staleTime: 30000, // Consider data fresh for 30 seconds
      cacheTime: 300000, // Cache data for 5 minutes
    }
  );

  // Normalize categories data - convert snake_case to camelCase
  const normalizedCategories = (queryResult.data?.data?.categories || []).map((category: any) => {
    // Normalize status: handle 'Active'/'Inactive' (capitalized) or boolean is_active
    let normalizedStatus = 'inactive';
    if (category.status) {
      normalizedStatus = category.status.toLowerCase();
    } else if (category.is_active === true || category.is_active === 'true') {
      normalizedStatus = 'active';
    } else if (category.is_active === false || category.is_active === 'false') {
      normalizedStatus = 'inactive';
    }
    
    return {
      ...category,
      id: category.id || category.public_id || category.category_id,
      displayOrder: category.displayOrder ?? category.display_order ?? undefined,
      iconUrl: category.iconUrl ?? category.icon_url ?? undefined,
      icon: category.icon ?? category.icon_name ?? undefined,
      imageUrl: category.imageUrl ?? category.image_url ?? undefined,
      status: normalizedStatus,
      is_active: normalizedStatus === 'active',
    };
  });

  return {
    categories: normalizedCategories,
    pagination: queryResult.data?.data?.pagination || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching,
  };
};

/**
 * Custom hook to create a new category
 * 
 * @returns Mutation result for creating a category
 */
export const useCreateCategory = (options?: {
  onSuccess?: (data: ICreateCategoryResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<ICreateCategoryResponse, Error, ICreateCategoryRequest> => {
  return useMutation(
    (data: ICreateCategoryRequest) => categoryService.createCategory(data),
    {
      onSuccess: (data) => {
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
 * Custom hook to update an existing category
 * 
 * @returns Mutation result for updating a category
 */
export const useUpdateCategory = (options?: {
  onSuccess?: (data: IUpdateCategoryResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IUpdateCategoryResponse, Error, IUpdateCategoryRequest> => {
  return useMutation(
    (data: IUpdateCategoryRequest) => categoryService.updateCategory(data),
    {
      onSuccess: (data) => {
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
 * Custom hook to delete a category
 * 
 * @returns Mutation result for deleting a category
 */
export const useDeleteCategory = (options?: {
  onSuccess?: (data: IDeleteCategoryResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<IDeleteCategoryResponse, Error, string> => {
  return useMutation(
    (categoryId: string) => categoryService.deleteCategory(categoryId),
    {
      onSuccess: (data) => {
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
