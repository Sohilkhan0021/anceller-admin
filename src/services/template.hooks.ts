/**
 * Notification Template Management Hooks
 * 
 * Custom React hooks for template management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult, useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { templateService } from './template.service';
import type {
    IGetTemplatesParams,
    IGetTemplatesResponse,
    IGetTemplateDetailResponse,
    ICreateTemplateRequest,
    ICreateTemplateResponse,
    IUpdateTemplateRequest,
    IUpdateTemplateResponse,
    IDeleteTemplateResponse,
    ITemplate,
} from './template.types';

/**
 * Hook return type for fetch templates
 */
export interface IUseTemplatesReturn {
    templates: ITemplate[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    isFetching: boolean;
}

/**
 * Custom hook to fetch templates with optional filters
 * 
 * @param params - Query parameters (channel, search)
 * @param options - Query options
 * @returns Templates data and status
 */
export const useTemplates = (
    params: IGetTemplatesParams = {},
    options?: { enabled?: boolean }
): IUseTemplatesReturn => {
    const queryResult: UseQueryResult<IGetTemplatesResponse['data'], Error> = useQuery(
        ['templates', params],
        () => templateService.getTemplates(params),
        {
            enabled: options?.enabled !== false,
            staleTime: 30000,
        }
    );

    return {
        templates: queryResult.data?.templates || [],
        isLoading: queryResult.isLoading,
        isError: queryResult.isError,
        error: queryResult.error || null,
        refetch: queryResult.refetch,
        isFetching: queryResult.isFetching,
    };
};

/**
 * Hook to fetch template detail by ID
 * 
 * @param templateId - ID of the template to fetch
 * @param options - Query options
 * @returns Template detail and status
 */
export const useTemplateDetail = (
    templateId: string | undefined,
    options?: { enabled?: boolean }
): {
    template: ITemplate | null;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
} => {
    const queryResult: UseQueryResult<IGetTemplateDetailResponse['data'], Error> = useQuery(
        ['template-detail', templateId],
        () => templateService.getTemplateById(templateId!),
        {
            enabled: !!templateId && options?.enabled !== false,
            staleTime: 30000,
        }
    );

    return {
        template: queryResult.data?.template || null,
        isLoading: queryResult.isLoading,
        isError: queryResult.isError,
        error: queryResult.error || null,
    };
};

/**
 * Hook to create a new notification template
 * 
 * @param options - Mutation options
 * @returns Mutation result
 */
export const useCreateTemplate = (options?: {
    onSuccess?: (data: ICreateTemplateResponse) => void;
    onError?: (error: Error) => void;
}): UseMutationResult<ICreateTemplateResponse, Error, ICreateTemplateRequest> => {
    const queryClient = useQueryClient();

    return useMutation(
        (data: ICreateTemplateRequest) => templateService.createTemplate(data),
        {
            onSuccess: (responseData) => {
                queryClient.invalidateQueries(['templates']);
                const fullResponse: ICreateTemplateResponse = { 
                    status: 201, 
                    message: 'Template created successfully', 
                    data: responseData 
                };
                if (options?.onSuccess) options.onSuccess(fullResponse);
            },
            onError: (error: Error) => {
                if (options?.onError) options.onError(error);
            },
        }
    ) as unknown as UseMutationResult<ICreateTemplateResponse, Error, ICreateTemplateRequest>;
};

/**
 * Hook to update an existing notification template
 * 
 * @param options - Mutation options
 * @returns Mutation result
 */
export const useUpdateTemplate = (options?: {
    onSuccess?: (data: IUpdateTemplateResponse) => void;
    onError?: (error: Error) => void;
}): UseMutationResult<IUpdateTemplateResponse['data'], Error, { id: string; data: IUpdateTemplateRequest }> => {
    const queryClient = useQueryClient();

    return useMutation(
        ({ id, data }) => templateService.updateTemplate(id, data),
        {
            onSuccess: (data, variables) => {
                queryClient.invalidateQueries(['templates']);
                queryClient.invalidateQueries(['template-detail', variables.id]);
                if (options?.onSuccess) options.onSuccess({ status: 200, message: 'Success', data } as IUpdateTemplateResponse);
            },
            onError: (error) => {
                if (options?.onError) options.onError(error);
            },
        }
    );
};

/**
 * Hook to delete a notification template
 * 
 * @param options - Mutation options
 * @returns Mutation result
 */
export const useDeleteTemplate = (options?: {
    onSuccess?: (data: IDeleteTemplateResponse) => void;
    onError?: (error: Error) => void;
}): UseMutationResult<IDeleteTemplateResponse['data'], Error, string> => {
    const queryClient = useQueryClient();

    return useMutation(
        (id: string) => templateService.deleteTemplate(id),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(['templates']);
                if (options?.onSuccess) options.onSuccess({ status: 200, message: 'Success', data: null } as IDeleteTemplateResponse);
            },
            onError: (error) => {
                if (options?.onError) options.onError(error);
            },
        }
    );
};
