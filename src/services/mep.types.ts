/**
 * MEP Management Types
 * 
 * Type definitions for MEP management API responses and data structures
 */

export type MEPStatus = 'active' | 'inactive';

export interface IMEPProject {
  id: string;
  project_id?: string;
  name: string;
  description?: string;
  status: MEPStatus;
  sort_order?: number;
  image_url?: string;
  imageUrl?: string;
  meta_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface IMEPProjectItem {
  id: string;
  project_item_id?: string;
  project_id: string;
  name: string;
  description?: string;
  status: MEPStatus;
  sort_order?: number;
  image_url?: string;
  imageUrl?: string;
  meta_data?: any;
  project?: {
    project_id: string;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface IMEPItem {
  id: string;
  item_id?: string;
  project_item_id: string;
  name: string;
  description?: string;
  status: MEPStatus;
  sort_order?: number;
  image_url?: string;
  imageUrl?: string;
  quantity?: string | number;
  unit?: string;
  meta_data?: any;
  project_item?: {
    project_item_id: string;
    name: string;
    project?: {
      project_id: string;
      name: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

export interface IGetMEPProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface IGetMEPProjectItemsParams {
  page?: number;
  limit?: number;
  search?: string;
  project_id?: string;
  status?: string;
}

export interface IGetMEPItemsParams {
  page?: number;
  limit?: number;
  search?: string;
  project_item_id?: string;
  status?: string;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IGetMEPProjectsResponse {
  status: number;
  message: string;
  data: {
    projects: IMEPProject[];
    pagination: IPaginationMeta;
  };
}

export interface IGetMEPProjectItemsResponse {
  status: number;
  message: string;
  data: {
    project_items: IMEPProjectItem[];
    pagination: IPaginationMeta;
  };
}

export interface IGetMEPItemsResponse {
  status: number;
  message: string;
  data: {
    items: IMEPItem[];
    pagination: IPaginationMeta;
  };
}

export interface ICreateMEPProjectRequest {
  name: string;
  description?: string;
  image?: File | null;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
  meta_data?: string;
}

export interface ICreateMEPProjectItemRequest {
  project_id: string;
  name: string;
  description?: string;
  image?: File | null;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
  meta_data?: string;
}

export interface ICreateMEPItemRequest {
  project_item_id: string;
  name: string;
  description?: string;
  image?: File | null;
  image_url?: string;
  quantity?: number | string;
  unit?: string;
  sort_order?: number;
  is_active?: boolean;
  meta_data?: string | object;
}

export interface ICreateMEPProjectResponse {
  status: number;
  message: string;
  data: {
    project_id: string;
  };
}

export interface ICreateMEPProjectItemResponse {
  status: number;
  message: string;
  data: {
    project_item_id: string;
  };
}

export interface ICreateMEPItemResponse {
  status: number;
  message: string;
  data: {
    item_id: string;
  };
}

export interface IUpdateMEPProjectRequest extends Partial<ICreateMEPProjectRequest> {
  id: string;
}

export interface IUpdateMEPProjectItemRequest extends Partial<ICreateMEPProjectItemRequest> {
  id: string;
}

export interface IUpdateMEPItemRequest extends Partial<ICreateMEPItemRequest> {
  id: string;
}

export interface IUpdateMEPProjectResponse {
  status: number;
  message: string;
  data: {
    project_id: string;
  };
}

export interface IUpdateMEPProjectItemResponse {
  status: number;
  message: string;
  data: {
    project_item: IMEPProjectItem;
  };
}

export interface IUpdateMEPItemResponse {
  status: number;
  message: string;
  data: {
    item: IMEPItem;
  };
}

export interface IDeleteMEPResponse {
  status: number;
  message: string;
  data: null;
}
