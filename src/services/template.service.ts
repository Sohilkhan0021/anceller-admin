/**
 * Notification Template Service
 * 
 * handles HTTP requests for notification templates
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
    IGetTemplatesParams,
    IGetTemplatesResponse,
    IGetTemplateDetailResponse,
    ICreateTemplateRequest,
    ICreateTemplateResponse,
    IUpdateTemplateRequest,
    IUpdateTemplateResponse,
    IDeleteTemplateResponse,
} from './template.types';

/**
 * Base URL for template management
 */
const TEMPLATE_BASE_URL = `${API_URL}/admin/templates`;

/**
 * Get all notification templates with optional filters
 * 
 * @param params - Query parameters (channel, search)
 * @returns Promise resolving to templates data
 */
export const getTemplates = async (
    params: IGetTemplatesParams = {}
): Promise<IGetTemplatesResponse> => {
    try {
        const response = await axios.get<IGetTemplatesResponse>(TEMPLATE_BASE_URL, {
            params,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch templates');
        }
        throw new Error('An unexpected error occurred while fetching templates');
    }
};

/**
 * Get template details by ID
 * 
 * @param templateId - ID of the template to fetch
 * @returns Promise resolving to template details
 */
export const getTemplateById = async (
    templateId: string
): Promise<IGetTemplateDetailResponse> => {
    try {
        const response = await axios.get<IGetTemplateDetailResponse>(`${TEMPLATE_BASE_URL}/${templateId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch template details');
        }
        throw new Error('An unexpected error occurred while fetching template details');
    }
};

/**
 * Create a new notification template
 * 
 * @param data - Template data to create
 * @returns Promise resolving to creation response
 */
export const createTemplate = async (
    data: ICreateTemplateRequest
): Promise<ICreateTemplateResponse> => {
    try {
        const response = await axios.post<ICreateTemplateResponse>(TEMPLATE_BASE_URL, data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to create template');
        }
        throw new Error('An unexpected error occurred while creating template');
    }
};

/**
 * Update an existing notification template
 * 
 * @param templateId - ID of the template to update
 * @param data - Updated template data
 * @returns Promise resolving to update response
 */
export const updateTemplate = async (
    templateId: string,
    data: IUpdateTemplateRequest
): Promise<IUpdateTemplateResponse> => {
    try {
        const response = await axios.put<IUpdateTemplateResponse>(`${TEMPLATE_BASE_URL}/${templateId}`, data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update template');
        }
        throw new Error('An unexpected error occurred while updating template');
    }
};

/**
 * Delete a notification template
 * 
 * @param templateId - ID of the template to delete
 * @returns Promise resolving to deletion response
 */
export const deleteTemplate = async (
    templateId: string
): Promise<IDeleteTemplateResponse> => {
    try {
        const response = await axios.delete<IDeleteTemplateResponse>(`${TEMPLATE_BASE_URL}/${templateId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to delete template');
        }
        throw new Error('An unexpected error occurred while deleting template');
    }
};

/**
 * Template Service Object
 */
export const templateService = {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
};
