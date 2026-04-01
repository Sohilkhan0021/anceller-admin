/**
 * Service Area Types
 * Admin-managed geographic service areas
 */

export interface IServiceArea {
  area_id: string;
  public_id?: string;
  area_name: string;
  description?: string | null;
  center_latitude?: string | null;
  center_longitude?: string | null;
  radius_km?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  landmark?: string | null;
  is_active: boolean;
  provider_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IProviderServiceAreaAssignment {
  assignment_id: string;
  provider: {
    provider_id: string;
    public_id: string;
    business_name?: string | null;
    contact_name?: string | null;
  };
  service_area: {
    area_id: string;
    public_id: string;
    area_name: string;
  };
  is_active: boolean;
  assigned_at: string;
  notes?: string | null;
}

export interface IGetServiceAreasParams {
  page?: number;
  limit?: number;
  is_active?: boolean | string;
  city?: string;
  state?: string;
  search?: string;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IGetServiceAreasResponse {
  areas: IServiceArea[];
  pagination: IPaginationMeta;
}

export interface IGetServiceAreaDetailResponse {
  area_id: string;
  public_id: string;
  area_name: string;
  description?: string | null;
  center_latitude?: string | null;
  center_longitude?: string | null;
  radius_km?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  landmark?: string | null;
  is_active: boolean;
  created_by?: {
    user_id: string;
    name?: string;
    email?: string;
  } | null;
  providers?: IProviderServiceAreaAssignment[];
  created_at?: string;
  updated_at?: string;
}

export interface ICreateServiceAreaRequest {
  area_name: string;
  description?: string | null;
  center_latitude: number;
  center_longitude: number;
  radius_km?: number;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  landmark?: string | null;
  is_active?: boolean;
}

export interface IUpdateServiceAreaRequest {
  area_name?: string;
  description?: string | null;
  center_latitude?: number;
  center_longitude?: number;
  radius_km?: number;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  landmark?: string | null;
  is_active?: boolean;
}

export interface IAssignServiceAreaRequest {
  provider_id: string;
  notes?: string | null;
}

export interface IRemoveServiceAreaRequest {
  provider_id: string;
}

