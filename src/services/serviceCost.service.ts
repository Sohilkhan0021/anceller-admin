import axios from 'axios';
import { API_URL } from '@/config/api.config';

const SERVICE_COST_BASE_URL = `${API_URL}/admin/service-cost-config`;

export interface IServiceCostConfig {
  config_id: string;
  service_cost_amount: number;
  free_service_threshold: number;
  service_cost_tax_rate: number;
  order_tax_rate: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  description?: string | null;
  created_by?: {
    user_id: string;
    name: string;
    email: string;
  } | null;
  updated_by?: {
    user_id: string;
    name: string;
    email: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface IServiceCostConfigListResponse {
  configs: IServiceCostConfig[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ICreateServiceCostConfig {
  service_cost_amount: number;
  free_service_threshold: number;
  service_cost_tax_rate: number;
  order_tax_rate: number;
  is_active?: boolean;
  valid_from?: string;
  valid_until?: string | null;
  description?: string;
}

export interface IUpdateServiceCostConfig {
  service_cost_amount?: number;
  free_service_threshold?: number;
  service_cost_tax_rate?: number;
  order_tax_rate?: number;
  is_active?: boolean;
  valid_from?: string;
  valid_until?: string | null;
  description?: string;
}

export const getServiceCostConfigs = async (params?: {
  page?: number;
  limit?: number;
  is_active?: boolean;
}): Promise<IServiceCostConfigListResponse> => {
  try {
    const response = await axios.get<{ status: number; message: string; data: IServiceCostConfigListResponse }>(
      SERVICE_COST_BASE_URL,
      { params }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch service cost configurations');
    }
    throw new Error('An unexpected error occurred while fetching service cost configurations');
  }
};

export const getActiveServiceCostConfig = async (): Promise<IServiceCostConfig> => {
  try {
    const response = await axios.get<{ status: number; message: string; data: IServiceCostConfig }>(
      `${SERVICE_COST_BASE_URL}/active`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch active service cost configuration');
    }
    throw new Error('An unexpected error occurred while fetching active service cost configuration');
  }
};

export const getServiceCostConfigById = async (configId: string): Promise<IServiceCostConfig> => {
  try {
    const response = await axios.get<{ status: number; message: string; data: IServiceCostConfig }>(
      `${SERVICE_COST_BASE_URL}/${configId}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch service cost configuration');
    }
    throw new Error('An unexpected error occurred while fetching service cost configuration');
  }
};

export const createServiceCostConfig = async (data: ICreateServiceCostConfig): Promise<IServiceCostConfig> => {
  try {
    const response = await axios.post<{ status: number; message: string; data: IServiceCostConfig }>(
      SERVICE_COST_BASE_URL,
      data
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create service cost configuration';
      
      // Log detailed error for debugging
      console.error('Service cost config creation error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage
      });
      
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while creating service cost configuration');
  }
};

export const updateServiceCostConfig = async (
  configId: string,
  data: IUpdateServiceCostConfig
): Promise<IServiceCostConfig> => {
  try {
    const response = await axios.put<{ status: number; message: string; data: IServiceCostConfig }>(
      `${SERVICE_COST_BASE_URL}/${configId}`,
      data
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update service cost configuration');
    }
    throw new Error('An unexpected error occurred while updating service cost configuration');
  }
};

export const deleteServiceCostConfig = async (configId: string): Promise<void> => {
  try {
    await axios.delete(`${SERVICE_COST_BASE_URL}/${configId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete service cost configuration');
    }
    throw new Error('An unexpected error occurred while deleting service cost configuration');
  }
};
