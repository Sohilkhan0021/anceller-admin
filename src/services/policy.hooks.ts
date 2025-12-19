/**
 * Policy Management Hooks
 * 
 * Custom React hooks for policy management operations
 * Uses React Query for data fetching, caching, and state management
 */

import { useQuery, UseQueryResult, useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { policyService } from './policy.service';
import type {
    IGetPoliciesResponse,
    IGetPolicyDetailResponse,
    ICreatePolicyRequest,
    ICreatePolicyResponse,
    IUpdatePolicyRequest,
    IUpdatePolicyResponse,
    IPublishPolicyResponse,
    IPolicy,
} from './policy.types';

/**
 * Hook return type for fetch policies
 */
export interface IUsePoliciesReturn {
    policies: IPolicy[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    isFetching: boolean;
}

/**
 * Custom hook to fetch all policies
 */
export const usePolicies = (options?: {
    enabled?: boolean;
}): IUsePoliciesReturn => {
    const queryResult: UseQueryResult<IGetPoliciesResponse, Error> = useQuery(
        ['policies'],
        () => policyService.getPolicies(),
        {
            enabled: options?.enabled !== false,
            staleTime: 30000,
        }
    );

    return {
        policies: queryResult.data?.data?.policies || [],
        isLoading: queryResult.isLoading,
        isError: queryResult.isError,
        error: queryResult.error || null,
        refetch: queryResult.refetch,
        isFetching: queryResult.isFetching,
    };
};

/**
 * Hook to fetch policy detail by ID
 */
export const usePolicyDetail = (
    policyId: string | undefined,
    options?: { enabled?: boolean }
): {
    policy: IPolicy | null;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
} => {
    const queryResult: UseQueryResult<IGetPolicyDetailResponse, Error> = useQuery(
        ['policy-detail', policyId],
        () => policyService.getPolicyById(policyId!),
        {
            enabled: !!policyId && options?.enabled !== false,
            staleTime: 30000,
        }
    );

    return {
        policy: queryResult.data?.data?.policy || null,
        isLoading: queryResult.isLoading,
        isError: queryResult.isError,
        error: queryResult.error || null,
        refetch: queryResult.refetch,
    };
};

/**
 * Hook to create a new policy
 */
export const useCreatePolicy = (options?: {
    onSuccess?: (data: ICreatePolicyResponse) => void;
    onError?: (error: Error) => void;
}): UseMutationResult<ICreatePolicyResponse, Error, ICreatePolicyRequest> => {
    const queryClient = useQueryClient();

    return useMutation(
        (data: ICreatePolicyRequest) => policyService.createPolicy(data),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(['policies']);
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (error) => {
                if (options?.onError) options.onError(error);
            },
        }
    );
};

/**
 * Hook to update an existing policy
 */
export const useUpdatePolicy = (options?: {
    onSuccess?: (data: IUpdatePolicyResponse) => void;
    onError?: (error: Error) => void;
}): UseMutationResult<IUpdatePolicyResponse, Error, { id: string; data: IUpdatePolicyRequest }> => {
    const queryClient = useQueryClient();

    return useMutation(
        ({ id, data }) => policyService.updatePolicy(id, data),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(['policies']);
                queryClient.invalidateQueries(['policy-detail', data.data.policy_id]);
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (error) => {
                if (options?.onError) options.onError(error);
            },
        }
    );
};

/**
 * Hook to publish a policy
 */
export const usePublishPolicy = (options?: {
    onSuccess?: (data: IPublishPolicyResponse) => void;
    onError?: (error: Error) => void;
}): UseMutationResult<IPublishPolicyResponse, Error, string> => {
    const queryClient = useQueryClient();

    return useMutation(
        (id: string) => policyService.publishPolicy(id),
        {
            onSuccess: (data, id) => {
                queryClient.invalidateQueries(['policies']);
                queryClient.invalidateQueries(['policy-detail', id]);
                if (options?.onSuccess) options.onSuccess(data);
            },
            onError: (error) => {
                if (options?.onError) options.onError(error);
            },
        }
    );
};
