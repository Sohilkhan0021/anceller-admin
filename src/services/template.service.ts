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
    ITemplate,
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
): Promise<IGetTemplatesResponse['data']> => {
    try {
        const response = await axios.get<{ status: number; message: string; data: { templates: ITemplate[] } }>(TEMPLATE_BASE_URL, {
            params,
        });
        // Backend returns { status: 1, message, data: { templates } }
        return { templates: response.data.data.templates };
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
): Promise<IGetTemplateDetailResponse['data']> => {
    try {
        const response = await axios.get<{ status: number; message: string; data: { template: ITemplate } }>(`${TEMPLATE_BASE_URL}/${templateId}`);
        // Backend returns { status: 1, message, data: { template } }
        return { template: response.data.data.template };
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
): Promise<ICreateTemplateResponse['data']> => {
    try {
        const response = await axios.post<{ status: number; message: string; data: { template_id: string } }>(TEMPLATE_BASE_URL, data);
        // Backend returns { status: 1, message, data: { template_id } }
        return { template_id: response.data.data.template_id };
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
): Promise<IUpdateTemplateResponse['data']> => {
    try {
        const response = await axios.put<{ status: number; message: string; data: { template_id: string } }>(`${TEMPLATE_BASE_URL}/${templateId}`, data);
        // Backend returns { status: 1, message, data: { template_id } }
        return { template_id: response.data.data.template_id };
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
): Promise<IDeleteTemplateResponse['data']> => {
    try {
        const response = await axios.delete<{ status: number; message: string; data: null }>(`${TEMPLATE_BASE_URL}/${templateId}`);
        // Backend returns { status: 1, message, data: null }
        return null;
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
