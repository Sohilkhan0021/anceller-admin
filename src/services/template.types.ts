/**
 * Notification Template Management Types
 */

/**
 * Template channel enum
 */
export type TemplateChannel = 'EMAIL' | 'PUSH' | 'SMS';

/**
 * Template status
 */
export type TemplateStatus = 'active' | 'inactive' | 'draft';

/**
 * Template entity interface
 */
export interface ITemplate {
    template_id: string;
    name: string;
    channel: TemplateChannel;
    subject: string;
    body: string;
    variables: string[];
    is_active: boolean;
    status: string;
    last_modified: string;
    created_at: string;
    updated_at: string;
}

/**
 * Query parameters for fetching templates
 */
export interface IGetTemplatesParams {
    channel?: TemplateChannel;
    search?: string;
}

/**
 * API response structure for get templates endpoint
 */
export interface IGetTemplatesResponse {
    status: number;
    message: string;
    data: {
        templates: ITemplate[];
    };
}

/**
 * API response structure for get template detail
 */
export interface IGetTemplateDetailResponse {
    status: number;
    message: string;
    data: {
        template: ITemplate;
    };
}

/**
 * Create template request interface
 */
export interface ICreateTemplateRequest {
    name: string;
    channel: TemplateChannel;
    subject?: string;
    body: string;
}

/**
 * API response structure for create template
 */
export interface ICreateTemplateResponse {
    status: number;
    message: string;
    data: {
        template_id: string;
    };
}

/**
 * Update template request interface
 */
export interface IUpdateTemplateRequest {
    name?: string;
    channel?: TemplateChannel;
    subject?: string;
    body?: string;
}

/**
 * API response structure for update template
 */
export interface IUpdateTemplateResponse {
    status: number;
    message: string;
    data: {
        template_id: string;
    };
}

/**
 * API response structure for delete template
 */
export interface IDeleteTemplateResponse {
    status: number;
    message: string;
    data: null;
}
