/**
 * Service Area Service
 *
 * Admin-side API wrapper for managing geographic service areas
 */

import axios from 'axios';
import { API_URL } from '@/config/api.config';
import type {
  IServiceArea,
  IGetServiceAreasParams,
  IGetServiceAreasResponse,
  IGetServiceAreaDetailResponse,
  ICreateServiceAreaRequest,
  IUpdateServiceAreaRequest,
  IAssignServiceAreaRequest,
  IRemoveServiceAreaRequest,
} from './serviceArea.types';

const SERVICE_AREA_BASE_URL = `${API_URL}/admin/service-areas`;

export const getServiceAreas = async (
  params: IGetServiceAreasParams = {}
): Promise<IGetServiceAreasResponse> => {
  try {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.is_active !== undefined) queryParams.is_active = params.is_active;
    if (params.city) queryParams.city = params.city;
    if (params.state) queryParams.state = params.state;
    if (params.search) queryParams.search = params.search;

    const response = await axios.get<{ status: number; message: string; data: IGetServiceAreasResponse }>(
      SERVICE_AREA_BASE_URL,
      { params: queryParams }
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch service areas');
    }
    throw new Error('An unexpected error occurred while fetching service areas');
  }
};

export const getServiceAreaById = async (
  areaId: string
): Promise<IGetServiceAreaDetailResponse> => {
  try {
    const response = await axios.get<{ status: number; message: string; data: IGetServiceAreaDetailResponse }>(
      `${SERVICE_AREA_BASE_URL}/${areaId}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch service area details');
    }
    throw new Error('An unexpected error occurred while fetching service area details');
  }
};

export const createServiceArea = async (
  data: ICreateServiceAreaRequest
): Promise<IServiceArea> => {
  try {
    const response = await axios.post<{ status: number; message: string; data: IServiceArea }>(
      SERVICE_AREA_BASE_URL,
      data
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create service area');
    }
    throw new Error('An unexpected error occurred while creating service area');
  }
};

export const updateServiceArea = async (
  areaId: string,
  data: IUpdateServiceAreaRequest
): Promise<IServiceArea> => {
  try {
    const response = await axios.put<{ status: number; message: string; data: IServiceArea }>(
      `${SERVICE_AREA_BASE_URL}/${areaId}`,
      data
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update service area');
    }
    throw new Error('An unexpected error occurred while updating service area');
  }
};

export const deleteServiceArea = async (areaId: string): Promise<void> => {
  try {
    await axios.delete<{ status: number; message: string }>(
      `${SERVICE_AREA_BASE_URL}/${areaId}`
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete service area');
    }
    throw new Error('An unexpected error occurred while deleting service area');
  }
};

export const assignServiceAreaToProvider = async (
  areaId: string,
  data: IAssignServiceAreaRequest
): Promise<void> => {
  try {
    await axios.post<{ status: number; message: string }>(
      `${SERVICE_AREA_BASE_URL}/${areaId}/assign`,
      data
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to assign service area to provider');
    }
    throw new Error('An unexpected error occurred while assigning service area to provider');
  }
};

export const removeServiceAreaFromProvider = async (
  areaId: string,
  data: IRemoveServiceAreaRequest
): Promise<void> => {
  try {
    await axios.post<{ status: number; message: string }>(
      `${SERVICE_AREA_BASE_URL}/${areaId}/remove`,
      data
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to remove service area from provider');
    }
    throw new Error('An unexpected error occurred while removing service area from provider');
  }
};

