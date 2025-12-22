/**
 * Policy Management Types
 * 
 * Type definitions for policy management API responses and data structures
 */

/**
 * Policy type enum
 * Backend accepts: TERMS_AND_CONDITIONS, PRIVACY_POLICY, REFUND_POLICY, CODE_OF_CONDUCT
 */
export type PolicyTitleType =
    | 'TERMS_AND_CONDITIONS'
    | 'PRIVACY_POLICY'
    | 'REFUND_POLICY'
    | 'CODE_OF_CONDUCT';

/**
 * Policy status
 */
export type PolicyStatus = 'draft' | 'published' | 'archived';

/**
 * Version history interface
 */
export interface IVersionHistory {
    version: string;
    date: string;
    author: string;
    changes: string;
}

/**
 * Policy entity interface
 */
export interface IPolicy {
    policy_id: string;
    policy_type: string;
    title: string;
    version: string;
    is_published: boolean;
    last_modified: string;
    published_at: string | null;
    published_by: string | null;
    version_count: number;
    content?: string;
    version_history?: IVersionHistory[];
}

/**
 * API response structure for get policies list
 */
export interface IGetPoliciesResponse {
    status: number;
    message: string;
    data: {
        policies: IPolicy[];
    };
}

/**
 * API response structure for get policy by ID (with detail)
 */
export interface IGetPolicyDetailResponse {
    status: number;
    message: string;
    data: {
        policy: IPolicy;
    };
}

/**
 * Create policy request interface
 */
export interface ICreatePolicyRequest {
    policy_type: string;
    title: PolicyTitleType;
    content: string;
}

/**
 * API response structure for create policy
 */
export interface ICreatePolicyResponse {
    status: number;
    message: string;
    data: {
        policy_id: string;
    };
}

/**
 * Update policy request interface
 */
export interface IUpdatePolicyRequest {
    title: PolicyTitleType;
    content: string;
    changes: string;
    is_published: boolean;
}

/**
 * API response structure for update policy
 */
export interface IUpdatePolicyResponse {
    status: number;
    message: string;
    data: {
        policy_id: string;
        version: string;
    };
}

/**
 * API response structure for publish policy
 */
export interface IPublishPolicyResponse {
    status: number;
    message: string;
    data: {
        policy_id: string;
    };
}
