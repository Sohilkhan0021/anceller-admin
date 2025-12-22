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
    IPolicy,
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
export const getPolicies = async (): Promise<IGetPoliciesResponse['data']> => {
    try {
        const response = await axios.get<{ status: number; message: string; data: { policies: IPolicy[] } }>(POLICY_BASE_URL);
        // Backend returns { status: 1, message, data: { policies } }
        return { policies: response.data.data.policies };
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
): Promise<IGetPolicyDetailResponse['data']> => {
    try {
        const response = await axios.get<{ status: number; message: string; data: { policy: IPolicy } }>(`${POLICY_BASE_URL}/${policyId}`);
        // Backend returns { status: 1, message, data: { policy } }
        return { policy: response.data.data.policy };
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
): Promise<ICreatePolicyResponse['data']> => {
    try {
        const response = await axios.post<{ status: number; message: string; data: { policy_id: string } }>(POLICY_BASE_URL, data);
        // Backend returns { status: 1, message, data: { policy_id } }
        return { policy_id: response.data.data.policy_id };
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
): Promise<IUpdatePolicyResponse['data']> => {
    try {
        const response = await axios.put<{ status: number; message: string; data: { policy_id: string; version: string } }>(`${POLICY_BASE_URL}/${policyId}`, data);
        // Backend returns { status: 1, message, data: { policy_id, version } }
        return { policy_id: response.data.data.policy_id, version: response.data.data.version };
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
): Promise<IPublishPolicyResponse['data']> => {
    try {
        const response = await axios.post<{ status: number; message: string; data: { policy_id: string } }>(`${POLICY_BASE_URL}/${policyId}/publish`);
        // Backend returns { status: 1, message, data: { policy_id } }
        return { policy_id: response.data.data.policy_id };
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
