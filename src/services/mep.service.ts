/**
 * MEP Service
 * 
 * Enterprise-level service layer for MEP management API operations
 * Handles all HTTP requests related to MEP management
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IGetMEPProjectsParams,
  IGetMEPProjectsResponse,
  IGetMEPProjectItemsParams,
  IGetMEPProjectItemsResponse,
  IGetMEPItemsParams,
  IGetMEPItemsResponse,
  ICreateMEPProjectRequest,
  ICreateMEPProjectResponse,
  ICreateMEPProjectItemRequest,
  ICreateMEPProjectItemResponse,
  ICreateMEPItemRequest,
  ICreateMEPItemResponse,
  IUpdateMEPProjectRequest,
  IUpdateMEPProjectResponse,
  IUpdateMEPProjectItemRequest,
  IUpdateMEPProjectItemResponse,
  IUpdateMEPItemRequest,
  IUpdateMEPItemResponse,
  IDeleteMEPResponse,
} from './mep.types';

const PROJECT_BASE_URL = `${API_URL}/admin/mep/projects`;
const PROJECT_ITEM_BASE_URL = `${API_URL}/admin/mep/project-items`;
const ITEM_BASE_URL = `${API_URL}/admin/mep/items`;

// Projects
export const getProjects = async (
  params: IGetMEPProjectsParams = {}
): Promise<IGetMEPProjectsResponse> => {
  try {
    const queryParams: Record<string, string | number> = {};
    if (params.page !== undefined && params.page > 0) queryParams.page = params.page;
    if (params.limit !== undefined && params.limit > 0) queryParams.limit = params.limit;
    if (params.status && params.status.trim() !== '' && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams.search = params.search;
    }

    const response = await axios.get<IGetMEPProjectsResponse>(PROJECT_BASE_URL, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      let errorMessage = 'An error occurred while fetching projects';
      if (responseData?.message) errorMessage = responseData.message;
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while fetching projects');
  }
};

export const getProjectById = async (projectId: string) => {
  try {
    const response = await axios.get(`${PROJECT_BASE_URL}/${projectId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to fetch project details');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const createProject = async (
  data: ICreateMEPProjectRequest
): Promise<ICreateMEPProjectResponse> => {
  try {
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      throw new Error('Project name is required');
    }

    const formData = new FormData();
    formData.append('name', data.name.trim());
    if (data.description && data.description.trim()) {
      formData.append('description', data.description.trim());
    }
    if (data.image) {
      formData.append('image', data.image);
    }
    if (data.image_url) {
      formData.append('image_url', data.image_url);
    }
    if (data.sort_order !== undefined && data.sort_order !== null) {
      formData.append('sort_order', data.sort_order.toString());
    }
    const isActive = data.is_active !== undefined ? data.is_active : true;
    formData.append('is_active', isActive.toString());
    if (data.meta_data && data.meta_data.trim()) {
      formData.append('meta_data', data.meta_data);
    }

    const response = await axios.post<ICreateMEPProjectResponse>(PROJECT_BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to create project');
    }
    throw new Error('An unexpected error occurred while creating project');
  }
};

export const updateProject = async (
  projectId: string,
  data: Partial<ICreateMEPProjectRequest>
): Promise<IUpdateMEPProjectResponse> => {
  try {
    const formData = new FormData();
    if (data.name !== undefined) formData.append('name', data.name.trim());
    if (data.description !== undefined) {
      formData.append('description', data.description ? data.description.trim() : '');
    }
    if (data.image) {
      formData.append('image', data.image);
    }
    if (data.image_url !== undefined) {
      // IMPORTANT: Send the string 'null' when image_url is null, so backend can detect deletion
      // Backend service checks: if (data.image_url === null || data.image_url === '' || data.image_url === 'null')
      // FormData converts null to string 'null', so we explicitly send 'null' string
      const imageUrlValue = data.image_url === null ? 'null' : (data.image_url || '');
      formData.append('image_url', imageUrlValue);
    }
    if (data.sort_order !== undefined) {
      formData.append('sort_order', data.sort_order.toString());
    }
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }
    if (data.meta_data !== undefined) {
      formData.append('meta_data', data.meta_data || '');
    }

    const response = await axios.put<IUpdateMEPProjectResponse>(
      `${PROJECT_BASE_URL}/${projectId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to update project');
    }
    throw new Error('An unexpected error occurred while updating project');
  }
};

export const deleteProject = async (projectId: string): Promise<IDeleteMEPResponse> => {
  try {
    const response = await axios.delete<IDeleteMEPResponse>(`${PROJECT_BASE_URL}/${projectId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to delete project');
    }
    throw new Error('An unexpected error occurred while deleting project');
  }
};

// Project Items
export const getProjectItems = async (
  params: IGetMEPProjectItemsParams = {}
): Promise<IGetMEPProjectItemsResponse> => {
  try {
    const queryParams: Record<string, string | number> = {};
    if (params.page !== undefined && params.page > 0) queryParams.page = params.page;
    if (params.limit !== undefined && params.limit > 0) queryParams.limit = params.limit;
    if (params.status && params.status.trim() !== '' && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params.project_id && params.project_id.trim() !== '') {
      queryParams.project_id = params.project_id;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams.search = params.search;
    }

    const response = await axios.get<IGetMEPProjectItemsResponse>(PROJECT_ITEM_BASE_URL, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to fetch project items');
    }
    throw new Error('An unexpected error occurred while fetching project items');
  }
};

export const getProjectItemById = async (projectItemId: string) => {
  try {
    const response = await axios.get(`${PROJECT_ITEM_BASE_URL}/${projectItemId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to fetch project item details');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const createProjectItem = async (
  data: ICreateMEPProjectItemRequest
): Promise<ICreateMEPProjectItemResponse> => {
  try {
    if (!data.name || !data.project_id) {
      throw new Error('Project item name and project_id are required');
    }

    const formData = new FormData();
    formData.append('project_id', data.project_id);
    formData.append('name', data.name.trim());
    if (data.description && data.description.trim()) {
      formData.append('description', data.description.trim());
    }
    if (data.image) {
      formData.append('image', data.image);
    }
    if (data.image_url) {
      formData.append('image_url', data.image_url);
    }
    if (data.sort_order !== undefined) {
      formData.append('sort_order', data.sort_order.toString());
    }
    const isActive = data.is_active !== undefined ? data.is_active : true;
    formData.append('is_active', isActive.toString());
    if (data.meta_data && data.meta_data.trim()) {
      formData.append('meta_data', data.meta_data);
    }

    const response = await axios.post<ICreateMEPProjectItemResponse>(
      PROJECT_ITEM_BASE_URL,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to create project item');
    }
    throw new Error('An unexpected error occurred while creating project item');
  }
};

export const updateProjectItem = async (
  projectItemId: string,
  data: Partial<ICreateMEPProjectItemRequest>
): Promise<IUpdateMEPProjectItemResponse> => {
  try {
    const formData = new FormData();
    if (data.project_id) formData.append('project_id', data.project_id);
    if (data.name !== undefined) formData.append('name', data.name.trim());
    if (data.description !== undefined) {
      formData.append('description', data.description ? data.description.trim() : '');
    }
    if (data.image) {
      formData.append('image', data.image);
    }
    if (data.image_url !== undefined) {
      // IMPORTANT: Send the string 'null' when image_url is null, so backend can detect deletion
      // Backend service checks: if (data.image_url === null || data.image_url === '' || data.image_url === 'null')
      // FormData converts null to string 'null', so we explicitly send 'null' string
      const imageUrlValue = data.image_url === null ? 'null' : (data.image_url || '');
      formData.append('image_url', imageUrlValue);
    }
    if (data.sort_order !== undefined) {
      formData.append('sort_order', data.sort_order.toString());
    }
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }
    if (data.meta_data !== undefined) {
      formData.append('meta_data', data.meta_data || '');
    }

    const response = await axios.put<IUpdateMEPProjectItemResponse>(
      `${PROJECT_ITEM_BASE_URL}/${projectItemId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to update project item');
    }
    throw new Error('An unexpected error occurred while updating project item');
  }
};

export const deleteProjectItem = async (projectItemId: string): Promise<IDeleteMEPResponse> => {
  try {
    const response = await axios.delete<IDeleteMEPResponse>(
      `${PROJECT_ITEM_BASE_URL}/${projectItemId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to delete project item');
    }
    throw new Error('An unexpected error occurred while deleting project item');
  }
};

// Items
export const getItems = async (
  params: IGetMEPItemsParams = {}
): Promise<IGetMEPItemsResponse> => {
  try {
    const queryParams: Record<string, string | number> = {};
    if (params.page !== undefined && params.page > 0) queryParams.page = params.page;
    if (params.limit !== undefined && params.limit > 0) queryParams.limit = params.limit;
    if (params.status && params.status.trim() !== '' && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params.project_item_id && params.project_item_id.trim() !== '') {
      queryParams.project_item_id = params.project_item_id;
    }
    if (params.sub_service_id && params.sub_service_id.trim() !== '') {
      queryParams.sub_service_id = params.sub_service_id;
    }
    if (params.search && params.search.trim() !== '') {
      queryParams.search = params.search;
    }

    const response = await axios.get<IGetMEPItemsResponse>(ITEM_BASE_URL, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to fetch items');
    }
    throw new Error('An unexpected error occurred while fetching items');
  }
};

export const getItemById = async (itemId: string) => {
  try {
    const response = await axios.get(`${ITEM_BASE_URL}/${itemId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to fetch item details');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const createItem = async (
  data: ICreateMEPItemRequest
): Promise<ICreateMEPItemResponse> => {
  try {
    if (!data.name || !data.project_item_id) {
      throw new Error('Item name and project_item_id are required');
    }

    const formData = new FormData();
    formData.append('project_item_id', data.project_item_id);
    formData.append('name', data.name.trim());
    if (data.description && data.description.trim()) {
      formData.append('description', data.description.trim());
    }
    if (data.image) {
      formData.append('image', data.image);
    }
    if (data.image_url) {
      formData.append('image_url', data.image_url);
    }
    if (data.quantity !== undefined && data.quantity !== null && data.quantity !== '') {
      formData.append('quantity', data.quantity.toString());
    }
    if (data.unit) {
      formData.append('unit', data.unit);
    }
    if (data.sort_order !== undefined) {
      formData.append('sort_order', data.sort_order.toString());
    }
    const isActive = data.is_active !== undefined ? data.is_active : true;
    formData.append('is_active', isActive.toString());
    if (data.meta_data) {
      // Handle meta_data as object or string
      if (typeof data.meta_data === 'object' && data.meta_data !== null) {
        formData.append('meta_data', JSON.stringify(data.meta_data));
      } else if (typeof data.meta_data === 'string' && data.meta_data.trim()) {
        formData.append('meta_data', data.meta_data);
      }
    }

    const response = await axios.post<ICreateMEPItemResponse>(ITEM_BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to create item');
    }
    throw new Error('An unexpected error occurred while creating item');
  }
};

export const updateItem = async (
  itemId: string,
  data: Partial<ICreateMEPItemRequest>
): Promise<IUpdateMEPItemResponse> => {
  try {
    const formData = new FormData();
    if (data.project_item_id) formData.append('project_item_id', data.project_item_id);
    if (data.name !== undefined) formData.append('name', data.name.trim());
    if (data.description !== undefined) {
      formData.append('description', data.description ? data.description.trim() : '');
    }
    if (data.image) {
      formData.append('image', data.image);
    }
    if (data.image_url !== undefined) {
      // IMPORTANT: Send the string 'null' when image_url is null, so backend can detect deletion
      // Backend service checks: if (data.image_url === null || data.image_url === '' || data.image_url === 'null')
      // FormData converts null to string 'null', so we explicitly send 'null' string
      const imageUrlValue = data.image_url === null ? 'null' : (data.image_url || '');
      formData.append('image_url', imageUrlValue);
    }
    if (data.quantity !== undefined) {
      formData.append('quantity', data.quantity ? data.quantity.toString() : '');
    }
    if (data.unit !== undefined) {
      formData.append('unit', data.unit || '');
    }
    if (data.sort_order !== undefined) {
      formData.append('sort_order', data.sort_order.toString());
    }
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString());
    }
    if (data.meta_data !== undefined) {
      // Handle meta_data as object or string
      if (typeof data.meta_data === 'object' && data.meta_data !== null) {
        formData.append('meta_data', JSON.stringify(data.meta_data));
      } else if (typeof data.meta_data === 'string') {
        formData.append('meta_data', data.meta_data || '');
      }
    }

    const response = await axios.put<IUpdateMEPItemResponse>(
      `${ITEM_BASE_URL}/${itemId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to update item');
    }
    throw new Error('An unexpected error occurred while updating item');
  }
};

export const deleteItem = async (itemId: string): Promise<IDeleteMEPResponse> => {
  try {
    const response = await axios.delete<IDeleteMEPResponse>(`${ITEM_BASE_URL}/${itemId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      throw new Error(responseData?.message || 'Failed to delete item');
    }
    throw new Error('An unexpected error occurred while deleting item');
  }
};

/**
 * MEP Service Object
 * 
 * Centralized service object for all MEP-related operations
 * This pattern allows for easy extension and testing
 */
export const mepService = {
  // Projects
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  // Project Items
  getProjectItems,
  getProjectItemById,
  createProjectItem,
  updateProjectItem,
  deleteProjectItem,
  // Items
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
