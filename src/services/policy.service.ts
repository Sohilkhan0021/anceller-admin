/**
 * Policy Service
 * 
 * Service layer for policy management API operations
 * Handles all HTTP requests related to policy management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
    IGetPoliciesResponse,
    IGetPolicyDetailResponse,
    ICreatePolicyRequest,
    ICreatePolicyResponse,
    IUpdatePolicyRequest,
    IUpdatePolicyResponse,
    IPublishPolicyResponse,
} from './policy.types';

/**
 * Base URL for policy management endpoints
 */
const POLICY_BASE_URL = `${API_URL}/admin/policies`;

/**
 * Get all policies
 * 
 * @returns Promise resolving to policies data
 * @throws Error if API request fails
 */
export const getPolicies = async (): Promise<IGetPoliciesResponse> => {
    try {
        const response = await axios.get<IGetPoliciesResponse>(POLICY_BASE_URL);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch policies');
        }
        throw new Error('An unexpected error occurred while fetching policies');
    }
};

/**
 * Get policy details by ID (includes version history)
 * 
 * @param policyId - ID of the policy to fetch
 * @returns Promise resolving to policy details
 * @throws Error if API request fails
 */
export const getPolicyById = async (
    policyId: string
): Promise<IGetPolicyDetailResponse> => {
    try {
        const response = await axios.get<IGetPolicyDetailResponse>(`${POLICY_BASE_URL}/${policyId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch policy details');
        }
        throw new Error('An unexpected error occurred while fetching policy details');
    }
};

/**
 * Create a new policy
 * 
 * @param data - Policy data to create
 * @returns Promise resolving to creation response
 * @throws Error if API request fails
 */
export const createPolicy = async (
    data: ICreatePolicyRequest
): Promise<ICreatePolicyResponse> => {
    try {
        const response = await axios.post<ICreatePolicyResponse>(POLICY_BASE_URL, data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to create policy');
        }
        throw new Error('An unexpected error occurred while creating policy');
    }
};

/**
 * Update an existing policy (creates a new version)
 * 
 * @param policyId - ID of the policy to update
 * @param data - Updated policy data
 * @returns Promise resolving to update response
 * @throws Error if API request fails
 */
export const updatePolicy = async (
    policyId: string,
    data: IUpdatePolicyRequest
): Promise<IUpdatePolicyResponse> => {
    try {
        const response = await axios.put<IUpdatePolicyResponse>(`${POLICY_BASE_URL}/${policyId}`, data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update policy');
        }
        throw new Error('An unexpected error occurred while updating policy');
    }
};

/**
 * Publish a policy version
 * 
 * @param policyId - ID of the policy to publish
 * @returns Promise resolving to publish response
 * @throws Error if API request fails
 */
export const publishPolicy = async (
    policyId: string
): Promise<IPublishPolicyResponse> => {
    try {
        const response = await axios.post<IPublishPolicyResponse>(`${POLICY_BASE_URL}/${policyId}/publish`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to publish policy');
        }
        throw new Error('An unexpected error occurred while publishing policy');
    }
};

/**
 * Policy Service Object
 */
export const policyService = {
    getPolicies,
    getPolicyById,
    createPolicy,
    updatePolicy,
    publishPolicy,
};
